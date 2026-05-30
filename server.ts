import express from "express";
import path from "path";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dns from "dns";

// Fix Node.js modern DNS resolution preference for localhost
dns.setDefaultResultOrder("ipv4first");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize the Google GenAI SDK if key is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Google GenAI SDK initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Google GenAI SDK:", error);
  }
} else {
  console.log("No GEMINI_API_KEY found, fallback text advice will be used.");
}

// Procedural simulation profiles for cities if API Key is not set or fails
const PRESETS: Record<string, {
  country: string;
  temp: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  aqi: number;
  uv: number;
}> = {
  tokyo: { country: "JP", temp: 18, condition: "Clouds", description: "scattered clouds with soft sunlight", icon: "03d", humidity: 62, windSpeed: 3.2, windDeg: 120, aqi: 2, uv: 4 },
  london: { country: "GB", temp: 11, condition: "Rain", description: "gentle misty rain and damp streets", icon: "09d", humidity: 88, windSpeed: 4.8, windDeg: 240, aqi: 1, uv: 1 },
  newyork: { country: "US", temp: 22, condition: "Clear", description: "beautiful sunny sky", icon: "01d", humidity: 45, windSpeed: 5.5, windDeg: 180, aqi: 3, uv: 7 },
  sydney: { country: "AU", temp: 24, condition: "Clear", description: "warm blue skies and cool coastal breeze", icon: "01d", humidity: 55, windSpeed: 6.2, windDeg: 160, aqi: 1, uv: 8 },
  paris: { country: "FR", temp: 16, condition: "Clouds", description: "overcast sky over the Seine", icon: "04d", humidity: 70, windSpeed: 2.1, windDeg: 90, aqi: 2, uv: 3 },
  cairo: { country: "EG", temp: 33, condition: "Clear", description: "intense heat and crystal clear horizon", icon: "01d", humidity: 28, windSpeed: 5.1, windDeg: 30, aqi: 4, uv: 10 },
  reykjavik: { country: "IS", temp: -1, condition: "Snow", description: "light powdery snowflakes drifting down", icon: "13d", humidity: 80, windSpeed: 8.5, windDeg: 320, aqi: 1, uv: 0 },
  vancouver: { country: "CA", temp: 9, condition: "Mist", description: "heavy morning fog rolling in", icon: "50d", humidity: 95, windSpeed: 1.5, windDeg: 40, aqi: 1, uv: 1 },
  mumbai: { country: "IN", temp: 30, condition: "Thunderstorm", description: "active monsoon storm with heavy rain", icon: "11d", humidity: 85, windSpeed: 9.3, windDeg: 210, aqi: 4, uv: 6 },
  singapore: { country: "SG", temp: 31, condition: "Clouds", description: "warm, tropical heavy cumulus clouds", icon: "02d", humidity: 78, windSpeed: 4.2, windDeg: 80, aqi: 2, uv: 9 }
};

