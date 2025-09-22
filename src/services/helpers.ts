export const MedTypesAndAffirmations = [
  {
    type: "Stress Relief",
    description:
      "Focus on helping the listener gently release physical and mental tension. Guide them through deep breathing, body scanning, and grounding visualisation.",
    affirmations: ["I am safe in this moment.", "I let go of what I can’t control.", "I allow myself to relax."],
    voice: { name: "Kaine", id: "9agwA7PWqxuZ6L2Difh5" },
  },
  {
    type: "Loving & Kindness",
    description:
      "Guide the listener to cultivate warmth and goodwill toward themselves and others. Use gentle imagery and offer affirmations.",
    affirmations: ["May I be happy.", "May you be well.", "May we all feel love and peace."],
    voice: { name: "Archer", id: "xGDJhCwcqw94ypljc95Z" },
  },
  {
    type: "Better Sleep",
    description:
      "Help the listener transition toward rest with slow, soft narration. Use breathwork, body relaxation, and fading visualisation.",
    affirmations: ["My body is ready for rest.", "I welcome calm and stillness.", "I release the day with ease."],
    voice: { name: "Kaine", id: "9agwA7PWqxuZ6L2Difh5" },
  },
  {
    type: "Focus & Concentration",
    description:
      "Strengthen the listener’s mental clarity using breath anchoring and focused attention. Encourage stillness and returning to the present.",
    affirmations: ["I am focused and clear.", "My mind is steady.", "I return to the moment with ease."],
    voice: { name: "Leanne", id: "HXOwtW4XU7Ne6iOiDHTl" },
  },
  {
    type: "Mindfulness",
    description:
      "Support the listener in being fully present. Guide them through breath and sensory awareness, with non-judgmental observation.",
    affirmations: ["I am here, now.", "I notice, without judgment.", "Each moment is enough."],
    voice: { name: "Archer", id: "xGDJhCwcqw94ypljc95Z" },
  },
  {
    type: "Compassion",
    description: "Help the listener open their heart to others and themselves. Use gentle, empathetic language.",
    affirmations: ["I meet myself with kindness.", "I care deeply for others.", "Compassion flows through me."],
    voice: { name: "Archer", id: "xGDJhCwcqw94ypljc95Z" },
  },
  {
    type: "Gratitude",
    description:
      "Encourage the listener to reflect on what they’re thankful for. Use grounding moments and warm imagery.",
    affirmations: ["I appreciate the small things.", "I am grateful for this moment.", "Gratitude fills my heart."],
    voice: { name: "Leanne", id: "HXOwtW4XU7Ne6iOiDHTl" },
  },
  {
    type: "Anxiety Relief",
    description:
      "Gently guide the listener to calm anxious thoughts. Use breath control, grounding imagery, and reassurance.",
    affirmations: ["I am grounded and safe.", "This feeling will pass.", "I trust myself to handle this moment."],
    voice: { name: "Kaine", id: "9agwA7PWqxuZ6L2Difh5" },
  },
  {
    type: "Resilience",
    description: "Empower the listener to connect with inner strength and calm. Use confident, reassuring language.",
    affirmations: ["I am stronger than I think.", "I can rise and begin again.", "I bend, but I do not break."],
    voice: { name: "Leanne", id: "HXOwtW4XU7Ne6iOiDHTl" },
  },
  {
    type: "Relationships",
    description:
      "Guide the listener in reflecting on their connection with others. Encourage empathy and communication.",
    affirmations: [
      "I listen with an open heart.",
      "I bring presence to my relationships.",
      "I give and receive love freely.",
    ],
    voice: { name: "Archer", id: "xGDJhCwcqw94ypljc95Z" },
  },
  {
    type: "Anger",
    description:
      "Support the listener in recognising and soothing anger. Use grounding breath and emotional awareness.",
    affirmations: ["I am calm and centred.", "I respond with clarity, not reaction.", "I allow this feeling to pass."],
    voice: { name: "Kaine", id: "9agwA7PWqxuZ6L2Difh5" },
  },
];

export const PracticeTypes = [
  {
    name: "Vipassana",
    description:
      "A classical Buddhist practice that means “clear seeing.” Vipassana guides you to observe sensations, thoughts, and emotions as they arise and pass away, cultivating deep insight into the nature of mind and reality.",
  },
  {
    name: "Zen (Zazen)",
    description:
      "The central practice of Japanese Zen Buddhism. Zazen is “just sitting”—resting in open awareness without trying to change or control the experience, allowing calm and clarity to naturally emerge.",
  },
  {
    name: "Tibetan (Dzogchen / Mahamudra)",
    description:
      "Advanced Tibetan Buddhist practices of resting in non-dual awareness. Instead of focusing on objects of meditation, you recognise the mind’s natural, spacious, and luminous nature.",
  },
  {
    name: "Mindfulness-Based Stress Reduction (MBSR)",
    description:
      "A secular program developed by Jon Kabat-Zinn. It uses simple mindfulness techniques—such as paying attention to the breath, body, and daily activities—to reduce stress and improve well-being.",
  },
  {
    name: "Transcendental Meditation (TM)",
    description:
      "A mantra-based practice introduced by Maharishi Mahesh Yogi. Practitioners silently repeat a specific sound (mantra) in a relaxed way, leading to effortless calm and deep rest.",
  },
  {
    name: "Yogic Meditation",
    description:
      "Rooted in Hindu traditions, this broad category includes practices such as breath control (prāṇāyāma), mantra repetition, and focusing on energy centres (chakras) to harmonise body, mind, and spirit.",
  },
  {
    name: "Taoist Meditation",
    description:
      "Practices from Taoist philosophy that often combine gentle movement (like Qigong), breathing, and internal energy work. The aim is to cultivate balance, vitality, and harmony with the natural flow of life.",
  },
  {
    name: "Secular Mindfulness Meditation",
    description:
      "A modern, non-religious form of mindfulness. It draws from Buddhist roots but is presented in a simple, practical way to help reduce stress, improve focus, and bring awareness into everyday life.",
  },
];

// export const mapDurationToWords = {
//   3: { words: 375, breaks: 17 },
//   5: { words: 625, breaks: 19 },
//   8: { words: 1000, breaks: 28 },
//   10: { words: 1250, breaks: 35 },
//   15: { words: 1900, breaks: 55 },
// };

export const mapDurationToWords = {
  MiniMed: {
    words: "350–380",
    breaks: 17,
    totalPauseTime: "40",
    duration: 1,
    description:
      "A quick dip into meditation, ideal for beginners or for testing the practice. Just a few mindful breaths can help you pause, reset, and reconnect with yourself. Additionally, if you’re on the move and just need a moment of calm, this one is for you. ",
  },
  Reset: {
    words: "550–600",
    breaks: 19,
    totalPauseTime: "70",
    duration: 4,
    description:
      "A short but powerful session designed to clear your head and refresh your focus. Perfect for slipping in between meetings, before a big event, or whenever you need a quick mental reset.",
  },
  Timeout: {
    words: "900–950",
    breaks: 28,
    totalPauseTime: "90",
    duration: 8,
    description:
      "A longer, immersive session that gives you enough space to step away from the busyness of life. It helps you let go of stress and return to a calm, a cantered state, your personal safe space.",
  },
  // Relax: {
  //   words: "1100–1150",
  //   breaks: 35,
  //   totalPauseTime: "100",
  //   duration: 12,
  //   description: "Change gear completely. Perfect wind-down at the end of the day",
  // },
  // 15: { words: 1900, breaks: 55 },
};
