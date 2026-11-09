import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArtifactCard } from "@/components/museum/ArtifactCard";
import { Reveal } from "@/components/museum/Reveal";
import { ARTIFACTS, IMAGES, getArtifact } from "@/lib/artifacts";
import { OriginalSources } from "@/components/museum/OriginalSources";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RE:SPACE — The Mission Ended. The Story Didn't." },
      { name: "description", content: "Discover the NASA landers, rovers and instruments that remain on the Moon and Mars." },
      { property: "og:title", content: "RE:SPACE — The Mission Ended. The Story Didn't." },
      { property: "og:description", content: "A digital museum of NASA machines left on the Moon and Mars." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: ARTIFACTS[0]?.image.src },
      { name: "twitter:image", content: ARTIFACTS[0]?.image.src },
    ],
  }),
  component: Home,
});

function Home() {
  const lm = getArtifact("apollo-11-descent-stage");
  if (!lm) return null;
  const worlds = [
    { title: "The Moon", body: "Apollo descent stages, three lunar rovers and robotic landers rest where they stopped.", img: lm.image, to: "/explore" as const, cta: "Explore lunar artifacts" },
    { title: "Mars", body: "Rovers and landers sit silent in dust storms and winter, still on the surface they explored.", img: IMAGES.marsHills, to: "/explore" as const, cta: "Explore Martian artifacts" },
    { title: "Beyond", body: "Where are they exactly? Trace every site on the Ghost Map and the mission timeline.", img: IMAGES.earthrise, to: "/map" as const, cta: "Open the Ghost Map" },
  ];

  return (
    <>
      <section className="relative flex min-h-screen items-end overflow-hidden pb-24">
        <img src={lm.image.src} alt={lm.image.alt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 overlay-side" />
        <div className="absolute inset-0 overlay-fade" />
        <div className="absolute inset-0 starfield opacity-40" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-5">
          <p className="eyebrow text-science animate-rise">RE:SPACE · A digital museum of space archaeology</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-[0.95] md:text-7xl lg:text-8xl animate-rise" style={{ animationDelay: "120ms" }}>
            The mission ended.
            <br />
            <span className="text-primary">The story didn't.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground animate-rise" style={{ animationDelay: "240ms" }}>
            Across the Moon and Mars, machines once built to explore the unknown remain as silent witnesses to humanity's
            greatest journeys. Discover the stories they left behind.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 animate-rise" style={{ animationDelay: "360ms" }}>
            <Button asChild variant="hero" size="xl"><Link to="/explore">Explore the archive <ArrowRight /></Link></Button>
            <Button asChild variant="glass" size="xl"><a href="#witnesses">Enter the museum</a></Button>
          </div>
          <p className="mt-10 text-xs text-muted-foreground">Photo: {lm.image.credit}</p>
        </div>
        <a href="#witnesses" aria-label="Scroll down" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground">
          <ChevronDown className="size-6 animate-scrollcue" />
        </a>
      </section>

      <section id="witnesses" className="mx-auto max-w-7xl px-5 py-28">
        <Reveal>
          <p className="eyebrow text-primary">The silent witnesses</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-bold md:text-6xl">Not everything returns home.</h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            A mission ends when a spacecraft stops sending data or its team stops operating it. But the hardware doesn't vanish.
            Landers, rovers and instruments stay exactly where they last stood — sometimes for decades, preserved by airless
            skies or slowly dusted by Martian winds.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {worlds.map((w, i) => (
            <Reveal key={w.title} delay={i * 120}>
              <Link to={w.to} className="group relative block h-96 overflow-hidden rounded-2xl border shadow-card">
                <img src={w.img.src} alt={w.img.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 overlay-fade" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <h3 className="text-3xl font-bold">{w.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{w.body}</p>
                  <span className="eyebrow mt-4 inline-flex items-center gap-1 text-primary">{w.cta} <ArrowRight className="size-3.5" /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-surface py-28">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-primary">Featured forgotten machines</p>
              <h2 className="mt-4 text-4xl font-bold md:text-5xl">Five machines. Five stories.</h2>
            </div>
            <Button asChild variant="glass" className="rounded-full"><Link to="/explore">View full archive</Link></Button>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ARTIFACTS.map((a, i) => (
              <Reveal key={a.id} delay={(i % 3) * 100}><ArtifactCard a={a} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-40">
        <img src={IMAGES.marsHills.src} alt={IMAGES.marsHills.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-bottom" />
        <div className="absolute inset-0 bg-background/75" />
        <Reveal className="relative mx-auto max-w-3xl px-5 text-center">
          <p className="eyebrow text-science">Mission legacy</p>
          <h2 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">They were built to be left behind.</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Every lander that stays, every rover that falls silent, is a record of what we tried and what we learned. Scientists
            still study these sites, engineers still learn from their designs, and the rest of us can stand at the edge of a
            crater on another world and know: someone from Earth was here.
          </p>
          <p className="mt-8 text-xs text-muted-foreground">Photo: {IMAGES.marsHills.credit}, from the Spirit rover</p>
        </Reveal>
      </section>

      <OriginalSources />

      <section className="mx-auto max-w-7xl px-5 py-28">
        <Reveal className="rounded-3xl border bg-card p-10 md:p-16 shadow-card">
          <p className="eyebrow text-primary">Explore the unknown</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-bold md:text-5xl">Find where humanity left its footprints.</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl"><Link to="/explore">Explore archive</Link></Button>
            <Button asChild variant="glass" size="xl"><Link to="/map">Open Ghost Map</Link></Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