// Generates a fully detailed simulation weather profile based on the city name hash
function generateSimulation(city: string, lat?: number, lon?: number): any {
  const normCity = city.trim();
  const searchKey = normCity.toLowerCase().replace(/\s+/g, "");
  
  // Choose presets where possible to make default searching look highly polished
  const preset = PRESETS[searchKey];
  
  // Custom hash function to procedurally generate features for other cities
  let hash = 0;
  for (let i = 0; i < normCity.length; i++) {
    hash = normCity.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const finalCountry = preset ? preset.country : (lat && lon ? "LOC" : ["US", "CA", "FR", "DE", "IT", "JP", "IN", "BR", "ES", "CH"][hash % 10]);
  const finalTemp = preset ? preset.temp : Math.floor((hash % 45) - 10); // -10 to 35
  
  // Determine weather conditions based on temperature and city code
  let mainCondition = "Clear";
  let description = "clear blue sky";
  let icon = "01d";
  
  if (!preset) {
    const conditions = ["Clear", "Clouds", "Rain", "Snow", "Thunderstorm", "Mist"];
    const index = hash % conditions.length;
    mainCondition = conditions[index];
    
    // Snow can't happen easily if temp > 10
    if (mainCondition === "Snow" && finalTemp > 5) {
      mainCondition = "Clouds";
    }
    // Convert to cold if snow selected
    let targetTemp = finalTemp;
    if (mainCondition === "Snow") {
      targetTemp = Math.floor((hash % 10) - 8); // -8 to 1
    }

    if (mainCondition === "Clear") {
      description = "clear blue sky with wonderful sunshine";
      icon = "01d";
    } else if (mainCondition === "Clouds") {
      description = "scattered broken clouds casting soft shadows";
      icon = "03d";
    } else if (mainCondition === "Rain") {
      description = "steady therapeutic rain shower";
      icon = "09d";
    } else if (mainCondition === "Snow") {
      description = "beautiful fluffy white snow falling down";
      icon = "13d";
    } else if (mainCondition === "Thunderstorm") {
      description = "sporadic thunder and fierce lightning flashes";
      icon = "11d";
    } else if (mainCondition === "Mist") {
      description = "dreamy layer of early morning mist";
      icon = "50d";
    }
  } else {
    mainCondition = preset.condition;
    description = preset.description;
    icon = preset.icon;
  }

  const finalLat = lat ?? (preset ? 35.6 : 30 + (hash % 15));
  const finalLon = lon ?? (preset ? 139.6 : 10 + (hash % 30));
  const humidity = preset ? preset.humidity : Math.floor(30 + (hash % 60));
  const pressure = Math.floor(995 + (hash % 30));
  const visibility = mainCondition === "Mist" ? 1200 : (mainCondition === "Rain" ? 6000 : 10000);
  const windSpeed = preset ? preset.windSpeed : Number((1.2 + (hash % 12) + Math.random()).toFixed(1));
  const windDeg = preset ? preset.windDeg : (hash % 360);
  const windGust = Math.random() > 0.5 ? Number((windSpeed * 1.3).toFixed(1)) : undefined;
  
  // Ambient calculations
  const uvIndex = preset ? preset.uv : Math.min(11, Math.max(0, Math.floor(12 - Math.abs(finalLat) / 8)));
  const aqiVal = preset ? preset.aqi : Math.max(1, Math.min(5, Math.floor((hash % 5) + 1)));

  // Generate hourly lists
  const hourly: any[] = [];
  const hours = ["8:00 AM", "11:00 AM", "2:00 PM", "5:00 PM", "8:00 PM", "11:00 PM", "2:00 AM", "5:00 AM"];
  for (let i = 0; i < 8; i++) {
    // Diurnal temperature cycle: warmest in afternoon (approx item index 2-3), coldest in morning
    const deviation = Math.sin((i - 1) * Math.PI / 4) * 4;
    hourly.push({
      time: hours[i],
      temp: Number((finalTemp + deviation).toFixed(1)),
      condition: i % 3 === 0 ? mainCondition : (i % 2 === 0 ? "Clouds" : "Clear"),
      icon: i % 3 === 0 ? icon : (i % 2 === 0 ? "03d" : "01d")
    });
  }

  // Generate 5-day daily forecast
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayIndex = new Date().getDay();
  const forecast: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const dayName = weekdays[(currentDayIndex + i) % 7];
    const itemHash = (hash + i) * 31;
    const tomorrowCond = ["Clear", "Clouds", "Rain", "Snow", "Thunderstorm", "Mist"][itemHash % 6];
    let tIcon = "01d";
    if (tomorrowCond === "Clouds") tIcon = "02d";
    if (tomorrowCond === "Rain") tIcon = "09d";
    if (tomorrowCond === "Snow") tIcon = "13d";
    if (tomorrowCond === "Thunderstorm") tIcon = "11d";
    if (tomorrowCond === "Mist") tIcon = "50d";

    const tMin = finalTemp - 2 - (itemHash % 4);
    const tMax = finalTemp + 2 + (itemHash % 5);

    forecast.push({
      date: dayName,
      tempMin: Math.min(tMin, tMax - 1),
      tempMax: Math.max(tMin + 1, tMax),
      condition: tomorrowCond,
      icon: tIcon,
      humidity: Math.floor(40 + (itemHash % 50))
    });
  }

  const dtNow = Math.floor(Date.now() / 1000);

  return {
    city: normCity,
    country: finalCountry,
    lat: finalLat,
    lon: finalLon,
    temp: preset ? preset.temp : finalTemp,
    feelsLike: preset ? Number((preset.temp + 0.5).toFixed(1)) : Number((finalTemp + (humidity > 70 ? 1 : -0.5)).toFixed(1)),
    tempMin: preset ? preset.temp - 3 : finalTemp - 4,
    tempMax: preset ? preset.temp + 3 : finalTemp + 4,
    humidity,
    pressure,
    visibility,
    sunrise: dtNow - 25000,
    sunset: dtNow + 25000,
    condition: {
      id: preset ? (preset.condition === "Clear" ? 800 : 803) : (800 + (hash % 5)),
      main: mainCondition,
      description,
      icon
    },
    wind: {
      speed: windSpeed,
      deg: windDeg,
      gust: windGust
    },
    aqi: {
      aqi: aqiVal,
      pm25: aqiVal * 10 + (hash % 10),
      pm10: aqiVal * 15 + (hash % 15),
      no2: Number((aqiVal * 2.4).toFixed(1)),
      o3: Number((aqiVal * 35).toFixed(1))
    },
    uvIndex,
    hourly,
    forecast,
    isSimulated: true
  };
}

