import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, sub, image }: { eyebrow: string; title: ReactNode; sub: string; image?: { src: string; alt: string } }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
      {image && (
        <>
          <img src={image.src} alt={image.alt} className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 overlay-fade" />
        </>
      )}
      <div className="absolute inset-0 starfield opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 animate-rise">
        <p className="eyebrow text-primary">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.02] md:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{sub}</p>
      </div>
    </section>
  );
}
