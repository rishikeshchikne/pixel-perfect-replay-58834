// Curated, source-backed artifact records. Coordinates are approximate published values
// (rounded) and are only used on a schematic map.

const nasa = (id: string, size: "large" | "medium" | "orig" = "large") =>
  `https://images-assets.nasa.gov/image/${id}/${id}~${size}.jpg`;

export type Destination = "Moon" | "Mars";
export type Category = "rover" | "lander" | "equipment";

export interface Source { label: string; url: string }
export interface ImageInfo { src: string; alt: string; credit: string; url: string; kind: "photo" | "artist concept" }
export interface Chapter { title: string; body: string }

export interface Artifact {
  id: string;
  name: string;
  destination: Destination;
  mission: string;
  category: Category;
  categoryLabel: string;
  date: string;
  short: string;
  status: string;
  location: string;
  coords: { lat: number; lon: number; note: string }[];
  image: ImageInfo;
  gallery?: ImageInfo;
  intro: string;
  chapters: Chapter[];
  discoveries: string[];
  speak: string;
  sources: Source[];
}

export const IMAGES = {
  earthrise: {
    src: nasa("as11-44-6552"),
    alt: "Earth rising above the grey lunar horizon, photographed from Apollo 11",
    credit: "NASA — AS11-44-6552",
    url: "https://images.nasa.gov/details/as11-44-6552",
    kind: "photo",
  },
  marsHills: {
    src: nasa("PIA05200", "medium"),
    alt: "Rust-coloured Martian plain stretching toward the Columbia Hills, photographed by Spirit",
    credit: "NASA/JPL/Cornell — PIA05200",
    url: "https://images.nasa.gov/details/PIA05200",
    kind: "photo",
  },
  roverFamily: {
    src: nasa("PIA04422", "medium"),
    alt: "Engineering models of Sojourner and two Mars Exploration Rovers side by side",
    credit: "NASA/JPL — PIA04422",
    url: "https://images.nasa.gov/details/PIA04422",
    kind: "photo",
  },
} satisfies Record<string, ImageInfo>;

