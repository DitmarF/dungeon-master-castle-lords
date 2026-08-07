export type IconName =
  | "castle"
  | "grid"
  | "world"
  | "swords"
  | "plus"
  | "trash"
  | "arrow"
  | "save"
  | "back"
  | "coin"
  | "calendar"
  | "layers"
  | "user"
  | "shield"
  | "lock"
  | "target"
  | "spark"
  | "flag"
  | "eye"
  | "message"
  | "heart";

interface GameIconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function GameIcon({ name, size = 20, className }: GameIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "castle":
      return (
        <svg {...common}>
          <path d="M4 4v16h16V4h-3v3h-3V4h-4v3H7V4H4Z" />
          <path d="M8 20v-5a4 4 0 0 1 8 0v5M4 10h16" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
      );
    case "world":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3.5 9h17M3.5 15h17M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
        </svg>
      );
    case "swords":
      return (
        <svg {...common}>
          <path d="m5 4 5 5-2 2-5-5V3h3ZM19 4l-5 5 2 2 5-5V3h-3Z" />
          <path d="m9 14-5 5M15 14l5 5M3 21l3-1-2-2-1 3ZM21 21l-3-1 2-2 1 3Z" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M14 7l5 5-5 5" />
        </svg>
      );
    case "save":
      return (
        <svg {...common}>
          <path d="M5 3h12l2 2v16H5V3Z" />
          <path d="M8 3v6h8V3M8 21v-7h8v7" />
        </svg>
      );
    case "back":
      return (
        <svg {...common}>
          <path d="m10 5-7 7 7 7M3 12h18" />
        </svg>
      );
    case "coin":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15 8.5c-.8-.6-1.7-.9-3-.9-1.7 0-3 .8-3 2s1.2 1.8 3 2.2c1.8.4 3 1 3 2.3s-1.3 2.2-3 2.2c-1.3 0-2.5-.4-3.3-1M12 5.5v13" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.6 2.8 8.3 7 10 4.2-1.7 7-5.4 7-10V6l-7-3Z" />
          <path d="M12 7v10M8 11h8" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
          <path d="m18.5 16 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" />
        </svg>
      );
    case "flag":
      return (
        <svg {...common}>
          <path d="M5 22V3M5 4h11l-2 4 2 4H5" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "message":
      return (
        <svg {...common}>
          <path d="M4 5h16v11H9l-5 4V5Z" /><path d="M8 9h8M8 12h5" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 20S4 15.5 4 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.5 12 20 12 20Z" />
        </svg>
      );
  }
}
