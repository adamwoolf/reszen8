export const profanityFilter = (text) => {
  const textArray = text.split(" ");
  const profanities = [
    "ass",
    "bastard",
    "bitch",
    "bollocks",
    "bugger",
    "crap",
    "cunt",
    "damn",
    "dick",
    "douche",
    "fag",
    "fuck",
    "hell",
    "idiot",
    "jerk",
    "moron",
    "piss",
    "prick",
    "shit",
    "slut",
    "twat",
    "whore",
    "minge",
    "wank",
  ];
  return textArray.find((word) => profanities.includes(word));
};
