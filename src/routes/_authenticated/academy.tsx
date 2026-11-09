import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Lightbulb, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/museum/PageHeader";
import { Reveal } from "@/components/museum/Reveal";
import { QUIZ, scoreQuiz } from "@/lib/quiz";
import { IMAGES } from "@/lib/artifacts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/academy")({
  head: () => ({
    meta: [
      { title: "Explorer Academy — RE:SPACE" },
      { name: "description", content: "Learn the basics of space archaeology and test yourself with a quiz on NASA's left-behind machines." },
      { property: "og:title", content: "Explorer Academy — RE:SPACE" },
      { property: "og:description", content: "Become a space archaeologist. Explore. Discover. Learn. Remember." },
    ],
  }),
  component: Academy,
});

const LESSONS = [
  { q: "What is space archaeology?", a: "The study of human-made objects in space and on other worlds — spacecraft, landing sites, footprints and debris — as historical and cultural heritage." },
  { q: "Why do spacecraft stay on the Moon and Mars?", a: "Bringing hardware home needs fuel and mass that missions can't spare. Landers, rovers and lower stages are designed from the start to stay behind." },
  { q: "Rover, lander or orbiter?", a: "An orbiter circles a world from above. A lander touches down and stays in one place. A rover is a vehicle that can drive across the surface." },
  { q: "How do scientists learn from old spacecraft?", a: "By photographing sites from orbit, studying returned parts — like Surveyor 3's camera — and analysing archived mission data decades later." },
  { q: "Why preserve mission history?", a: "These sites record humanity's first steps beyond Earth. Protecting them keeps that story intact for scientists and future explorers." },
];

const FACTS = [
  "Three Lunar Roving Vehicles are still parked on the Moon, one each from Apollo 15, 16 and 17.",
  "The Apollo 11 laser reflector is still used to measure the distance between Earth and the Moon.",
  "Sojourner was designed for a week and operated for about 12 weeks.",
  "Spirit kept exploring for years after one of its six wheels stopped turning.",
  "The Columbia Hills on Mars were named for the seven astronauts lost on Space Shuttle Columbia.",
];

function Academy() {
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUIZ.map(() => null));
  const [idx, setIdx] = useState(0);
  const done = idx >= QUIZ.length;
  const q = QUIZ[idx];
  const picked = answers[idx];
  const score = scoreQuiz(answers);

  const pick = (i: number) => {
    if (picked !== null) return;
    setAnswers((a) => a.map((v, j) => (j === idx ? i : v)));
  };
  const restart = () => { setAnswers(QUIZ.map(() => null)); setIdx(0); };

  return (
    <>
      <PageHeader eyebrow="Explorer Academy" title={<>Become a <span className="text-primary">space archaeologist</span></>} sub="Explore. Discover. Learn. Remember." image={IMAGES.roverFamily} />

      <section className="mx-auto max-w-7xl px-5 pb-24">
        <h2 className="text-3xl font-bold">Learn</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {LESSONS.map((l, i) => (
            <Reveal key={l.q} delay={(i % 3) * 100}>
              <div className="h-full rounded-2xl border bg-card p-7 transition-colors hover:border-science/40">
                <p className="eyebrow text-science">Lesson {i + 1}</p>
                <h3 className="mt-3 text-xl font-semibold">{l.q}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{l.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y bg-surface py-24">
        <div className="mx-auto max-w-3xl px-5">
          <p className="eyebrow text-primary">Interactive quiz</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Test your field knowledge</h2>

          <div className="mt-10 rounded-2xl border bg-card p-6 md:p-10">
            {done ? (
              <div className="text-center" aria-live="polite">
                <p className="eyebrow text-science">Final score</p>
                <p className="mt-3 font-display text-7xl font-bold text-primary">{score}<span className="text-3xl text-muted-foreground">/{QUIZ.length}</span></p>
                <p className="mt-4 text-muted-foreground">
                  {score === QUIZ.length ? "Perfect. You're a certified space archaeologist." : score >= QUIZ.length / 2 ? "Great work, explorer." : "Every expedition teaches something. Try again!"}
                </p>
                <Button variant="hero" className="mt-8 rounded-full" onClick={restart}><RotateCcw /> Restart quiz</Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Question {idx + 1} of {QUIZ.length}</span>
                  <span>Score {score}</span>
                </div>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-amber-gradient transition-all" style={{ width: `${(idx / QUIZ.length) * 100}%` }} />
                </div>
                <h3 className="mt-8 text-2xl font-semibold">{q.q}</h3>
                <div className="mt-6 grid gap-3">
                  {q.options.map((o, i) => {
                    const isAnswer = i === q.answer;
                    const isPicked = i === picked;
                    return (
                      <button
                        key={o}
                        onClick={() => pick(i)}
                        disabled={picked !== null}
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-5 py-4 text-left transition-all",
                          picked === null && "hover:border-primary/50 hover:bg-primary/5",
                          picked !== null && isAnswer && "border-success bg-success/10",
                          picked !== null && isPicked && !isAnswer && "border-destructive bg-destructive/10",
                        )}
                      >
                        <span>{o}</span>
                        {picked !== null && isAnswer && <CheckCircle2 className="size-5 text-success" aria-label="Correct" />}
                        {picked !== null && isPicked && !isAnswer && <XCircle className="size-5 text-destructive" aria-label="Incorrect" />}
                      </button>
                    );
                  })}
                </div>
                {picked !== null && (
                  <div className="mt-6 animate-rise" aria-live="polite">
                    <p className={cn("font-semibold", picked === q.answer ? "text-success" : "text-destructive")}>
                      {picked === q.answer ? "Correct!" : "Not quite."}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{q.explain}</p>
                    <Button variant="hero" className="mt-6 rounded-full" onClick={() => setIdx((i) => i + 1)}>
                      {idx + 1 === QUIZ.length ? "See my score" : "Next question"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <h2 className="text-3xl font-bold">Did you know?</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {FACTS.map((f) => (
            <div key={f} className="flex gap-4 rounded-xl border bg-card p-5">
              <Lightbulb className="size-5 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed">{f}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
