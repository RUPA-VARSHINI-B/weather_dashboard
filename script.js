const API_KEY = "dbe71dc4031f695b5b10133b33d43853";
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const currentTempEl = document.getElementById('current-temp');
const weatherForecastEl = document.getElementById('weather-forecast');

setInterval(() => {
    const now = new Date();
    const day = now.getDay(), date = now.getDate(), month = now.getMonth();
    const hour = now.getHours(), min = now.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hr12 = hour % 12 || 12;

    timeEl.innerHTML = `${hr12.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} <span id="am-pm">${ampm}</span>`;
    dateEl.innerHTML = `${days[day]}, ${date} ${months[month]}`;
}, 1000);

navigator.geolocation.getCurrentPosition(success => {
    const { latitude, longitude } = success.coords;
    getWeatherData(latitude, longitude);
});

function getWeatherData(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            showWeatherData(data);
        })
        .catch(err => console.error('Error fetching weather:', err));
}

function showWeatherData(data) {
    timezone.innerHTML = data.city.name;
    countryEl.innerHTML = `${data.city.coord.lat.toFixed(2)}°N ${data.city.coord.lon.toFixed(2)}°E`;

    // current weather (first item)
    const current = data.list[0];
    currentTempEl.innerHTML = `
        <img src="http://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png" class="w-icon" />
        <div class="other">
            <div class="day">${days[new Date(current.dt_txt).getDay()]}</div>
            <div class="temp">Temp - ${current.main.temp}°C</div>
            <div class="temp">Feels like - ${current.main.feels_like}°C</div>
        </div>
    `;

    currentWeatherItemsEl.innerHTML = `
        <div class="weather-item"><div>Humidity</div><div>${current.main.humidity}%</div></div>
        <div class="weather-item"><div>Pressure</div><div>${current.main.pressure} hPa</div></div>
        <div class="weather-item"><div>Wind Speed</div><div>${current.wind.speed} m/s</div></div>
    `;

    // group forecast by date
    const grouped = {};
    data.list.forEach(entry => {
        const date = entry.dt_txt.split(" ")[0];
        const hour = parseInt(entry.dt_txt.split(" ")[1].split(":")[0]);
        if (!grouped[date]) grouped[date] = { day: [], night: [], icons: [] };
        if (hour >= 6 && hour <= 18) grouped[date].day.push(entry.main.temp);
        else grouped[date].night.push(entry.main.temp);
        grouped[date].icons.push(entry.weather[0].icon);
    });

    const forecastHTML = Object.keys(grouped).slice(1, 8).map(date => {
        const temps = grouped[date];
        const dayTemp = temps.day.length ? average(temps.day).toFixed(1) : "-";
        const nightTemp = temps.night.length ? average(temps.night).toFixed(1) : "-";
        const icon = temps.icons[Math.floor(temps.icons.length / 2)];
        const dayName = days[new Date(date).getDay()];
        return `
            <div class="weather-forecast-item">
                <div class="day">${dayName}</div>
                <img src="http://openweathermap.org/img/wn/${icon}@2x.png" class="w-icon" />
                <div class="temp">Night - ${nightTemp}°C</div>
                <div class="temp">Day - ${dayTemp}°C</div>
            </div>
        `;
    }).join("");

    weatherForecastEl.innerHTML = forecastHTML;
}

function average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}
