import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = process.env.SITES_PROJECT_ROOT || resolve(scriptDirectory, "..");
const executableName = process.platform === "win32" ? "vinext.cmd" : "vinext";
const vinext = resolve(projectRoot, "node_modules", ".bin", executableName);

function parseDuration(value, variableName) {
  const match = /^(\d+(?:\.\d+)?)(ms|s|m|h)$/.exec(value);
  if (!match) {
    throw new Error(
      `${variableName} must be a positive duration using ms, s, m, or h (received ${JSON.stringify(value)}).`,
    );
  }

  const multipliers = { ms: 1, s: 1_000, m: 60_000, h: 3_600_000 };
  const duration = Number(match[1]) * multipliers[match[2]];
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`${variableName} must be greater than zero.`);
  }

  return duration;
}

if (!existsSync(vinext)) {
  console.error(
    "vinext is unavailable. Install locked dependencies for this environment before building.",
  );
  process.exit(69);
}

let timeoutMs;
let killAfterMs;
try {
  timeoutMs = parseDuration(process.env.SITES_BUILD_TIMEOUT || "3m", "SITES_BUILD_TIMEOUT");
  killAfterMs = parseDuration(
    process.env.SITES_BUILD_KILL_AFTER || "10s",
    "SITES_BUILD_KILL_AFTER",
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(64);
}

const useProcessGroup = process.platform !== "win32";
const child = spawn(vinext, ["build"], {
  cwd: projectRoot,
  detached: useProcessGroup,
  env: process.env,
  stdio: "inherit",
});

let didTimeOut = false;
let forceKillTimer;

function signalChild(signal) {
  try {
    if (useProcessGroup) {
      process.kill(-child.pid, signal);
    } else {
      child.kill(signal);
    }
  } catch (error) {
    if (error?.code !== "ESRCH") {
      throw error;
    }
  }
}

const timeoutTimer = setTimeout(() => {
  didTimeOut = true;
  console.error(`Vinext build exceeded ${timeoutMs}ms; sending SIGTERM.`);
  signalChild("SIGTERM");
  forceKillTimer = setTimeout(() => {
    console.error(`Vinext build did not stop within ${killAfterMs}ms; sending SIGKILL.`);
    signalChild("SIGKILL");
  }, killAfterMs);
}, timeoutMs);

child.on("error", (error) => {
  clearTimeout(timeoutTimer);
  clearTimeout(forceKillTimer);
  console.error(`Unable to start Vinext build: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  clearTimeout(timeoutTimer);
  clearTimeout(forceKillTimer);

  if (didTimeOut) {
    process.exitCode = 124;
    return;
  }

  if (code !== null) {
    process.exitCode = code;
    return;
  }

  console.error(`Vinext build exited after receiving ${signal || "an unknown signal"}.`);
  process.exitCode = 1;
});
