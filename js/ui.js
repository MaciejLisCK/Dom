function updateUI(period, hour, min, sec) {
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('time-display').textContent = `${pad(hour)}:${pad(min)}:${pad(sec)}`;

  const greetings = {
    night:   'Dobranoc!',     dawn:    'Dzień dobry!',
    morning: 'Dzień dobry!',  day:     'Miłego dnia!',
    evening: 'Dobry wieczór!',dusk:    'Dobry wieczór!',
  };
  const periods = {
    night: 'Noc', dawn: 'Świt', morning: 'Ranek',
    day: 'Dzień', evening: 'Wieczór', dusk: 'Zmierzch',
  };
  document.getElementById('greeting').textContent     = greetings[period];
  document.getElementById('period-display').textContent = periods[period];
}

function updateWeatherInfo() {
  document.getElementById('weather-info').textContent =
    `Piastów ☁ ${WEATHER.temp}°C · wiatr ${WEATHER.wind} m/s`;
}
