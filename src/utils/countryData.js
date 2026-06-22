const countryNames = {
  DE: 'Germany', US: 'United States', GB: 'United Kingdom',
  JP: 'Japan', FR: 'France', NL: 'Netherlands', IT: 'Italy',
  ES: 'Spain', CZ: 'Czech Republic', SG: 'Singapore', AT: 'Austria',
  DK: 'Denmark', CH: 'Switzerland', IE: 'Ireland', MA: 'Morocco',
  IS: 'Iceland', PT: 'Portugal', GR: 'Greece', ZA: 'South Africa',
  NZ: 'New Zealand',
};

export function countryFlag(code) {
  if (!code || code.length !== 2) return '';
  const base = 0x1F1E6;
  return String.fromCodePoint(base + (code.charCodeAt(0) - 65), base + (code.charCodeAt(1) - 65));
}

export function countryName(code) {
  if (!code) return '';
  return countryNames[code] || code;
}

export { countryNames };
