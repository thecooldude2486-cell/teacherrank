// Client-side safety layer for reviews.
// Returns { flagged: true } when a review should be held for admin review,
// and `block` (returned separately) when the submission should be refused
// entirely (silly / bias / clearly off-school content).

const PROFANITY = [
  "fuck", "shit", "bitch", "asshole", "bastard", "cunt", "dick", "piss",
  "slut", "whore", "retard", "fag", "nigger",
];

const ACCUSATION = [
  "abuse", "abusive", "assault", "molest", "pedophile", "paedophile",
  "racist", "racism", "discriminat", "harass", "predator", "groom",
  "violent", "hit my child", "hits children",
];

// Petty / bullying / clearly biased phrasing — we won't publish these.
const BIAS_BULLY = [
  "stupid", "dumb", "idiot", "loser", "ugly", "fat", "smelly", "weird",
  "hate her", "hate him", "hate them", "worst teacher ever",
  "i hate", "boring teacher", "trash teacher", "useless teacher",
  "garbage teacher", "kill", "die",
];

// Silly / joke / non-substantive submissions.
const SILLY_PHRASES = [
  "lol", "lmao", "rofl", "haha", "hehe", "xd", "skibidi", "rizz",
  "sigma", "skull emoji", "no cap", "fr fr", "lmaooo",
];

export type ModerationResult = {
  flagged: boolean;        // hold for admin
  block?: boolean;         // refuse to submit at all
  reason?: string;
};

export function shouldFlagReview(text: string): ModerationResult {
  const raw = text || "";
  const t = raw.toLowerCase().trim();
  if (!t) return { flagged: false };

  // ---- HARD BLOCKS (will not be submitted) ----

  // Bullying / petty insults aimed at the teacher.
  for (const w of BIAS_BULLY) {
    if (t.includes(w)) return { flagged: true, block: true, reason: "This sounds unkind or biased. Please reword it constructively." };
  }

  // Silly / joke submissions.
  const sillyHit = SILLY_PHRASES.some(w => new RegExp(`(^|\\s)${w}(\\s|$|!|\\.)`).test(t));
  const letters = raw.replace(/[^A-Za-z]/g, "");
  const onlyEmojiOrPunct = letters.length === 0 && raw.length > 0;
  const repeatedChars = /(.)\1{5,}/.test(t);                  // "aaaaaa", "!!!!!!"
  const keyboardMash = /\b[a-z]{6,}\b/.test(t) && !/[aeiou]/.test(t.match(/\b[a-z]{6,}\b/)?.[0] || "a");
  if (sillyHit || onlyEmojiOrPunct || repeatedChars || keyboardMash)
    return { flagged: true, block: true, reason: "This looks like a joke or test review. Please write real, specific feedback." };

  // Minimum length check removed — any length (including empty) is allowed.

  // Single repeated word.
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length >= 4 && new Set(words).size === 1)
    return { flagged: true, block: true, reason: "Please write real feedback, not a repeated word." };

  // ---- SOFT FLAGS (held for admin review) ----

  if (PROFANITY.some(w => new RegExp(`\\b${w}`, "i").test(t)))
    return { flagged: true, reason: "Possible offensive language" };

  if (ACCUSATION.some(w => t.includes(w)))
    return { flagged: true, reason: "Serious accusation — needs review" };

  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(raw))
    return { flagged: true, reason: "Possible personal information (email)" };
  if (/(?:\+?\d[\d\s\-().]{7,}\d)/.test(raw))
    return { flagged: true, reason: "Possible personal information (phone)" };

  if (letters.length > 20 && letters === letters.toUpperCase())
    return { flagged: true, reason: "Excessive shouting (all caps)" };

  return { flagged: false };
}
