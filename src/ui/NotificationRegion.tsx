import type { ReactNode } from "react";

interface NotificationRegionProps {
  children: ReactNode;
  label?: string;
}

export function NotificationRegion({
  children,
  label = "Game notifications",
}: NotificationRegionProps) {
  return (
    <div
      className="notification-region"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={label}
    >
      {children ? <div className="notification-toast">{children}</div> : null}
    </div>
  );
}
