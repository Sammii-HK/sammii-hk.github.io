/**
 * Tests for a mind, placed by the evidence each one inspects, from what a
 * thing says and does to how its brain responds and how it is built. The
 * column is a fact about the method, not a judgement of the test. Sources
 * in the page footer.
 */
export type Who = "machine" | "animal" | "person" | "any";
export type Kind = "test" | "argument" | "fiction" | "measure";

export const COLUMNS = [
  { id: "says", label: "What it says", sub: "conversation, answers, artefacts" },
  { id: "does", label: "What it does", sub: "actions and responses" },
  { id: "body", label: "How its body reacts", sub: "involuntary physiology" },
  { id: "brain", label: "What its brain does", sub: "neural responses" },
  { id: "built", label: "How it is built", sub: "causal structure, architecture" },
] as const;
export type Column = (typeof COLUMNS)[number]["id"];

export type Entry = {
  id: string;
  name: string;
  year: number;
  col: Column;
  kind: Kind;
  who: Who[];
  /** what it is after, in its authors' terms */
  after: string;
  line: string;
  detail: string;
  src: string;
  caveat?: string;
};

export const ENTRIES: Entry[] = [
  {
    id: "turing", name: "The imitation game", year: 1950, col: "says", kind: "test", who: ["machine", "person"],
    after: "thinking. Turing proposed replacing the question can machines think with a game that could actually be played.",
    line: "An interrogator holds text-only conversations with a hidden person and a hidden machine and has to say which is which.",
    detail: "Only conversation counts: no voice, no body. In 2025, in a three-party version with five-minute chats, GPT-4.5 prompted to adopt a humanlike persona was judged to be the human 73% of the time, more often than the real people it was paired with.",
    src: "Turing 1950, Computing Machinery and Intelligence, Mind 59:433; Jones and Bergen 2025, Large language models pass the Turing test, arXiv:2503.23674 (PNAS, 2026).",
  },
  {
    id: "searle", name: "The Chinese room", year: 1980, col: "says", kind: "argument", who: [],
    after: "understanding, as opposed to producing the right output.",
    line: "A person who knows no Chinese follows a rulebook and gives fluent answers in Chinese. Searle argued that following rules for symbols is not understanding them.",
    detail: "Not a test but an argument about tests: that passing one on behaviour alone, like the imitation game, cannot show understanding, because syntax is not semantics. It ran alongside more than thirty pages of replies from other researchers, and Searle's response.",
    src: "Searle 1980, Minds, brains, and programs, Behavioral and Brain Sciences 3:417.",
  },
  {
    id: "lovelace", name: "The Lovelace test", year: 2001, col: "says", kind: "test", who: ["machine"],
    after: "creativity, as evidence of a mind rather than a mechanism.",
    line: "A system passes if it makes something original, by a process it can repeat, that its own designers cannot explain.",
    detail: "Named for Ada Lovelace, who wrote in 1843 that the Analytical Engine has no pretensions to originate anything. Riedl noted it is widely considered unbeatable, so his Lovelace 2.0 (2014) asks instead for an artefact that meets constraints a human judge sets, which lets systems be compared.",
    src: "Lovelace 1843, Note G to her translation of Menabrea; Bringsjord, Bello and Ferrucci 2001, Creativity, the Turing test, and the (better) Lovelace test, Minds and Machines 11:3; Riedl 2014, arXiv:1410.6142.",
  },
  {
    id: "act", name: "AI Consciousness Test", year: 2017, col: "says", kind: "test", who: ["machine"],
    after: "experience, probed through language.",
    line: "An AI kept away from human writing about the mind is asked harder and harder questions about experience: a self beyond the body, an afterlife, the hard problem.",
    detail: "Its authors count a pass as enough to suggest consciousness but not necessary for it. It depends on the box: the AI must not have learnt the answers from us, which a model trained on human writing already has.",
    src: "Schneider and Turner 2017, Is anyone home? A way to find out if AI has become self-aware, Scientific American; Schneider 2019, Artificial You.",
  },
  {
    id: "mirror", name: "Mirror self-recognition", year: 1970, col: "does", kind: "test", who: ["animal", "person"],
    after: "self-awareness, read from behaviour.",
    line: "After time with a mirror, a mark is put where the animal can only see it reflected. Touching or inspecting the mark counts as recognising itself.",
    detail: "Gallup's chimpanzees passed. Since then, bottlenose dolphins (2001), Asian elephants (2006) and magpies (2008), though a magpie replication failed in 2020, and, contested, cleaner wrasse fish (2019).",
    src: "Gallup 1970, Chimpanzees: self-recognition, Science 167:86; Reiss and Marino 2001, PNAS 98:5937; Plotnik, de Waal and Reiss 2006, PNAS 103:17053; Prior, Schwarz and Güntürkün 2008, PLoS Biol 6:e202; Soler et al. 2020, J Comp Psychol 134:363; Kohda et al. 2019, PLoS Biol 17:e3000021.",
  },
  {
    id: "gcs", name: "Glasgow Coma Scale", year: 1974, col: "does", kind: "measure", who: ["person"],
    after: "the level of consciousness, read from responsiveness.",
    line: "A bedside rating of how a patient opens their eyes, speaks and moves, used to grade impaired consciousness.",
    detail: "It is how hospitals measure consciousness every day, and it does it entirely through behaviour. Current guidance is to report the three parts separately rather than add them into one score.",
    src: "Teasdale and Jennett 1974, Assessment of coma and impaired consciousness, Lancet 2:81; Teasdale et al. 2014, Lancet Neurol 13:844.",
  },
  {
    id: "vk", name: "The Voigt-Kampff test", year: 1968, col: "body", kind: "fiction", who: ["person", "machine"],
    after: "empathy, as the mark of a human.",
    line: "Fiction. Questions built to provoke empathy, while instruments read involuntary responses: capillary dilation in the face, the blush, and tension in the eye muscles.",
    detail: "In Philip K. Dick's novel, the bounty hunter Rick Deckard uses it to tell humans from androids, on the premise that only humans feel empathy, and slowly loses confidence in what it shows. Dick spelt it Voigt-Kampff; the 1982 film Blade Runner made it Voight.",
    src: "Dick 1968, Do Androids Dream of Electric Sheep?, Doubleday; described in Oliver, Higgs and Clayton 2021, Journal of Literature and Science 14:108.",
  },
  {
    id: "owen", name: "Imagining tennis in a scanner", year: 2006, col: "brain", kind: "test", who: ["person"],
    after: "awareness, without any outward behaviour.",
    line: "A patient diagnosed as vegetative was asked, inside an fMRI scanner, to imagine playing tennis or walking round her home. Her brain responded like healthy volunteers'.",
    detail: "She met every behavioural criterion for the vegetative state; her brain followed the instructions. In a 2010 follow-up, 5 of 54 patients could do it, and one answered yes or no questions by choosing which to imagine.",
    src: "Owen et al. 2006, Detecting awareness in the vegetative state, Science 313:1402; Monti et al. 2010, NEJM 362:579.",
  },
  {
    id: "pci", name: "Perturbational complexity index", year: 2013, col: "brain", kind: "measure", who: ["person"],
    after: "the capacity for consciousness, from brain dynamics alone.",
    line: "A magnetic pulse is sent into the cortex and the EEG echo is compressed. Complex echoes go with being conscious, simple ones with dreamless sleep, anaesthesia and the vegetative state.",
    detail: "Designed to need no response at all from the patient. A 2016 study set a cut-off that separated conscious from unconscious states in all 150 people it was set on, and found 9 of 43 vegetative-state patients above it.",
    src: "Casali et al. 2013, A theoretically based index of consciousness independent of sensory processing and behavior, Sci Transl Med 5:198ra105; Casarotto et al. 2016, Ann Neurol 80:718.",
  },
  {
    id: "iit", name: "Integrated information, Φ", year: 2004, col: "built", kind: "measure", who: ["any"],
    after: "consciousness itself, from causal structure.",
    line: "A number for how far a system's parts, through their causes and effects, form a whole beyond themselves. The theory says that number is the amount of consciousness.",
    detail: "In principle it applies to anything, brain or chip. In practice the exact calculation grows exponentially with size and has been done only for systems of about a dozen elements.",
    caveat: "Contested. In 2023, 124 researchers signed a letter calling the theory pseudoscience, and a 2025 adversarial test against global workspace theory challenged key claims of both.",
    src: "Tononi 2004, An information integration theory of consciousness, BMC Neurosci 5:42; Mayner et al. 2018, PLoS Comput Biol 14:e1006343; Lenharo 2023, Nature news; Cogitate Consortium 2025, Nature 642:133.",
  },
  {
    id: "indicators", name: "Indicator properties", year: 2023, col: "built", kind: "measure", who: ["machine"],
    after: "consciousness, as scientific theories of it predict.",
    line: "An AI system's architecture is checked against features that leading theories tie to consciousness, such as recurrent processing and a global workspace.",
    detail: "The nineteen authors' analysis suggests no current AI system is conscious, and that there is no obvious technical barrier to building one that has the indicators. The method is only as good as the theories it borrows.",
    src: "Butlin, Long et al. 2023, Consciousness in Artificial Intelligence: Insights from the Science of Consciousness, arXiv:2308.08708; Butlin et al. 2026, Trends Cogn Sci 30:488.",
  },
];
