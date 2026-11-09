export interface Question { q: string; options: string[]; answer: number; explain: string }

export const QUIZ: Question[] = [
  { q: "Which part of Apollo 11's lunar module Eagle was left on the Moon?", options: ["The ascent stage", "The descent stage", "The command module", "Nothing"], answer: 1, explain: "The descent stage stayed behind and served as the launch platform for the ascent stage." },
  { q: "On which Apollo missions was the Lunar Roving Vehicle driven?", options: ["11, 12 and 13", "12, 14 and 15", "15, 16 and 17", "Only Apollo 17"], answer: 2, explain: "Three rovers were used, on Apollo 15, 16 and 17, and all three remain on the Moon." },
  { q: "What made Surveyor 3 unique among lunar spacecraft?", options: ["It returned to Earth", "Astronauts later visited it", "It was the first orbiter", "It carried a rover"], answer: 1, explain: "The Apollo 12 crew landed nearby in 1969 and removed parts of it." },
  { q: "What happened when Surveyor 3 landed?", options: ["It crashed", "It bounced before settling", "It landed upside down", "It sank in dust"], answer: 1, explain: "Its engines didn't cut off as planned, so it bounced before coming to rest." },
  { q: "Sojourner was the first…", options: ["Spacecraft to orbit Mars", "Wheeled vehicle on another planet", "Lander on the Moon", "Mission to Jupiter"], answer: 1, explain: "Sojourner, part of Mars Pathfinder in 1997, was the first wheeled rover on another planet." },
  { q: "On which date did Mars Pathfinder land?", options: ["4 July 1997", "20 July 1969", "4 January 2004", "25 May 2011"], answer: 0, explain: "Pathfinder landed in Ares Vallis on 4 July 1997." },
  { q: "Spirit's mission was originally planned to last about…", options: ["90 Martian days", "1 Earth year", "10 years", "1 week"], answer: 0, explain: "Spirit was planned for 90 sols but operated for more than six years." },
  { q: "What did Spirit's broken, dragging wheel uncover?", options: ["Ice", "Nearly pure silica soil", "A meteorite", "Fossils"], answer: 1, explain: "The silica-rich soil suggested past hot springs or steam vents." },
];

export function scoreQuiz(answers: (number | null)[], quiz: Question[] = QUIZ) {
  return answers.reduce<number>((s, a, i) => (a === quiz[i]?.answer ? s + 1 : s), 0);
}
