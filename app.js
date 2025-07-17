const API_KEY = 'YOUR-API-KEY-HERE';

const cityInput = document.getElementById('cityInput');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const refreshBtn = document.getElementById('refreshBtn');
const weatherResult = document.getElementById('weatherResult');
const loading = document.getElementById('loading');
const bgVideo = document.getElementById('bgVideo');
const voiceBtn = document.getElementById('voiceBtn');
const toggleModeBtn = document.getElementById('toggleModeBtn');
const forecastTabs = document.getElementById('forecastTabs');

function updateBackground(condition) {
  const videoMap = {
    clear: 'Clear.mp4',
    rain: 'Rain.mp4',
    snow: 'Snow.mp4',
    clouds: 'Clouds.mp4',
    thunderstorm: 'Storm.mp4',
    mist: 'Fog.mp4',
  };
  const lower = condition.toLowerCase();
  for (let key in videoMap) {
    if (lower.includes(key)) {
      bgVideo.src = `videos/${videoMap[key]}`;
      return;
    }
  }
  bgVideo.src = `videos/Weather.mp4`;
}

const fetchWeather = async (city) => {
  try {
    loading.classList.remove('hidden');
    weatherResult.classList.add('hidden');
    forecastTabs.classList.add('hidden');

    const [resNow, resForecast] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
    ]);

    if (!resNow.ok || !resForecast.ok) throw new Error('City not found or API error');

    const now = await resNow.json();
    const forecast = await resForecast.json();

    const { main, weather, name, wind } = now;
    const { temp, humidity } = main;
    const { description, icon } = weather[0];

    updateBackground(description);

    weatherResult.innerHTML = `
      <div class="bg-white/80 dark:bg-black/40 rounded-xl p-5 shadow-md backdrop-blur-sm">
        <h2 class="text-2xl font-semibold">${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" class="mx-auto my-2 w-20 h-20" />
        <p><strong>🌡 Temp:</strong> ${temp}°C</p>
        <p class="capitalize"><strong>🌥 Weather:</strong> ${description}</p>
        <p><strong>💧 Humidity:</strong> ${humidity}%</p>
        <p><strong>🌬 Wind:</strong> ${wind.speed} m/s</p>
      </div>
    `;
    weatherResult.classList.remove('hidden');

    renderForecastTabs(forecast.list);
  } catch (err) {
    weatherResult.innerHTML = `<p class="text-red-500 font-medium">${err.message}</p>`;
    weatherResult.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
  }
};

function renderForecastTabs(data) {
  const daily = {};
  data.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!daily[date]) daily[date] = [];
    daily[date].push(item);
  });

  forecastTabs.innerHTML = '';
  Object.entries(daily).slice(0, 5).forEach(([date, items], idx) => {
    const tempAvg = (items.reduce((a, b) => a + b.main.temp, 0) / items.length).toFixed(1);
    const desc = items[0].weather[0].description;
    const icon = items[0].weather[0].icon;

    const tab = document.createElement('div');
    tab.className = `tab ${idx === 0 ? 'active' : ''}`;
    tab.innerHTML = `
      <p><strong>${date}</strong></p>
      <img src="https://openweathermap.org/img/wn/${icon}.png" class="mx-auto"/>
      <p>${tempAvg}°C</p>
      <p class="capitalize text-sm">${desc}</p>
    `;
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
    forecastTabs.appendChild(tab);
  });
  forecastTabs.classList.remove('hidden');
}

getWeatherBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) {
    weatherResult.innerHTML = `<p class="text-red-500 font-medium">Please enter a city name.</p>`;
    weatherResult.classList.remove('hidden');
    return;
  }
  fetchWeather(city);
});

refreshBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) {
    weatherResult.innerHTML = `<p class="text-red-500 font-medium">Please enter a city name to refresh.</p>`;
    weatherResult.classList.remove('hidden');
    return;
  }
  fetchWeather(city);
});

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') getWeatherBtn.click();
});

voiceBtn.addEventListener('click', () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Your browser doesn't support speech recognition");
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.start();
  recognition.onresult = (e) => {
    cityInput.value = e.results[0][0].transcript;
    getWeatherBtn.click();
  };
});

toggleModeBtn.addEventListener('click', () => {
  const html = document.documentElement;
  html.classList.toggle('dark');
  toggleModeBtn.innerHTML = html.classList.contains('dark')
    ? '<i data-lucide="sun"></i>'
    : '<i data-lucide="moon"></i>';
  lucide.createIcons();
});
