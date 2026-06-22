const countryFlags = {
  DE: '🇩🇪', US: '🇺🇸', GB: '🇬🇧', JP: '🇯🇵', FR: '🇫🇷',
  NL: '🇳🇱', IT: '🇮🇹', ES: '🇪🇸', CZ: '🇨🇿', SG: '🇸🇬',
  AT: '🇦🇹', DK: '🇩🇰', CH: '🇨🇭', IE: '🇮🇪', MA: '🇲🇦',
  IS: '🇮🇸', PT: '🇵🇹', GR: '🇬🇷', ZA: '🇿🇦', NZ: '🇳🇿',
};

const countryNames = {
  DE: 'Germany', US: 'United States', GB: 'United Kingdom',
  JP: 'Japan', FR: 'France', NL: 'Netherlands', IT: 'Italy',
  ES: 'Spain', CZ: 'Czech Republic', SG: 'Singapore', AT: 'Austria',
  DK: 'Denmark', CH: 'Switzerland', IE: 'Ireland', MA: 'Morocco',
  IS: 'Iceland', PT: 'Portugal', GR: 'Greece', ZA: 'South Africa',
  NZ: 'New Zealand',
};

export function countryFlag(code) {
  if (!code) return '';
  return countryFlags[code] || '';
}

export function countryName(code) {
  if (!code) return '';
  return countryNames[code] || code;
}

export { countryFlags, countryNames };
