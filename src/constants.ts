import jordan from "./assets/audio/rune.mp3";
import willow from "./assets/audio/Willow.mp3";

export const CONTENT_TYPES = {
  publications: "publications",
  meditations: "meditations",
};

export const AWS_DB_ENDPOINT = "https://r9icwulwxk.execute-api.eu-north-1.amazonaws.com";

export const voiceCodes = {
  "en-GB-SoniaNeural": {
    code: "en-GB-SoniaNeural",
    name: "Willow",
    rate: -3,
    pitch: 0.3,
    styleDegree: 1.8,
    sampleUri: willow,
  },
  "en-GB-OllieMultilingualNeural": {
    code: "en-GB-OllieMultilingualNeural",
    name: "Rune",
    rate: -6,
    pitch: 0.1,
    styleDegree: 1.8,
    sampleUri: jordan,
  },
  "en-GB-LibbyNeural": {
    code: "en-GB-LibbyNeural",
    name: "en-GB-LibbyNeural",
    rate: -7,
    pitch: -0.3,
    styleDegree: 1.1,
  },
  "en-GB-RyanNeural": {
    code: "en-GB-RyanNeural",
    name: "en-GB-RyanNeural",
    rate: -5,
    pitch: -0.3,
    styleDegree: 1.05,
  },
  "en-GB-OliviaNeural": {
    code: "en-GB-OliviaNeural",
    name: "en-GB-OliviaNeural",
    rate: -4,
    pitch: -0.3,
    styleDegree: 1.05,
  },

  "en-GB-BellaNeural": {
    code: "en-GB-BellaNeural",
    name: "OpenAI Article Woman",
    rate: -6,
    pitch: -0.3,
    styleDegree: 1,
  },
};

export const COUNTRIES = [
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "GB", name: "United Kingdom" },
];
