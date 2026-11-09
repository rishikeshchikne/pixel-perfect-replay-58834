import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/museum/PageHeader";
import { Reveal } from "@/components/museum/Reveal";
import { ARTIFACTS, IMAGES } from "@/lib/artifacts";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Sources — RE:SPACE" },
      { name: "description", content: "Why RE:SPACE exists, who made it, and the NASA sources behind every story." },
      { property: "og:title", content: "About & Sources — RE:SPACE" },
      { property: "og:description", content: "Every explorer deserves to be remembered." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: IMAGES.earthrise.src },
      { name: "twitter:image", content: IMAGES.earthrise.src },
    ],
  }),
  component: About,
});

function About() {
  const images = [IMAGES.earthrise, IMAGES.marsHills, IMAGES.roverFamily, ...ARTIFACTS.flatMap((a) => [a.image, a.gallery].filter(Boolean))]
    .filter((v, i, arr) => v && arr.findIndex((x) => x?.url === v.url) === i) as (typeof IMAGES.earthrise)[];
  const blocks = [
    { t: "Our mission", b: "To tell the stories of NASA equipment left behind on the Moon and Mars, connecting engineering, exploration, science and human curiosity." },
    { t: "Why we created RE:SPACE", b: "Most people know the launches and landings. Few know what happened to the machines afterwards. We wanted to give them their final chapter." },
    { t: "What you can discover", b: "Artifact stories, a Ghost Map of landing sites, a mission timeline, and the Explorer Academy with lessons and a quiz." },
    { t: "Team", b: "Built by a student team for NASA Space Apps Challenge 2026, in the challenge \"Abandoned but not Forgotten.\"" },
  ];
  return (
    <>
      <PageHeader eyebrow="About RE:SPACE" title={<>Every explorer deserves to be <span className="text-primary">remembered.</span></>} sub="RE:SPACE is an independent educational digital museum created for NASA Space Apps Challenge 2026." image={IMAGES.earthrise} />
      <section className="mx-auto grid max-w-7xl gap-5 px-5 md:grid-cols-2">
        {blocks.map((x, i) => (
          <Reveal key={x.t} delay={(i % 2) * 100}>
            <div className="h-full rounded-2xl border bg-card p-8">
              <h2 className="text-2xl font-semibold">{x.t}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{x.b}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8">
          <h2 className="text-xl font-semibold">How we handle accuracy</h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li><span className="text-foreground">Confirmed facts</span> come from NASA mission pages and archives, linked on each artifact.</li>
            <li><span className="text-foreground">Approximate information</span> — like map coordinates — is labelled as approximate.</li>
            <li><span className="text-foreground">Unknown information</span>, such as Sojourner's final state, is stated as unknown.</li>
            <li><span className="text-foreground">Creative storytelling</span> — the "If this machine could speak" sections — is clearly marked as imagined.</li>
            <li>A mission <em>ending</em> means operations stopped; the hardware itself physically remains on the surface.</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-24 md:grid-cols-2">
        <div>
          <p className="eyebrow text-primary">Research references</p>
          <ul className="mt-5 space-y-3 text-sm">
            {ARTIFACTS.flatMap((a) => a.sources).map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex gap-2 text-muted-foreground hover:text-foreground">
                  <ExternalLink className="mt-0.5 size-3.5 shrink-0" /> {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-science">Image credits</p>
          <ul className="mt-5 space-y-3 text-sm">
            {images.map((im) => (
              <li key={im.url}>
                <a href={im.url} target="_blank" rel="noopener noreferrer" className="inline-flex gap-2 text-muted-foreground hover:text-foreground">
                  <ExternalLink className="mt-0.5 size-3.5 shrink-0" /> {im.credit}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            Images courtesy of NASA via the NASA Image and Video Library. NASA material is generally not copyrighted; its use
            here does not imply NASA endorsement. Acknowledgements: NASA, JPL, and the Space Apps Challenge community.
          </p>
        </div>
      </section>
    </>
  );
}
