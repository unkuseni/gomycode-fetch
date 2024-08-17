const button = document.querySelector("#btn");
const address = document.querySelector("#address");
button.addEventListener("click", async () => {
	const retData = await getWeather(address.value);
	console.log(retData);
	if (retData) renderData(retData);
});
const dataDiv = document.querySelector("#weatherdata");
/**
 * Fetches weather data for a given address.
 * @param {string} address - The address to get the weather for.
 */
async function getWeather(address) {
	const data = await getLatLng(address);
	if (!data) return;

	const { lat, lon, display_name } = data;
	const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation&daily=temperature_2m_min,apparent_temperature_min,sunrise,sunset,daylight_duration,uv_index_max,precipitation_probability_max`;

	try {
		const response = await fetch(url);
		const weatherData = await response.json();
		return { weather: weatherData, city: display_name };
	} catch (error) {
		console.error("Error:", error);
	}
}

/**
 * Retrieves the latitude and longitude data for a given address.
 *
 * @param {string} address - The address to get the latitude and longitude for.
 * @return {object} The latitude and longitude data.
 */
async function getLatLng(address) {
	const parsedAddress = encodeURIComponent(address);
	const url = `https://geocode.maps.co/search?q=${parsedAddress}&api_key=66c0e17670577606046679xcg9d1660`;
	const response = await fetch(url);
	const data = await response.json();
	if (!data || !data[0]) {
		console.error("Error: getLatLng returned no data");
		return;
	}
	return data[0];
}

function renderData(returnedData) {
	const [today, time] = returnedData.weather.current.time.split("T");
	const liArray = [];
	for (let i = 0; i < returnedData.weather.daily.time.length; i++) {
		liArray.push(
			` <li class="w-full border-y">
              <article class="w-full">
                <p>${returnedData.weather.daily.time[i]}</p>
                <p class="flex w-full justify-center gap-3"><span>Temperature: ${
									returnedData.weather.daily.temperature_2m_min[i]
								} ${
				returnedData.weather.daily_units.temperature_2m_min
			}</span><span>apparent temmperature: ${
				returnedData.weather.daily.apparent_temperature_min[i]
			} ${returnedData.weather.daily_units.apparent_temperature_min}</span></p>
                <p class="flex w-full justify-center gap-3"><span> Sunrise: ${
									returnedData.weather.daily.sunrise[i].split("T")[1]
								} ${returnedData.weather.timezone}</span><span>Sunset: ${
				returnedData.weather.daily.sunset[i].split("T")[1]
			} ${returnedData.weather.timezone}</span></p>
                <p> Daylight Duration: ${
									Math.round(returnedData.weather.daily.daylight_duration[i] / 3600)
								} hrs</p>
                <p> UV Index: ${returnedData.weather.daily.uv_index_max[i]}</p>
                <p> Precipitation Probability: ${
									returnedData.weather.daily.precipitation_probability_max[i]
								} ${returnedData.weather.daily_units.precipitation_probability_max}</p>
              </article>
            </li>`
		);
	}
	dataDiv.innerHTML = `<div class="text-center">
          <h4>${returnedData.city}</h4>
          <article class="w-full">
            <p class="flex justify-center gap-3"><span>${
							returnedData.weather.latitude
						}</span><span>${returnedData.weather.longitude}</span></p>
            <p>Elevation: ${returnedData.weather.elevation}m Timezone: ${returnedData.weather.timezone}</p>
          </article>
          <ul class="w-full ">
            <li class="w-full border-y">
              <article class="w-full">
                <p class="flex justify-center gap-3"><span>${today}</span><span>${time}</span></p>
                <p>Precipitation: ${
									returnedData.weather.current.precipitation
								} ${returnedData.weather.current_units.precipitation}</p>
              </article>
            </li>
         
            ${liArray.join("")}
          </ul>
        </div>
  `;
}
