const weatherData = {
  berlin:     { tempC: 16, condition: 'Mild, possible light rain', month: 'Sep' },
  boston:     { tempC: 12, condition: 'Cool, possible headwind', month: 'Apr' },
  london:     { tempC: 13, condition: 'Cool, light rain possible', month: 'Apr' },
  chicago:    { tempC: 11, condition: 'Cool, windy from lake', month: 'Oct' },
  nyc:        { tempC: 12, condition: 'Cool, light wind', month: 'Nov' },
  tokyo:      { tempC: 14, condition: 'Cool, low humidity', month: 'Mar' },
  bigsur:     { tempC: 13, condition: 'Cool, coastal fog possible', month: 'Apr' },
  paris:      { tempC: 14, condition: 'Mild, possible showers', month: 'Apr' },
  amsterdam:  { tempC: 11, condition: 'Cool, windy', month: 'Oct' },
  rome:       { tempC: 16, condition: 'Mild, sunny', month: 'Mar' },
  valencia:   { tempC: 14, condition: 'Cool start, warming up', month: 'Dec' },
  prague:     { tempC: 14, condition: 'Mild, sunny', month: 'May' },
  'marina-bay': { tempC: 28, condition: 'Hot, humid', month: 'Dec' },
  vienna:     { tempC: 15, condition: 'Mild, sunny', month: 'Apr' },
  copenhagen: { tempC: 14, condition: 'Cool, sea breeze', month: 'May' },
  geneva:     { tempC: 17, condition: 'Mild, lakeside breeze', month: 'May' },
  barcelona:  { tempC: 18, condition: 'Mild to warm, sunny', month: 'Mar' },
  dublin:     { tempC: 12, condition: 'Cool, overcast', month: 'Oct' },
  marrakech:  { tempC: 22, condition: 'Warm, dry', month: 'Jan' },
  reykjavik:  { tempC: 10, condition: 'Cool, possible wind', month: 'Aug' },
  'berlin-half': { tempC: 16, condition: 'Mild', month: 'Apr' },
  'boston-half': { tempC: 14, condition: 'Cool', month: 'Oct' },
  'nyc-half':  { tempC: 10, condition: 'Cold start', month: 'Mar' },
  'lisbon-half': { tempC: 18, condition: 'Mild, coastal', month: 'Mar' },
  'prague-half': { tempC: 16, condition: 'Mild', month: 'Apr' },
  'valencia-half': { tempC: 14, condition: 'Cool', month: 'Oct' },
  greek:      { tempC: 18, condition: 'Warm, sunny', month: 'Nov' },
  'golden-gate-half': { tempC: 14, condition: 'Cool, foggy', month: 'Nov' },
  'comrades-down': { tempC: 18, condition: 'Warm, humid', month: 'Jun' },
  'comrades-up': { tempC: 18, condition: 'Warm, humid', month: 'Jun' },
  'two-oceans': { tempC: 16, condition: 'Mild, coastal wind', month: 'Apr' },
  ccc:        { tempC: 12, condition: 'Cool alpine, variable', month: 'Aug' },
  utmb:       { tempC: 10, condition: 'Cold alpine, snow possible', month: 'Aug' },
  'western-states': { tempC: 28, condition: 'Hot, dry canyons', month: 'Jun' },
  leadville:  { tempC: 12, condition: 'Cool, thin air at altitude', month: 'Aug' },
  tarawera:   { tempC: 18, condition: 'Warm, possibility of rain', month: 'Feb' },
  'marathon-des-sables': { tempC: 38, condition: 'Extreme heat, desert', month: 'Apr' },
  rotterdam:  { tempC: 12, condition: 'Cool, possible headwind', month: 'Apr' },
  stockholm:  { tempC: 14, condition: 'Mild, sunny', month: 'Jun' },
  ottawa:     { tempC: 15, condition: 'Mild, light wind', month: 'May' },
  'hong-kong': { tempC: 22, condition: 'Humid, warm', month: 'Feb' },
  'los-angeles': { tempC: 16, condition: 'Cool start, warming up', month: 'Mar' },
  munich:     { tempC: 13, condition: 'Cool, possible rain', month: 'Oct' },
  budapest:   { tempC: 15, condition: 'Mild, sunny', month: 'Oct' },
  warsaw:     { tempC: 12, condition: 'Cool, overcast', month: 'Sep' },
  lisbon:     { tempC: 17, condition: 'Mild, coastal breeze', month: 'Oct' },
};

function getWeather(courseId) {
  return weatherData[courseId] || null;
}

function tempAdjustment(userTempC, courseTempC) {
  if (userTempC == null || courseTempC == null) return 1;
  const optimal = 12;
  const uDiff = Math.abs(userTempC - optimal);
  const cDiff = Math.abs(courseTempC - optimal);
  const diff = cDiff - uDiff;
  return Math.max(0.5, Math.min(1.5, 1 + diff * 0.003));
}

export { weatherData, getWeather, tempAdjustment };
