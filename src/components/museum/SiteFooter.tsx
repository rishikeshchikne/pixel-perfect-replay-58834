import { Link } from "@tanstack/react-router";
import { Logo } from "./SiteNav";

export function SiteFooter() {
  return (
    <footer className="border-t bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Abandoned. Remembered. Reimagined. A digital museum of the machines humanity left on the Moon and Mars.
          </p>
          <p className="mt-6 max-w-md text-xs leading-relaxed text-muted-foreground">
            RE:SPACE is an independent, student-created educational project for NASA Space Apps Challenge 2026. It is not an
            official NASA website and is not endorsed by NASA. Photographs are courtesy of NASA unless labelled otherwise.
          </p>
        </div>
        <div>
          <p className="eyebrow text-primary">Navigate</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/explore" className="hover:text-foreground">Explore archive</Link></li>
            <li><Link to="/map" className="hover:text-foreground">Ghost Map</Link></li>
            <li><Link to="/academy" className="hover:text-foreground">Explorer Academy</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About & sources</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-science">NASA sources</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a className="hover:text-foreground" href="https://science.nasa.gov/" target="_blank" rel="noopener noreferrer">NASA Science</a></li>
            <li><a className="hover:text-foreground" href="https://images.nasa.gov/" target="_blank" rel="noopener noreferrer">NASA Image Library (image credits)</a></li>
            <li><a className="hover:text-foreground" href="https://nssdc.gsfc.nasa.gov/" target="_blank" rel="noopener noreferrer">NSSDCA archive</a></li>
            <li><a className="hover:text-foreground" href="https://www.spaceappschallenge.org/" target="_blank" rel="noopener noreferrer">Space Apps Challenge</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