// Generate an intelligent, AI text helper fallback advice
const PRE_BAKED_ADVICE: Record<string, string> = {
  Clear: "A beautiful, bright sunny day! Perfect for walking outside, a quick run, or just feeling the soft sunshine. Don't forget your stylish sunglasses and stay hydrated!",
  Clouds: "The gray sky feels neutral and calm. Perfect weather for cozy focus at a coffee shop or a light jog. Perfect temperature for a layered knit sweatshirt.",
  Rain: "Therapeutic raindrops pattern the pavement today. Perfect for cozy reading, enjoying hot cocoa, and watching puddles from your window. Grab a quality windbreaker and umbrella!",
  Snow: "Winter landscape incoming! Beautiful, soft snow is drifting down. Wrap yourself in a heavy wool scarf, wear warm insulated boots, and step carefully.",
  Thunderstorm: "Fierce elements clash outside. Better to stay indoors with pleasant ambient lighting, avoiding metallic contacts, and listening to the rhythmic rumble of thunder.",
  Mist: "The mysterious misty layers roll across town today, softening horizons. Beautiful visual atmosphere, but keep headlights on and step slowly as relative humidity peaks."
};

function mapWmoToOpenWeather(wmoCode: number): { main: string; description: string; icon: string } {
  // WMO weather interpretation codes
  switch (wmoCode) {
    case 0:
      return { main: "Clear", description: "clear sky", icon: "01d" };
    case 1:
      return { main: "Clear", description: "mainly clear", icon: "01d" };
    case 2:
      return { main: "Clouds", description: "partly cloudy", icon: "02d" };
    case 3:
      return { main: "Clouds", description: "overcast sky", icon: "03d" };
    case 45:
    case 48:
      return { main: "Mist", description: "foggy mist", icon: "50d" };
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return { main: "Rain", description: "light drizzle", icon: "09d" };
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return { main: "Rain", description: "rain showers", icon: "10d" };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return { main: "Snow", description: "snowfall", icon: "13d" };
    case 95:
    case 96:
    case 99:
      return { main: "Thunderstorm", description: "thunderstorm", icon: "11d" };
    default:
      return { main: "Clouds", description: "clouds", icon: "03d" };
  }
}

