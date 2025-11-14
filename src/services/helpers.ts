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

export const mapDurationToWords = {
  Recharge: {
    words: "350–380",
    breaks: 17,
    totalPauseTime: "40",
    duration: 1,
    description: "a quick reset.",
    loadingMessage: "Preparing meditation in real time 30 to 45 seconds, blink and it’s done!",
  },
  Refresh: {
    words: "550–600",
    breaks: 19,
    totalPauseTime: "70",
    duration: 4,
    description: "a short, energising pause.",
    loadingMessage: "Preparing meditation in real time 60 to 120 seconds, take a few breaths!",
  },
  Relax: {
    words: "900–950",
    breaks: 28,
    totalPauseTime: "90",
    duration: 8,
    description: "soften tension and slow your pace.",
    loadingMessage: "Preparing meditation in real time 120 to 180 seconds, grab a drink!",
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

const test = {
  Mindfulness: {
    Recharge: {
      words: 550,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 550 words focused on Mindfulness. Include gentle breathing cues, body awareness, and sensory imagery in 5 short sections, ending with a slow mindful close.",
    },
    Refresh: {
      words: 1250,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 1250 words focused on Mindfulness. Use 6–7 sections with progressive awareness, expanding from breath to body to environment, ending with a reflective close.",
    },
    Relax: {
      words: 1750,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 1750 words focused on Mindfulness. Include detailed pacing, breath counts, progressive awareness, and a closing reflection to ground the listener.",
    },
  },
  "Stress Relief": {
    Recharge: {
      words: 570,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 570 words focused on Stress Relief. Guide the listener to release tension through breath and visualization in 5 sections.",
    },
    Refresh: {
      words: 1280,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 1280 words focused on Stress Relief. Include progressive relaxation, soothing imagery, and positive affirmations.",
    },
    Relax: {
      words: 1800,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 1800 words focused on Stress Relief. Blend breathwork, visualization, and full-body release with a gentle closing section.",
    },
  },
  "Better Sleep": {
    Recharge: {
      words: 590,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 590 words for Better Sleep. Use slow rhythm, soft language, and calming bedtime imagery to prepare the listener for rest.",
    },
    Refresh: {
      words: 1320,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 1320 words for Better Sleep. Include a full body scan, nighttime imagery, and gentle countdown relaxation.",
    },
    Relax: {
      words: 1860,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 1860 words for Better Sleep. Build a complete sleep-induction sequence with detailed sensory relaxation and a peaceful ending.",
    },
  },
  "Loving-Kindness": {
    Recharge: {
      words: 610,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 610 words for Loving-Kindness. Focus on compassion phrases and heart-centered breathing.",
    },
    Refresh: {
      words: 1360,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 1360 words for Loving-Kindness. Expand love and goodwill outward in stages—from self to others to the world.",
    },
    Relax: {
      words: 1910,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 1910 words for Loving-Kindness. Create a deep compassion journey ending in gratitude and connection.",
    },
  },
  Gratitude: {
    Recharge: {
      words: 640,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 640 words focused on Gratitude. Encourage reflection on three things the listener appreciates today.",
    },
    Refresh: {
      words: 1420,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 1420 words focused on Gratitude. Guide through layered appreciation of body, people, and life experiences.",
    },
    Relax: {
      words: 2000,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 2000 words focused on Gratitude. Include extended reflective moments and positive affirmations to close.",
    },
  },
  "Anxiety Relief": {
    Recharge: {
      words: 660,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 660 words for Anxiety Relief. Use gentle breathing counts and self-reassurance to create calm.",
    },
    Refresh: {
      words: 1450,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 1450 words for Anxiety Relief. Include gradual relaxation, grounding the body, and emotional soothing.",
    },
    Relax: {
      words: 2050,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 2050 words for Anxiety Relief. Create a full release sequence with breathwork, visualization, and supportive tone.",
    },
  },
  Compassion: {
    Recharge: {
      words: 680,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 680 words focused on Compassion. Emphasize gentle self-kindness and empathy.",
    },
    Refresh: {
      words: 1480,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 1480 words focused on Compassion. Combine self-compassion, compassion for others, and compassion for the world in 3 phases.",
    },
    Relax: {
      words: 2090,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 2090 words focused on Compassion. Include rich imagery and a closing reflection of universal compassion.",
    },
  },
  "Focus & Concentration": {
    Recharge: {
      words: 730,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 730 words for Focus and Concentration. Include step-by-step attention training and breath anchors.",
    },
    Refresh: {
      words: 1550,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 1550 words for Focus and Concentration. Provide 6 structured focus exercises with clear pacing and guidance.",
    },
    Relax: {
      words: 2180,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 2180 words for Focus and Concentration. Include detailed progressive attention and flow-state guidance.",
    },
  },
  Resilience: {
    Recharge: {
      words: 770,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 770 words focused on Resilience. Blend breath awareness with positive inner dialogue and strength imagery.",
    },
    Refresh: {
      words: 1600,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 1600 words focused on Resilience. Use visualization of overcoming challenges and rebuilding inner strength.",
    },
    Relax: {
      words: 2250,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 2250 words focused on Resilience. Create a narrative meditation guiding through adversity to calm confidence.",
    },
  },
  Relationships: {
    Recharge: {
      words: 800,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 800 words focused on Relationships. Center on empathy, connection, and forgiveness.",
    },
    Refresh: {
      words: 1650,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 1650 words focused on Relationships. Reflect on loved ones and compassionate communication.",
    },
    Relax: {
      words: 2320,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 2320 words focused on Relationships. Use visualization to deepen understanding, connection, and peaceful closure.",
    },
  },
  Anger: {
    Recharge: {
      words: 830,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 830 words for Anger Release. Use cooling breath imagery, body scan, and slow relaxation techniques.",
    },
    Refresh: {
      words: 1700,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 1700 words for Anger Release. Guide the listener through recognizing, softening, and releasing anger safely.",
    },
    Relax: {
      words: 2400,
      tone: "soothing",
      prompt:
        "Generate a soothing guided meditation of about 2400 words for Anger Release. Include long cooling visualization, forgiveness practice, and gentle closing section.",
    },
  },
};
