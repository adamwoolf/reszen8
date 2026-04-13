export const categoriser = (text: string) => {
  const TITLE_OVERRIDE_KEYWORDS: Record<string, string[]> = {
    Trauma: ["trauma", "traumatic", "ptsd", "cptsd"],

    "Anxiety Relief": ["anxiety", "anxious", "panic"],
    "Better Sleep": ["sleep", "sleeping", "insomnia", "bedtime"],
    "Stress Relief": ["stress", "stressed", "overwhelm", "overwhelmed"],
    Anger: ["anger", "angry", "rage"],
    Gratitude: ["gratitude", "grateful", "thankful"],
    Mindfulness: ["mindfulness", "mindful", "awareness"],
    Compassion: ["compassion", "compassionate", "empathy"],
    "Loving Kindness": ["loving", "kindness", "love"],
    Relationships: ["relationship", "relationships", "connection"],
    Resilience: ["resilience", "resilient", "strength"],
    "Focus and Concentration": ["focus", "focused", "concentration"],
  };

  const content = text.toLowerCase();

  const lower = text.toLowerCase();

  // --- TITLE OVERRIDE (FIRST 4 WORDS) ---
  const titlePart = lower.split(" - ")[0] ?? "";

  const firstFourWords = titlePart
    .replace(/[^\w\s]/g, "") // strip punctuation / hyphens
    .trim()
    .split(/\s+/)
    .slice(0, 4);

  for (const [category, keywords] of Object.entries(TITLE_OVERRIDE_KEYWORDS)) {
    const match = firstFourWords.some((word) => keywords.some((kw) => word.startsWith(kw)));

    if (match) {
      return [{ category, confidence: 100 }];
    }
  }

  // Category keywords with optional weights
  const categories = {
    Anger: [
      { word: "anger", weight: 3 },
      { word: "frustration", weight: 2 },
      { word: "irritation", weight: 1 },
      { word: "rage", weight: 3 },
      { word: "resentment", weight: 2 },
    ],
    "Anxiety Relief": [
      { word: "anxiety", weight: 3 },
      { word: "worry", weight: 2 },
      { word: "panic", weight: 2 },
      { word: "nervous", weight: 1 },
      { word: "calm", weight: 3 },
      { word: "uneasy", weight: 1 },
    ],
    "Better Sleep": [
      { word: "sleep", weight: 3 },
      { word: "insomnia", weight: 3 },
      { word: "bedtime", weight: 2 },
      { word: "rest", weight: 2 },
      { word: "night", weight: 1 },
      { word: "deep sleep", weight: 3 },
    ],
    Compassion: [
      { word: "compassion", weight: 3 },
      { word: "empathy", weight: 2 },
      { word: "care", weight: 1 },
      { word: "kindness", weight: 2 },
      { word: "forgive", weight: 2 },
      { word: "supportive", weight: 1 },
    ],
    "Focus and Concentration": [
      { word: "focus", weight: 3 },
      { word: "concentration", weight: 3 },
      { word: "attention", weight: 2 },
      { word: "productivity", weight: 1 },
      { word: "mind on task", weight: 2 },
    ],
    Gratitude: [
      { word: "gratitude", weight: 3 },
      { word: "thankful", weight: 3 },
      { word: "appreciate", weight: 2 },
      { word: "blessing", weight: 1 },
      { word: "thank you", weight: 2 },
    ],
    "Loving Kindness": [
      { word: "loving kindness", weight: 3 },
      { word: "love", weight: 2 },
      { word: "affection", weight: 2 },
      { word: "well wishes", weight: 2 },
      { word: "friendliness", weight: 1 },
    ],
    Mindfulness: [
      { word: "mindfulness", weight: 3 },
      { word: "present moment", weight: 2 },
      { word: "awareness", weight: 2 },
      { word: "observe", weight: 1 },
      { word: "notice", weight: 1 },
      { word: "attention", weight: 1 },
    ],
    Relationships: [
      { word: "relationship", weight: 3 },
      { word: "friendship", weight: 2 },
      { word: "connection", weight: 2 },
      { word: "partner", weight: 1 },
      { word: "family", weight: 2 },
      { word: "bond", weight: 1 },
    ],
    Resilience: [
      { word: "resilience", weight: 3 },
      { word: "strength", weight: 2 },
      { word: "overcome", weight: 2 },
      { word: "bounce back", weight: 2 },
      { word: "endurance", weight: 1 },
      { word: "cope", weight: 1 },
    ],
    "Stress Relief": [
      { word: "stress", weight: 3 },
      { word: "pressure", weight: 2 },
      { word: "relieve", weight: 2 },
      { word: "relax", weight: 3 },
      { word: "tension", weight: 1 },
      { word: "overwhelm", weight: 1 },
    ],
    Trauma: [
      { word: "trauma", weight: 3 },
      { word: "healing", weight: 2 },
      { word: "post traumatic", weight: 3 },
      { word: "abuse", weight: 2 },
      { word: "recovery", weight: 2 },
      { word: "painful past", weight: 1 },
    ],
  };

  // Fuzzy word matching helper (matches stems/variations)
  function fuzzyMatch(content, word) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = escaped
      .split(" ")
      .map((w) => `${w}\\w*`) // allow variations like calm -> calming
      .join("\\s+");
    const regex = new RegExp(`\\b${pattern}\\b`, "gi");
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  }

  // Score categories
  let scores = Object.entries(categories).map(([category, keywords]) => {
    let score = 0;
    for (const { word, weight } of keywords) {
      const count = fuzzyMatch(content, word);
      if (count > 0) score += count * weight;
    }
    return { category, score };
  });

  // Remove categories with zero matches
  scores = scores.filter((s) => s.score > 0);

  if (scores.length === 0) {
    return [{ category: "Other", confidence: 0 }];
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // Calculate confidence %
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const results = scores.map((s) => ({
    category: s.category,
    confidence: +((s.score / totalScore) * 100).toFixed(2),
  }));

  // Return top 3
  return results.slice(0, 3);
};

export const sortByEpisode = (array: any[]) => array.sort((a, b) => (Number(a.episode) > Number(b.episode) ? 1 : -1));
