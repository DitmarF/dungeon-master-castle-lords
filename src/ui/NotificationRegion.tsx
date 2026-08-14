import type { ReactNode } from "react";

interface NotificationRegionProps {
  children: ReactNode;
  label?: string;
  kind?: "success" | "error";
}

export function NotificationRegion({
  children,
  label = "Game notifications",
  kind = "success",
}: NotificationRegionProps) {
  return (
    <div
      className="notification-region"
      role={kind === "error" ? "alert" : "status"}
      aria-live={kind === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      aria-label={label}
    >
      {children ? (
        <div className={`notification-toast notification-toast--${kind}`}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
