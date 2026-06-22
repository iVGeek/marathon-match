const countryNames = {
  DE: 'Germany', US: 'United States', GB: 'United Kingdom',
  JP: 'Japan', FR: 'France', NL: 'Netherlands', IT: 'Italy',
  ES: 'Spain', CZ: 'Czech Republic', SG: 'Singapore', AT: 'Austria',
  DK: 'Denmark', CH: 'Switzerland', IE: 'Ireland', MA: 'Morocco',
  IS: 'Iceland', PT: 'Portugal', GR: 'Greece', ZA: 'South Africa',
  NZ: 'New Zealand',
};

export function countryFlag(code) {
  if (!code) return null;
  return `https://cdn.jsdelivr.net/gh/lipis/flag-icons@main/flags/4x3/${code.toLowerCase()}.svg`;
}

export function countryName(code) {
  if (!code) return '';
  return countryNames[code] || code;
}

export { countryNames };