export const ARTIFACTS: Artifact[] = [
  {
    id: "apollo-11-descent-stage",
    name: "Apollo 11 Lunar Module Descent Stage",
    destination: "Moon",
    mission: "Apollo 11",
    category: "lander",
    categoryLabel: "Lunar lander component",
    date: "Landed 20 July 1969",
    short: "The lower half of the lunar module Eagle. It carried Armstrong and Aldrin to the surface, then became the launch pad they left behind.",
    status: "Remains at Tranquility Base. The site has been photographed from orbit by NASA's Lunar Reconnaissance Orbiter.",
    location: "Tranquility Base, Sea of Tranquility",
    coords: [{ lat: 0.674, lon: 23.473, note: "Tranquility Base" }],
    image: {
      src: nasa("as11-40-5927"),
      alt: "The Apollo 11 lunar module Eagle standing on the lunar surface",
      credit: "NASA — AS11-40-5927",
      url: "https://images.nasa.gov/details/as11-40-5927",
      kind: "photo",
    },
    intro:
      "On 20 July 1969 the lunar module Eagle touched down in the Sea of Tranquility, and Neil Armstrong and Buzz Aldrin became the first humans to walk on another world. The lunar module was built in two parts. When it was time to leave, only the top half flew home.",
    chapters: [
      { title: "Why NASA built it", body: "Landing on the Moon needed a spacecraft that could descend, land softly, support two astronauts and lift them back to orbit. The lunar module split those jobs in two: a descent stage with the landing engine, legs and supplies, and an ascent stage with the crew cabin." },
      { title: "How it worked", body: "The descent stage's throttleable rocket engine slowed Eagle from lunar orbit to touchdown. Its four legs absorbed the landing. Storage bays held experiments and equipment the crew unpacked on the surface." },
      { title: "What happened during the mission", body: "Armstrong and Aldrin spent about 21½ hours on the surface, including roughly 2½ hours outside. They collected samples and set up experiments, including a laser reflector. On 21 July the ascent stage fired its own engine and lifted off, using the descent stage as a launch platform." },
      { title: "After the mission", body: "The descent stage was designed never to leave. It still carries a plaque on one leg reading: \"Here men from the planet Earth first set foot upon the Moon, July 1969 A.D. We came in peace for all mankind.\"" },
    ],
    discoveries: [
      "Returned about 21.5 kg of lunar rock and soil for study on Earth.",
      "The Laser Ranging Retroreflector placed nearby is still used to measure the Earth–Moon distance.",
      "Proved humans could land, work and return from the lunar surface.",
    ],
    speak:
      "I was only ever meant to be the half that stays. I held them steady while the dust settled, and when the fire lit above me, I let them go. The flag they planted fell in the blast of my upper half leaving, but the paths they walked can still be seen from orbit. I still face the Earth, every day, from the place where people first arrived.",
    sources: [
      { label: "NASA — Apollo 11 Mission Overview", url: "https://www.nasa.gov/mission/apollo-11/" },
      { label: "NASA SVS — Apollo Landing Sites, with Shadows", url: "https://svs.gsfc.nasa.gov/3620/" },
      { label: "NASA SVS — Revisiting Apollo Landing Sites", url: "https://svs.gsfc.nasa.gov/31052" },
    ],
  },
  {
    id: "lunar-roving-vehicle",
    name: "Apollo Lunar Roving Vehicle",
    destination: "Moon",
    mission: "Apollo 15, 16 & 17",
    category: "rover",
    categoryLabel: "Lunar exploration vehicle",
    date: "Driven 1971–1972",
    short: "A battery-powered, foldable car that let astronauts travel many kilometres from their lander. Three were driven on the Moon and all three were left there.",
    status: "All three rovers remain parked at their landing sites: Hadley–Apennine, Descartes Highlands and Taurus–Littrow.",
    location: "Hadley–Apennine · Descartes Highlands · Taurus–Littrow",
    coords: [
      { lat: 26.13, lon: 3.63, note: "Apollo 15 — Hadley–Apennine" },
      { lat: -8.97, lon: 15.5, note: "Apollo 16 — Descartes" },
      { lat: 20.19, lon: 30.77, note: "Apollo 17 — Taurus–Littrow" },
    ],
    image: {
      src: nasa("as15-86-11603"),
      alt: "Astronaut James Irwin beside the Lunar Roving Vehicle during Apollo 15",
      credit: "NASA — AS15-86-11603",
      url: "https://images.nasa.gov/details/as15-86-11603",
      kind: "photo",
    },
    gallery: {
      src: nasa("as17-147-22526"),
      alt: "Eugene Cernan driving the Lunar Roving Vehicle during Apollo 17",
      credit: "NASA — AS17-147-22526",
      url: "https://images.nasa.gov/details/as17-147-22526",
      kind: "photo",
    },
    intro:
      "On the first Apollo landings, astronauts could only explore as far as they could walk. For the last three missions, NASA sent a car folded against the side of the lunar module.",
    chapters: [
      { title: "Why NASA built it", body: "Geologists wanted samples from many places, not just around the lander. A rover could carry two astronauts, tools, cameras and samples across kilometres of terrain in a single moonwalk." },
      { title: "How it worked", body: "The rover was built by Boeing under NASA's Marshall Space Flight Center. It weighed about 210 kg on Earth, ran on non-rechargeable batteries, and had an electric motor in each of its four wire-mesh wheels. It unfolded from a bay on the lunar module." },
      { title: "What happened during the missions", body: "On Apollo 15, 16 and 17 the crews drove roughly 28 km, 27 km and 36 km respectively. A television camera on the rover let Mission Control watch, and on the final missions it filmed the ascent stage lifting off." },
      { title: "After the missions", body: "There was no room to bring the rovers home. Each was parked near its landing site, with its camera pointed so it could film the crew's departure." },
    ],
    discoveries: [
      "Let the Apollo 15 crew reach the edge of Hadley Rille and Spur crater, where they collected the \"Genesis Rock,\" a sample of ancient lunar crust.",
      "Greatly expanded the area astronauts could sample on each mission.",
      "Showed that crewed surface vehicles could work on another world — a lesson for future lunar rovers.",
    ],
    speak:
      "They folded me like a letter and opened me on a world with no roads. I carried two people, their tools and their laughter across dust no one had touched. My batteries are empty now. My camera still looks at the place where they left.",
    sources: [
      { label: "NASA NSSDCA — Apollo Lunar Roving Vehicle", url: "https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html" },
      { label: "NASA — Apollo 15", url: "https://www.nasa.gov/mission/apollo-15/" },
    ],
  },
  {
    id: "surveyor-3",
    name: "Surveyor 3",
    destination: "Moon",
    mission: "Surveyor 3",
    category: "lander",
    categoryLabel: "Robotic lunar lander",
    date: "Landed 20 April 1967",
    short: "A robotic lander that tested the lunar soil before humans arrived — and later became the only spacecraft on the Moon visited by astronauts.",
    status: "Remains in its crater in the Ocean of Storms, minus parts removed by the Apollo 12 crew in 1969.",
    location: "Oceanus Procellarum (Ocean of Storms)",
    coords: [{ lat: -3.0, lon: -23.4, note: "Surveyor 3 / Apollo 12 site" }],
    image: {
      src: nasa("as12-48-7136"),
      alt: "Astronaut Charles Conrad Jr. examining Surveyor 3 with the Apollo 12 lunar module in the background",
      credit: "NASA — AS12-48-7136",
      url: "https://images.nasa.gov/details/as12-48-7136",
      kind: "photo",
    },
    gallery: {
      src: nasa("as12-48-7121"),
      alt: "Surveyor 3 resting on the slope of its crater",
      credit: "NASA — AS12-48-7121",
      url: "https://images.nasa.gov/details/as12-48-7121",
      kind: "photo",
    },
    intro:
      "Before people could land on the Moon, NASA needed to know whether the ground would hold them. The Surveyor landers went first, and Surveyor 3 dug into the soil to find out.",
    chapters: [
      { title: "Why NASA built it", body: "The Surveyor program tested soft-landing technology and studied the lunar surface to prepare for Apollo. Surveyor 3 was the first to carry a surface sampler — a small mechanical arm and scoop." },
      { title: "How it worked", body: "Radar and retro-rockets slowed the lander to a soft touchdown. A television camera returned images to Earth, and the scoop dug trenches so engineers could judge how firm the soil was." },
      { title: "What happened during the mission", body: "When Surveyor 3 landed, its engines did not shut off as planned, and it bounced before settling inside a small crater. It then returned thousands of images and dug trenches up to about 17.5 cm deep. Contact ended in early May 1967." },
      { title: "After the mission", body: "On 19 November 1969, Apollo 12 landed within about 200 metres. Pete Conrad and Alan Bean walked over and removed the TV camera, the scoop and other pieces so scientists could study how 31 months on the Moon had affected them." },
    ],
    discoveries: [
      "Showed the lunar soil could support a landing spacecraft.",
      "Returned more than 6,000 television images of the surface.",
      "Parts returned by Apollo 12 helped scientists study long-term exposure to the lunar environment. An early report of surviving Earth bacteria in the camera is now widely thought to have been contamination after return.",
    ],
    speak:
      "I landed three times before I stopped. I dug, I looked, I waited. Then, two and a half years later, footsteps. Two visitors walked over and took my eyes home with them. I am the only robot on the Moon that ever had guests.",
    sources: [
      { label: "NASA Science — Surveyor 3", url: "https://science.nasa.gov/mission/surveyor-3/" },
      { label: "NASA NSSDCA — Surveyor 3", url: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-035A" },
      { label: "NASA — Apollo 12", url: "https://www.nasa.gov/mission/apollo-12/" },
    ],
  },
  {
    id: "sojourner",
    name: "Sojourner Rover",
    destination: "Mars",
    mission: "Mars Pathfinder",
    category: "rover",
    categoryLabel: "Mars rover",
    date: "Landed 4 July 1997",
    short: "A microwave-oven-sized rover that became the first wheeled vehicle to explore another planet.",
    status: "Last contact with Mars Pathfinder was on 27 September 1997. Sojourner remains near the lander in Ares Vallis; its exact final state is unknown.",
    location: "Ares Vallis, Chryse Planitia",
    coords: [{ lat: 19.13, lon: -33.22, note: "Mars Pathfinder landing site" }],
    image: {
      src: nasa("PIA04318", "orig"),
      alt: "The small Sojourner rover beside the rock nicknamed Wedge on Mars",
      credit: "NASA/JPL — PIA04318",
      url: "https://images.nasa.gov/details/PIA04318",
      kind: "photo",
    },
    gallery: IMAGES.roverFamily,
    intro:
      "On 4 July 1997, Mars Pathfinder bounced onto Mars inside a cluster of airbags. Two days later a small six-wheeled rover rolled down a ramp and onto the red soil.",
    chapters: [
      { title: "Why NASA built it", body: "Mars Pathfinder was part of NASA's Discovery program, designed to show that Mars missions could be faster and cheaper. Sojourner tested whether a small rover could move and do science on another planet." },
      { title: "How it worked", body: "Sojourner had a mass of about 10.6 kg, six wheels on a rocker-bogie suspension, and a solar panel on top. It carried an Alpha Proton X-ray Spectrometer (APXS) to measure what rocks and soil were made of, and talked to Earth through the lander." },
      { title: "What happened during the mission", body: "Designed for about a week, Sojourner operated for roughly 12 weeks. It studied rocks given friendly nicknames like Barnacle Bill, Yogi and Wedge, travelling around 100 metres in total, never far from the lander." },
      { title: "After the mission", body: "Contact with the lander was lost on 27 September 1997, and with it the link to Sojourner. The lander was renamed the Carl Sagan Memorial Station." },
    ],
    discoveries: [
      "First wheeled vehicle to operate on another planet.",
      "Measured the composition of Martian rocks with its APXS instrument.",
      "Images of rounded pebbles and the surrounding terrain supported the idea that floods once flowed through Ares Vallis.",
    ],
    speak:
      "I was small enough to carry in your arms. Every day I rolled a few centimetres further than anything from Earth had ever rolled. Then the voice from the lander went quiet. I don't know if I kept driving. I like to think I did.",
    sources: [
      { label: "NASA Science — Mars Pathfinder", url: "https://science.nasa.gov/mission/mars-pathfinder/" },
      { label: "NASA NSSDCA — Mars Pathfinder Rover", url: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=MESURPR" },
    ],
  },
  {
    id: "spirit",
    name: "Spirit Rover",
    destination: "Mars",
    mission: "Mars Exploration Rover",
    category: "rover",
    categoryLabel: "Mars rover",
    date: "Landed 4 January 2004",
    short: "Planned for 90 Martian days, Spirit explored Gusev Crater for more than six years and found evidence of Mars's watery past.",
    status: "Stuck in soft soil at a site called Troy since 2009. Last communication: 22 March 2010. NASA ended recovery efforts on 25 May 2011.",
    location: "Gusev Crater",
    coords: [{ lat: -14.57, lon: 175.47, note: "Spirit landing site, Gusev Crater" }],
    image: IMAGES.marsHills,
    gallery: {
      src: nasa("PIA04928", "medium"),
      alt: "Artist's concept of a Mars Exploration Rover",
      credit: "NASA/JPL — PIA04928 (artist concept)",
      url: "https://images.nasa.gov/details/PIA04928",
      kind: "artist concept",
    },
    intro:
      "Spirit and its twin Opportunity landed on opposite sides of Mars in January 2004. Spirit was sent to Gusev Crater, which scientists thought might once have held a lake.",
    chapters: [
      { title: "Why NASA built it", body: "The Mars Exploration Rover mission's main goal was to search for clues to past water activity on Mars, using a robotic field geologist that could drive to the rocks it wanted to study." },
      { title: "How it worked", body: "Spirit was a six-wheeled, solar-powered rover with panoramic cameras, spectrometers, a microscopic imager and a rock abrasion tool for grinding into rock surfaces." },
      { title: "What happened during the mission", body: "The plains near the landing site were volcanic, so Spirit drove to the Columbia Hills — named for the crew of Space Shuttle Columbia. Even after a front wheel stopped working in 2006, it kept going, dragging the wheel and driving about 7.7 km in total." },
      { title: "After the mission", body: "In 2009, Spirit's wheels broke through a crust into soft sand at Troy. Engineers could not free it. As the Martian winter arrived, it could no longer stay warm and powered, and it fell silent in March 2010." },
    ],
    discoveries: [
      "Found minerals in the Columbia Hills altered by water.",
      "Its dragging wheel uncovered nearly pure silica soil, pointing to past hot springs or steam vents.",
      "Identified carbonate-rich rock at an outcrop called Comanche, evidence of past wet, non-acidic conditions.",
    ],
    speak:
      "They gave me ninety days. I took more than two thousand. When my wheel stopped turning I dragged it, and the scar it left in the soil was white with the memory of water. I rest now at Troy, facing a sun that comes and goes.",
    sources: [
      { label: "NASA Science — Spirit rover", url: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/" },
      { label: "NASA Science — Silica-Rich Soil Found by Spirit (2007)", url: "https://science.nasa.gov/photojournal/silica-rich-soil-found-by-spirit/" },
    ],
  },
];

export const getArtifact = (id: string) => ARTIFACTS.find((a) => a.id === id);

export type Filter = "all" | "moon" | "mars" | "rover" | "lander" | "equipment";

export function filterArtifacts(list: Artifact[], query: string, filter: Filter) {
  const q = query.trim().toLowerCase();
  return list.filter((a) => {
    if (q && !a.name.toLowerCase().includes(q)) return false;
    if (filter === "all") return true;
    if (filter === "moon") return a.destination === "Moon";
    if (filter === "mars") return a.destination === "Mars";
    return a.category === filter;
  });
}

export const TIMELINE = [
  { date: "20 Apr 1967", title: "Surveyor 3 lands", body: "Lands in the Ocean of Storms and digs into lunar soil.", id: "surveyor-3", dest: "Moon" },
  { date: "20 Jul 1969", title: "Apollo 11", body: "Eagle lands at Tranquility Base; the descent stage stays behind.", id: "apollo-11-descent-stage", dest: "Moon" },
  { date: "19 Nov 1969", title: "Apollo 12 visits Surveyor 3", body: "Conrad and Bean bring pieces of Surveyor 3 home.", id: "surveyor-3", dest: "Moon" },
  { date: "31 Jul 1971", title: "Apollo 15", body: "First Lunar Roving Vehicle is driven on the Moon, the day after landing.", id: "lunar-roving-vehicle", dest: "Moon" },
  { date: "21 Apr 1972", title: "Apollo 16", body: "Second rover explores the Descartes Highlands.", id: "lunar-roving-vehicle", dest: "Moon" },
  { date: "11 Dec 1972", title: "Apollo 17", body: "Last crewed lunar landing and last rover, at Taurus–Littrow.", id: "lunar-roving-vehicle", dest: "Moon" },
  { date: "4 Jul 1997", title: "Mars Pathfinder", body: "Pathfinder lands; Sojourner rolls off two days later.", id: "sojourner", dest: "Mars" },
  { date: "27 Sep 1997", title: "Pathfinder falls silent", body: "Final contact with the lander and Sojourner.", id: "sojourner", dest: "Mars" },
  { date: "4 Jan 2004", title: "Spirit lands", body: "Spirit begins exploring Gusev Crater.", id: "spirit", dest: "Mars" },
  { date: "22 Mar 2010", title: "Spirit's last message", body: "Stuck at Troy, Spirit stops communicating.", id: "spirit", dest: "Mars" },
] as const;
