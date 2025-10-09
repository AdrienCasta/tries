export const FRENCH_COUNTIES = {
  METROPOLITAN: Array.from({ length: 95 }, (_, i) => {
    const num = i + 1
    return num.toString().padStart(2, '0')
  }).filter(code => code !== '20'),
  CORSICA: ['2A', '2B'],
  OVERSEAS: ['971', '972', '973', '974', '975', '976'],
}

export const ALL_FRENCH_COUNTIES = [
  ...FRENCH_COUNTIES.METROPOLITAN,
  ...FRENCH_COUNTIES.CORSICA,
  ...FRENCH_COUNTIES.OVERSEAS,
]
