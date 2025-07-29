import React, { useState, useEffect } from 'react';
import { Leaf, Bot, Sun, Cloud, CloudRain, Zap, Snowflake, CloudFog, CloudDrizzle, CloudRainWind, CloudLightning } from 'lucide-react';

// Helper function to get weather icon and description from WMO weather codes
const getWeatherInfo = (code) => {
  const weatherMap = {
    0: { description: 'Clear sky', icon: <Sun size={48} className="text-yellow-400" /> },
    1: { description: 'Mainly clear', icon: <Sun size={48} className="text-yellow-400" /> },
    2: { description: 'Partly cloudy', icon: <Cloud size={48} className="text-gray-400" /> },
    3: { description: 'Overcast', icon: <Cloud size={48} className="text-gray-500" /> },
    45: { description: 'Fog', icon: <CloudFog size={48} className="text-gray-400" /> },
    48: { description: 'Depositing rime fog', icon: <CloudFog size={48} className="text-gray-400" /> },
    51: { description: 'Light drizzle', icon: <CloudDrizzle size={48} className="text-blue-300" /> },
    53: { description: 'Moderate drizzle', icon: <CloudDrizzle size={48} className="text-blue-400" /> },
    55: { description: 'Dense drizzle', icon: <CloudDrizzle size={48} className="text-blue-500" /> },
    61: { description: 'Slight rain', icon: <CloudRain size={48} className="text-blue-400" /> },
    63: { description: 'Moderate rain', icon: <CloudRain size={48} className="text-blue-500" /> },
    65: { description: 'Heavy rain', icon: <CloudRain size={48} className="text-blue-600" /> },
    80: { description: 'Slight rain showers', icon: <CloudLightning size={48} className="text-yellow-500" /> },
    81: { description: 'Moderate rain showers', icon: <CloudLightning size={48} className="text-yellow-500" /> },
    82: { description: 'Violent rain showers', icon: <CloudLightning size={48} className="text-yellow-500" /> },
    95: { description: 'Thunderstorm', icon: <Zap size={48} className="text-yellow-600" /> },
  };
  return weatherMap[code] || { description: 'Unknown', icon: <Sun size={48} /> };
};


export default function Dashboard({ setActiveView }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch weather data for Hyderabad, India (Latitude: 17.38, Longitude: 78.48)
    fetch('https://api.open-meteo.com/v1/forecast?latitude=17.38&longitude=78.48&current_weather=true')
      .then(response => response.json())
      .then(data => {
        setWeather(data.current_weather);
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch weather:", error);
        setLoading(false);
      });
  }, []); // Empty dependency array means this effect runs once on mount

  const WeatherCard = () => {
    if (loading) {
      return <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md flex items-center justify-center h-40"><p>Loading Weather...</p></div>;
    }
    if (!weather) {
      return <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md flex items-center justify-center h-40"><p>Could not load weather data.</p></div>;
    }
    
    const { description, icon } = getWeatherInfo(weather.weathercode);

    return (
      <div className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Hyderabad Weather</p>
            <p className="text-5xl font-bold text-gray-800 dark:text-white mt-2">{weather.temperature}°C</p>
            <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          </div>
          <div className="mt-2">
            {icon}
          </div>
        </div>
      </div>
    );
  };

  const ActionButton = ({ icon, title, description, onClick }) => (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow-lg text-left w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="flex items-center">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-lg font-bold text-gray-800 dark:text-white">{title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Weather and Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weather Card takes 1 column on large screens */}
        <div className="lg:col-span-1">
          <WeatherCard />
        </div>

        {/* Quick Actions take 2 columns on large screens */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActionButton 
            icon={<Leaf size={24} className="text-purple-600 dark:text-purple-400" />}
            title="Crop Doctor"
            description="Diagnose a plant disease"
            onClick={() => setActiveView('Crop Doctor')}
          />
          <ActionButton 
            icon={<Bot size={24} className="text-purple-600 dark:text-purple-400" />}
            title="Agri-Bot"
            description="Ask our AI for advice"
            onClick={() => setActiveView('Agri-Bot')}
          />
        </div>
      </div>

      {/* Placeholder for future charts or info */}
      <div className="mt-8 p-6 bg-white dark:bg-gray-900/50 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold">Market Overview</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Charts and market data will be displayed here in a future update.</p>
        <div className="mt-4 h-48 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Chart Placeholder</p>
        </div>
      </div>
    </div>
  );
}
