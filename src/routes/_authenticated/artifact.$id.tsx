import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, ExternalLink, MapPin, Orbit, Radio, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArtifactCard } from "@/components/museum/ArtifactCard";
import { Reveal } from "@/components/museum/Reveal";
import { ARTIFACTS, getArtifact } from "@/lib/artifacts";

export const Route = createFileRoute("/artifact/$id")({
  loader: ({ params }) => {
    const a = getArtifact(params.id);
    if (!a) throw notFound();
    return { artifact: a };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.artifact;
    const title = a ? `${a.name} — RE:SPACE` : "Artifact — RE:SPACE";
    const desc = a?.short ?? "An artifact story from the RE:SPACE museum.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(a ? [{ property: "og:image", content: a.image.src }, { name: "twitter:image", content: a.image.src }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-40 text-center">
      <h1 className="text-3xl font-bold">This machine isn't in the archive</h1>
      <Button asChild variant="hero" className="mt-6 rounded-full"><Link to="/explore">Back to archive</Link></Button>
    </div>
  ),
  component: ArtifactPage,
});

function ArtifactPage() {
  const { artifact: a } = Route.useLoaderData();
  const related = ARTIFACTS.filter((x) => x.id !== a.id).sort((x, y) => Number(x.destination !== a.destination) - Number(y.destination !== a.destination)).slice(0, 3);
  const facts = [
    { icon: Orbit, label: "Destination", value: a.destination },
    { icon: Radio, label: "Mission", value: a.mission },
    { icon: Calendar, label: "Mission date", value: a.date },
    { icon: MapPin, label: "Where it remains", value: a.location },
  ];

  return (
    <article>
      <header className="relative flex min-h-[88vh] items-end overflow-hidden pb-16">
        <img src={a.image.src} alt={a.image.alt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 overlay-side" />
        <div className="absolute inset-0 overlay-fade" />
        <div className="relative mx-auto w-full max-w-7xl px-5 animate-rise">
          <Link to="/explore" className="eyebrow inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" /> Back to archive
          </Link>
          <p className="eyebrow mt-8 text-primary">{a.categoryLabel}</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-bold leading-[0.98] md:text-7xl">{a.name}</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{a.intro}</p>
          <p className="mt-6 text-xs text-muted-foreground">
            {a.image.kind === "artist concept" ? "Artist concept" : "Photo"}:{" "}
            <a href={a.image.url} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">{a.image.credit}</a>
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5">
        <div className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="bg-card p-6">
              <f.icon className="size-5 text-science" />
              <p className="eyebrow mt-4 text-muted-foreground">{f.label}</p>
              <p className="mt-1 font-display text-lg font-medium">{f.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 lg:grid-cols-[1fr_340px]">
        <div className="space-y-16">
          {a.chapters.map((c, i) => (
            <Reveal key={c.title}>
              <p className="eyebrow text-primary">Chapter {String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">{c.title}</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{c.body}</p>
              {i === 1 && a.gallery && (
                <figure className="mt-10 overflow-hidden rounded-2xl border">
                  <img src={a.gallery.src} alt={a.gallery.alt} loading="lazy" className="max-h-[520px] w-full object-cover" />
                  <figcaption className="bg-card px-5 py-3 text-xs text-muted-foreground">
                    {a.gallery.kind === "artist concept" ? "Artist concept — not a photograph. " : ""}
                    <a href={a.gallery.url} target="_blank" rel="noreferrer" className="hover:underline">{a.gallery.credit}</a>
                  </figcaption>
                </figure>
              )}
            </Reveal>
          ))}

          <Reveal>
            <p className="eyebrow text-science">Important discoveries</p>
            <ul className="mt-5 space-y-4">
              {a.discoveries.map((d) => (
                <li key={d} className="flex gap-4 rounded-xl border bg-card p-5">
                  <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span className="leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-3xl font-bold md:text-4xl">Why it matters</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {a.name} is more than leftover hardware. It is a time capsule of the engineering, risks and curiosity of its era —
              and a reminder that the end of a mission is not the end of its story.
            </p>
          </Reveal>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-6">
            <p className="eyebrow text-science">Current known status</p>
            <p className="mt-3 leading-relaxed">{a.status}</p>
          </div>
        </aside>
      </section>

      <section aria-labelledby="research-references" className="border-t bg-surface py-20">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal>
            <p className="eyebrow text-science">The evidence behind the story</p>
            <h2 id="research-references" className="mt-4 text-3xl font-bold md:text-4xl">RESEARCH & REFERENCES</h2>
          </Reveal>
          <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr]">
            <div>
              <h3 className="font-display text-lg font-semibold text-primary">Official mission research</h3>
              <ul className="mt-5 space-y-4">
                {a.sources.map((source) => (
                  <li key={source.url} className="rounded-lg border bg-card p-5 transition-colors hover:border-science/40">
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3">
                      <ExternalLink className="mt-1 size-4 shrink-0 text-science" />
                      <span className="min-w-0">
                        <span className="font-medium group-hover:text-primary">{source.label}</span>
                        <span className="mt-2 block break-all text-xs leading-relaxed text-muted-foreground">{source.url}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-science">NASA image credits</h3>
              <ul className="mt-5 space-y-5">
                {[a.image, ...(a.gallery ? [a.gallery] : [])].map((image) => (
                  <li key={image.url}>
                    <a href={image.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3">
                      <ExternalLink className="mt-1 size-4 shrink-0 text-science" />
                      <span className="min-w-0">
                        <span className="text-sm group-hover:text-primary">{image.credit}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{image.kind === "artist concept" ? "Artist concept — not a photograph" : "NASA photograph"}</span>
                        <span className="mt-2 block break-all text-xs leading-relaxed text-muted-foreground">{image.url}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y bg-surface py-28">
        <div className="absolute inset-0 starfield opacity-50" aria-hidden />
        <Reveal className="relative mx-auto max-w-3xl px-5 text-center">
          <p className="eyebrow text-primary">If this machine could speak…</p>
          <blockquote className="mt-8 font-display text-2xl font-light leading-relaxed md:text-3xl">“{a.speak}”</blockquote>
          <p className="mt-8 inline-block rounded-full border px-4 py-1.5 text-xs text-muted-foreground">
            Creative storytelling — imagined narration, not a NASA transcript or historical quotation.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-bold">Related artifacts</h2>
          <Button asChild variant="glass" className="rounded-full"><Link to="/explore"><ArrowLeft /> Back to archive</Link></Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => <ArtifactCard key={r.id} a={r} />)}
        </div>
      </section>
    </article>
  );
}
