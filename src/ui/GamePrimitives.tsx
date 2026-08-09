"use client";

import {
  useId,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type SVGProps,
} from "react";
import { GameIcon } from "./GameIcon";
import { ModalOverlay } from "./ModalOverlay";

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export type PanelVariant = "default" | "raised" | "muted";

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: PanelVariant;
}

export function Panel({
  variant = "default",
  className,
  ...props
}: PanelProps) {
  return (
    <div
      className={classNames("game-panel", `game-panel--${variant}`, className)}
      {...props}
    />
  );
}

export interface StatProps extends HTMLAttributes<HTMLSpanElement> {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
}

export function Stat({ label, value, icon, className, ...props }: StatProps) {
  return (
    <span className={classNames("game-stat", className)} {...props}>
      {icon}
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

export interface ResourceIndicatorProps
  extends HTMLAttributes<HTMLSpanElement> {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
}

export function ResourceIndicator({
  label,
  value,
  icon,
  className,
  ...props
}: ResourceIndicatorProps) {
  return (
    <span
      className={classNames("game-resource-indicator", className)}
      {...props}
    >
      {icon}
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number;
  max: number;
  min?: number;
  valueText?: string;
  showValue?: boolean;
}

export function ProgressBar({
  label,
  value,
  max,
  min = 0,
  valueText,
  showValue = false,
  className,
  ...props
}: ProgressBarProps) {
  const safeMax = Math.max(max, min);
  const safeValue = Math.min(safeMax, Math.max(min, value));
  const range = safeMax - min;
  const percent = range === 0 ? 100 : ((safeValue - min) / range) * 100;

  return (
    <div className={classNames("game-progress", className)} {...props}>
      {showValue ? (
        <span className="game-progress__label">
          <span>{label}</span>
          <strong>{valueText ?? `${safeValue}/${safeMax}`}</strong>
        </span>
      ) : null}
      <span
        className="game-progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        aria-valuetext={valueText}
      >
        <span style={{ width: `${percent}%` }} />
      </span>
    </div>
  );
}

export type ActionButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ActionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export function ActionButton({
  variant = "secondary",
  startIcon,
  endIcon,
  className,
  children,
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={classNames("button", `button--${variant}`, className)}
      {...props}
    >
      {startIcon}
      {children}
      {endIcon}
    </button>
  );
}

export interface SlotProps {
  label: string;
  icon?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  empty?: boolean;
  onActivate?: () => void;
  className?: string;
  children?: ReactNode;
}

export function Slot({
  label,
  icon,
  selected = false,
  disabled = false,
  empty = false,
  onActivate,
  className,
  children,
}: SlotProps) {
  const classes = classNames(
    "game-slot",
    selected && "game-slot--selected",
    disabled && "game-slot--disabled",
    empty && "game-slot--empty",
    className,
  );
  const content = (
    <>
      {icon}
      <span>{children ?? label}</span>
    </>
  );

  if (onActivate) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onActivate}
        disabled={disabled}
        aria-pressed={selected}
        aria-label={label}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={classes}
      aria-label={label}
      aria-disabled={disabled || undefined}
    >
      {content}
    </div>
  );
}

export interface TooltipProps {
  id: string;
  children: ReactNode;
}

export function Tooltip({ id, children }: TooltipProps) {
  return (
    <span className="game-tooltip" id={id} role="tooltip">
      {children}
    </span>
  );
}

export interface InfoSheetProps {
  label: string;
  title: string;
  summary: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function InfoSheet({
  label,
  title,
  summary,
  children,
  className,
  icon,
}: InfoSheetProps) {
  const [open, setOpen] = useState(false);
  const instanceId = useId().replace(/:/g, "");
  const tooltipId = `${instanceId}-tooltip`;
  const titleId = `${instanceId}-title`;

  return (
    <>
      <span className={classNames("game-info", className)}>
        <button
          type="button"
          className="game-info__trigger"
          aria-label={label}
          aria-describedby={tooltipId}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          {icon ?? <GameIcon name="message" size={16} />}
        </button>
        <Tooltip id={tooltipId}>{summary}</Tooltip>
      </span>

      {open ? (
        <ModalOverlay
          backdropClassName="info-sheet-backdrop"
          panelClassName="info-sheet"
          labelledBy={titleId}
          onClose={() => setOpen(false)}
        >
          <header className="info-sheet__header">
            <span className="info-sheet__mark">
              {icon ?? <GameIcon name="message" size={21} />}
            </span>
            <div>
              <span className="section-kicker">Information</span>
              <h2 id={titleId}>{title}</h2>
            </div>
            <button
              type="button"
              className="info-sheet__close"
              onClick={() => setOpen(false)}
              aria-label={`Close ${title}`}
            >
              ×
            </button>
          </header>
          <div className="info-sheet__body">{children}</div>
          <ActionButton variant="primary" onClick={() => setOpen(false)}>
            Close
          </ActionButton>
        </ModalOverlay>
      ) : null}
    </>
  );
}

export interface GridCellProps extends SVGProps<SVGRectElement> {
  selected?: boolean;
  highlighted?: boolean;
  disabled?: boolean;
  reachable?: boolean;
}

export function GridCell({
  selected = false,
  highlighted = false,
  disabled = false,
  reachable = false,
  className,
  ...props
}: GridCellProps) {
  return (
    <rect
      className={classNames(
        "game-grid-cell",
        selected && "game-grid-cell--selected",
        highlighted && "game-grid-cell--highlighted",
        disabled && "game-grid-cell--disabled",
        reachable && "game-grid-cell--reachable",
        className,
      )}
      aria-disabled={disabled || undefined}
      {...props}
    />
  );
}

export type GameTokenVariant = "hero" | "unit" | "marker" | "objective";

export interface GameTokenProps extends Omit<SVGProps<SVGGElement>, "color"> {
  variant: GameTokenVariant;
  color: string;
  label?: string;
  selected?: boolean;
}

type TokenStyle = CSSProperties & { "--game-token-color": string };

export function GameToken({
  variant,
  color,
  label,
  selected = false,
  className,
  style,
  ...props
}: GameTokenProps) {
  const tokenStyle: TokenStyle = {
    ...style,
    "--game-token-color": color,
  };

  return (
    <g
      className={classNames(
        "game-token",
        `game-token--${variant}`,
        selected && "game-token--selected",
        className,
      )}
      style={tokenStyle}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      {variant === "hero" ? (
        <>
          <circle r="16" className="game-token__ring hero-token__ring" />
          <path
            d="M0-12 11-4 8 11 0 15-8 11-11-4Z"
            className="game-token__shape game-token__shape--hero"
          />
          <circle cy="-3" r="3" className="game-token__detail hero-token__head" />
          <path
            d="M-5 8C-4 2 4 2 5 8"
            className="game-token__line hero-token__body"
          />
        </>
      ) : null}

      {variant === "unit" ? (
        <>
          <circle r="15" className="game-token__shape" />
          <path d="M-7 7 0-9 7 7Z" className="game-token__detail" />
        </>
      ) : null}

      {variant === "marker" ? (
        <>
          <circle r="12" className="game-token__shape" />
          <circle r="4" className="game-token__detail" />
        </>
      ) : null}

      {variant === "objective" ? (
        <>
          <circle r="17" className="game-token__aura heart-token__aura" />
          <path
            d="M0-13 12 0 0 13-12 0Z"
            className="game-token__shape heart-token__core"
          />
          <circle r="3.5" className="game-token__detail heart-token__center" />
        </>
      ) : null}
    </g>
  );
}
