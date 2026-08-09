#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

echo "Running bounded vinext build..."
node "${script_dir}/run-bounded-build.mjs"

"${script_dir}/validate-artifact.sh"
