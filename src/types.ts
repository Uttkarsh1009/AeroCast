export interface WeatherCondition {
  id: number;
  main: string; // Clear, Rain, Snow, Thunderstorm, Clouds, Mist, Fog, etc.
  description: string;
  icon: string;
}

export interface WindData {
  speed: number;
  deg: number;
  gust?: number;
}

export interface AirQuality {
  aqi: number; // 1 (Good) to 5 (Very Poor)
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
}

export interface HourlyForecast {
  time: string; // e.g., "12:00 PM"
  temp: number;
  condition: string;
  icon: string;
}

export interface DailyForecast {
  date: string; // e.g., "Monday"
  tempMin: number;
  tempMax: number;
  condition: string;
  icon: string;
  humidity: number;
}

export interface WeatherData {
  city: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  visibility: number; // in meters or km
  sunrise: number; // unix timestamp
  sunset: number; // unix timestamp
  condition: WeatherCondition;
  wind: WindData;
  aqi?: AirQuality;
  uvIndex?: number;
  hourly: HourlyForecast[];
  forecast: DailyForecast[];
  aiInsight?: string;
  isSimulated: boolean;
}

export interface SearchHistoryItem {
  id: string;
  city: string;
  temp: number;
  condition: string;
  timestamp: number;
}