// Unified Weather Endpoint with Optional AI Insights using Open-Meteo
app.get("/api/weather", async (req, res) => {
  const cityQuery = req.query.city as string;
  const latQuery = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
  const lonQuery = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

  if (!cityQuery && (latQuery === undefined || lonQuery === undefined)) {
    return res.status(400).json({ error: "Missing parameters. Please provide 'city' or 'lat' & 'lon'." });
  }

  // Format lookup details
  const searchCity = cityQuery ? cityQuery.trim() : `Lat:${latQuery!.toFixed(2)} Lon:${lonQuery!.toFixed(2)}`;
  let weatherData: any = null;

  try {
    let lat = latQuery;
    let lon = lonQuery;
    let finalCity = cityQuery ? cityQuery.trim() : "Custom Location";
    let countryCode = "LOC";

    // 1. Geocode search query using Open-Meteo Geocoding API if city provided
    if (cityQuery) {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQuery.trim())}&count=1&language=en&format=json`;
      console.log(`Open-Meteo Geocoding: looking up coordinates for "${cityQuery}"`);
      const geoRes = await axios.get(geoUrl);
      
      if (geoRes.data && geoRes.data.results && geoRes.data.results.length > 0) {
        const result = geoRes.data.results[0];
        lat = result.latitude;
        lon = result.longitude;
        finalCity = result.name;
        countryCode = result.country_code || result.country || "LOC";
      } else {
        return res.status(404).json({ error: `Could not discover city coordinates for "${cityQuery}". If this is a small town, try looking up the nearest major city instead.` });
      }
    }

    if (lat === undefined || lon === undefined) {
      throw new Error("Coordinates are missing even after geocoding attempt");
    }

    console.log(`Fetching Open-Meteo Forecast API for coordinates: ${lat}, ${lon}`);

    // 2. Fetch Open-Meteo Forecast and Air Quality in parallel
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,visibility,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&wind_speed_unit=ms&timezone=auto`;
    const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone`;

    const [forecastRes, aqRes] = await Promise.allSettled([
      axios.get(forecastUrl),
      axios.get(aqUrl)
    ]);

    if (forecastRes.status === "rejected") {
      throw new Error(`Open-Meteo Forecast failed: ${forecastRes.reason?.message}`);
    }

    const wData = forecastRes.value.data;

    // Convert sunrise / sunset ISO times to epoch unix timestamps
    let sunriseUnix = Math.floor(Date.now() / 1000) - 25000;
    let sunsetUnix = Math.floor(Date.now() / 1000) + 25000;
    if (wData.daily?.sunrise?.[0]) {
      sunriseUnix = Math.floor(Date.parse(wData.daily.sunrise[0]) / 1000);
    }
    if (wData.daily?.sunset?.[0]) {
      sunsetUnix = Math.floor(Date.parse(wData.daily.sunset[0]) / 1000);
    }

    // Map weather codes
    const currentWmo = wData.current.weather_code;
    const weatherCondition = mapWmoToOpenWeather(currentWmo);

    // Map hourly data (next 8 hours)
    const hourly: any[] = [];
    const nowMs = Date.now();
    const hourlyTimes = wData.hourly.time;
    const hourlyTemps = wData.hourly.temperature_2m;
    const hourlyCodes = wData.hourly.weather_code;

    for (let i = 0; i < hourlyTimes.length; i++) {
      const timeMs = Date.parse(hourlyTimes[i]);
      if (timeMs >= nowMs - 3600000) { // Keep hours starting from an hour ago
        const dateObj = new Date(timeMs);
        let hoursVal = dateObj.getHours();
        const ampm = hoursVal >= 12 ? "PM" : "AM";
        hoursVal = hoursVal % 12;
        hoursVal = hoursVal ? hoursVal : 12;

        const mapped = mapWmoToOpenWeather(hourlyCodes[i]);
        hourly.push({
          time: `${hoursVal}:00 ${ampm}`,
          temp: Math.round(hourlyTemps[i]),
          condition: mapped.main,
          icon: mapped.icon
        });

        if (hourly.length === 8) break;
      }
    }

    // Ensure we have 8 hours even if timezone offset was tricky
    if (hourly.length < 8) {
      for (let i = 0; i < Math.min(8, hourlyTimes.length); i++) {
        const dateObj = new Date(Date.parse(hourlyTimes[i]));
        let hoursVal = dateObj.getHours();
        const ampm = hoursVal >= 12 ? "PM" : "AM";
        hoursVal = hoursVal % 12;
        hoursVal = hoursVal ? hoursVal : 12;
        const mapped = mapWmoToOpenWeather(hourlyCodes[i]);
        hourly.push({
          time: `${hoursVal}:00 ${ampm}`,
          temp: Math.round(hourlyTemps[i]),
          condition: mapped.main,
          icon: mapped.icon
        });
      }
    }

    // Map daily forecast (5 days, index 1 to 5)
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const forecastList: any[] = [];
    for (let i = 1; i <= 5 && i < wData.daily.time.length; i++) {
      const dateStr = wData.daily.time[i];
      const dayName = weekdays[new Date(dateStr).getDay()];
      const dayWmo = wData.daily.weather_code[i];
      const mapped = mapWmoToOpenWeather(dayWmo);

      forecastList.push({
        date: dayName,
        tempMin: Math.round(wData.daily.temperature_2m_min[i]),
        tempMax: Math.round(wData.daily.temperature_2m_max[i]),
        condition: mapped.main,
        icon: mapped.icon,
        humidity: Math.round(wData.current.relative_humidity_2m) // Estimate with current humidity
      });
    }

    // Process Air Quality indices
    let aqiObj = undefined;
    if (aqRes.status === "fulfilled" && aqRes.value.data?.hourly?.european_aqi) {
      const aqData = aqRes.value.data.hourly;
      // Take first index representing close to current hourly index
      aqiObj = {
        aqi: Math.max(1, Math.min(5, Math.round(aqData.european_aqi[0] || 2))),
        pm25: Math.round(aqData.pm2_5[0] || 12),
        pm10: Math.round(aqData.pm10[0] || 20),
        no2: Number((aqData.nitrogen_dioxide[0] || 4.2).toFixed(1)),
        o3: Number((aqData.ozone[0] || 38.5).toFixed(1))
      };
    } else {
      // Clean fallback if Air Quality api had an issue
      aqiObj = {
        aqi: 2,
        pm25: 14,
        pm10: 22,
        no2: 5.1,
        o3: 42.0
      };
    }

    const uvValue = Math.round(wData.daily.uv_index_max?.[0] || 4);

    weatherData = {
      city: finalCity,
      country: countryCode,
      lat,
      lon,
      temp: Math.round(wData.current.temperature_2m),
      feelsLike: Math.round(wData.current.apparent_temperature),
      tempMin: Math.round(wData.daily.temperature_2m_min[0]),
      tempMax: Math.round(wData.daily.temperature_2m_max[0]),
      humidity: wData.current.relative_humidity_2m,
      pressure: wData.current.pressure_msl,
      visibility: wData.current.visibility || 10000,
      sunrise: sunriseUnix,
      sunset: sunsetUnix,
      condition: {
        id: currentWmo,
        main: weatherCondition.main,
        description: weatherCondition.description,
        icon: weatherCondition.icon
      },
      wind: {
        speed: wData.current.wind_speed_10m,
        deg: wData.current.wind_direction_10m,
        gust: wData.current.wind_gusts_10m || Number((wData.current.wind_speed_10m * 1.25).toFixed(1))
      },
      aqi: aqiObj,
      uvIndex: uvValue,
      hourly,
      forecast: forecastList,
      isSimulated: false
    };

  } catch (e: any) {
    console.log("Could not fetch real-time Open-Meteo weather data or geocoding failed. Serving fallback profile instead.", e?.message);
    weatherData = generateSimulation(searchCity, latQuery, lonQuery);
  }

  // Generate Gemini AI narrative commentary
  if (ai) {
    try {
      const condText = weatherData.condition.description;
      const forecastText = weatherData.forecast.map((f: any) => `${f.date}: ${f.condition} (${f.tempMin} to ${f.tempMax}°C)`).join(", ");
      
      const prompt = `Formulate an engaging, extremely cozy, personal weather recommendation.
City: ${weatherData.city}, ${weatherData.country}
Current temperature: ${weatherData.temp}°C
Condition description: ${condText}
Humidity: ${weatherData.humidity}%
Wind Speed: ${weatherData.wind.speed} m/s
Upcoming forecast: ${forecastText}

Instructions: Focus on clothing suggestions (e.g. trench coat, insulated sweater, light windbreaker, sunglasses) combined with a fun mental or lifestyle activity (e.g. cozy research, scenic walk, puddle-jumping, early hydration). Write as a poetic, friendly companion in 2 short, lovely sentences under 180 characters total. Do not use generic lists. Grab attention immediately.`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      if (aiResponse.text) {
        weatherData.aiInsight = aiResponse.text.trim().replace(/^"|"$/g, "");
      }
    } catch (aiErr: any) {
      console.error("Gemini AI API narrative generation error:", aiErr);
      const mainC = weatherData.condition.main;
      weatherData.aiInsight = PRE_BAKED_ADVICE[mainC] || PRE_BAKED_ADVICE.Clouds;
    }
  } else {
    const mainC = weatherData.condition.main;
    weatherData.aiInsight = PRE_BAKED_ADVICE[mainC] || PRE_BAKED_ADVICE.Clouds;
  }

  return res.json(weatherData);
});

// Create Vite server middleware in development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Express and Vite Dev Server on Port 3000 Mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Running in static production build distribution mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Weather dashboard server is fully initialized and operational on http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Startup Failure: Vite Middleware Crash in Express Server", err);
});
