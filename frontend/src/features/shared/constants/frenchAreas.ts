export const FRENCH_AREAS = {
  METROPOLITAN: Array.from({ length: 95 }, (_, i) => {
    const num = i + 1;
    return num.toString().padStart(2, "0");
  }).filter((code) => code !== "20"),
  CORSICA: ["2A", "2B"],
  OVERSEAS: ["971", "972", "973", "974", "975", "976"],
};

export const ALL_FRENCH_AREAS = [
  ...FRENCH_AREAS.METROPOLITAN,
  ...FRENCH_AREAS.CORSICA,
  ...FRENCH_AREAS.OVERSEAS,
];
