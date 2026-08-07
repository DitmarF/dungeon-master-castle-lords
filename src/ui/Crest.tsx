import type { CSSProperties } from "react";
import { GameIcon } from "./GameIcon";

interface CrestProps {
  color: string;
  size?: "sm" | "md" | "lg";
}

export function Crest({ color, size = "md" }: CrestProps) {
  return (
    <span
      className={`crest crest--${size}`}
      style={{ "--banner-color": color } as CSSProperties}
      aria-hidden="true"
    >
      <GameIcon name="castle" size={size === "lg" ? 36 : size === "md" ? 24 : 18} />
    </span>
  );
}
