import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/map", label: "Ghost Map" },
  { to: "/academy", label: "Academy" },
  { to: "/about", label: "About" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="font-display text-lg font-bold tracking-[0.18em]">
      RE<span className="text-primary">:</span>SPACE
    </Link>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 glass border-x-0 border-t-0">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="eyebrow text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-primary" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Button asChild variant="hero" size="sm" className="hidden rounded-full px-5 sm:inline-flex">
            <Link to="/explore">Explore archive</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>
      {open && (
        <ul className="flex flex-col gap-1 border-t px-5 py-4 lg:hidden animate-rise">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: l.to === "/" }}
                className="block rounded-lg px-3 py-3 eyebrow text-muted-foreground hover:bg-card"
                activeProps={{ className: "text-primary bg-card" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <Button asChild variant="hero" className="w-full rounded-full">
              <Link to="/explore" onClick={() => setOpen(false)}>Explore archive</Link>
            </Button>
          </li>
        </ul>
      )}
    </header>
  );
}
