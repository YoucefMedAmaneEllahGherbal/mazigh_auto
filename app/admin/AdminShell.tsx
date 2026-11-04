"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesCombined,
  ExternalLink,
  LayoutGrid,
  Menu,
  PlusCircle,
  X,
} from "lucide-react";
import { Logo } from "@/app/components/Logo";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Véhicules",
    icon: LayoutGrid,
    match: (p: string) => p === "/admin" || /^\/admin\/voitures\/[^/]+\/modifier/.test(p),
  },
  {
    href: "/admin/voitures/nouveau",
    label: "Ajouter un véhicule",
    icon: PlusCircle,
    match: (p: string) => p === "/admin/voitures/nouveau",
  },
  {
    href: "/admin/finances",
    label: "Finances",
    icon: ChartNoAxesCombined,
    match: (p: string) => p.startsWith("/admin/finances"),
  },
] as const;

type AdminShellProps = {
  email: string | null;
  signOut: ReactNode;
  children: ReactNode;
};

function NavLinks({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  return (
    <ul className="adm-nav">
      {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => (
        <li key={href}>
          <Link
            href={href}
            onClick={onNavigate}
            aria-current={pathname && match(pathname) ? "page" : undefined}
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            {label}
          </Link>
        </li>
      ))}
      <li className="adm-nav-sep" aria-hidden="true" />
      <li>
        <Link href="/" target="_blank" rel="noreferrer">
          <ExternalLink className="h-[18px] w-[18px]" aria-hidden="true" />
          Voir le site public
        </Link>
      </li>
    </ul>
  );
}

function NavLinksWithPath({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <NavLinks pathname={pathname} onNavigate={onNavigate} />;
}

/** Active-link highlighting reads the URL, so it sits in its own Suspense boundary. */
function Nav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Suspense fallback={<NavLinks pathname={null} onNavigate={onNavigate} />}>
      <NavLinksWithPath onNavigate={onNavigate} />
    </Suspense>
  );
}

export function AdminShell({ email, signOut, children }: AdminShellProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const account = (
    <div className="adm-account">
      <div className="adm-account-avatar" aria-hidden="true">
        {(email ?? "A").charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="adm-account-role">Propriétaire</p>
        {email && <p className="adm-account-email" title={email}>{email}</p>}
      </div>
      {signOut}
    </div>
  );

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar" aria-label="Navigation administration">
        <div className="adm-sidebar-brand">
          <Logo href="/admin" size="sm" />
          <span className="adm-badge-admin">Admin</span>
        </div>
        <nav className="adm-sidebar-nav">
          <Nav />
        </nav>
        {account}
      </aside>

      <header className="adm-topbar">
        <Logo href="/admin" size="sm" />
        <button
          type="button"
          className="adm-icon-btn"
          aria-expanded={open}
          aria-controls="adm-drawer"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {open && (
        <div className="adm-drawer-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
      )}
      <div id="adm-drawer" className={`adm-drawer${open ? " is-open" : ""}`} inert={!open}>
        <nav>
          <Nav onNavigate={() => setOpen(false)} />
        </nav>
        {account}
      </div>

      <div className="adm-main">{children}</div>
    </div>
  );
}
