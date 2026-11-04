"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
};

export function AdminPageHeader({ title, description, back, actions }: PageHeaderProps) {
  return (
    <div className="adm-page-header">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="adm-breadcrumb">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {back.label}
          </Link>
        )}
        <h1 className="adm-page-title">{title}</h1>
        {description && <p className="adm-page-desc">{description}</p>}
      </div>
      {actions && <div className="adm-page-actions">{actions}</div>}
    </div>
  );
}

type DialogProps = {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer: ReactNode;
  onClose: () => void;
  /** Prevent closing (Esc / backdrop) while a request is running. */
  busy?: boolean;
  wide?: boolean;
  role?: "dialog" | "alertdialog";
};

/** Accessible modal: Esc + backdrop close, focus moved in and restored, body scroll locked. */
export function AdminDialog({
  title,
  description,
  children,
  footer,
  onClose,
  busy = false,
  wide = false,
  role = "dialog",
}: DialogProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);

  useEffect(() => {
    onCloseRef.current = onClose;
    busyRef.current = busy;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const firstField = panel?.querySelector<HTMLElement>(
      "input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])",
    );
    (firstField ?? panel)?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) {
        event.preventDefault();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div
      className="adm-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`adm-dialog${wide ? " is-wide" : ""}`}
      >
        <div className="adm-dialog-header">
          <h2 id={titleId} className="adm-dialog-title">
            {title}
          </h2>
          {description && (
            <p id={descId} className="adm-dialog-desc">
              {description}
            </p>
          )}
        </div>
        {children && <div className="adm-dialog-body">{children}</div>}
        <div className="adm-dialog-footer">{footer}</div>
      </div>
    </div>
  );
}
