import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, LayoutDashboard, Leaf, Store, LandPlot, Bot, Users, Menu, X, 
  Cloud, CloudRain, Zap, Snowflake, CloudFog, CloudDrizzle, CloudRainWind, CloudLightning, 
  UploadCloud, FileImage, AlertTriangle, CheckCircle, Loader2
} from 'lucide-react';

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

// Dashboard Component
const Dashboard = ({ setActiveView }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const WeatherCard = () => {
    if (loading) return <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md flex items-center justify-center h-40"><p>Loading Weather...</p></div>;
    if (!weather) return <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md flex items-center justify-center h-40"><p>Could not load weather data.</p></div>;
    const { description, icon } = getWeatherInfo(weather.weathercode);
    return (
      <div className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Hyderabad Weather</p>
            <p className="text-5xl font-bold text-gray-800 dark:text-white mt-2">{weather.temperature}°C</p>
            <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          </div>
          <div className="mt-2">{icon}</div>
        </div>
      </div>
    );
  };

  const ActionButton = ({ icon, title, description, onClick }) => (
    <button onClick={onClick} className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow-lg text-left w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">{icon}</div>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1"><WeatherCard /></div>
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActionButton icon={<Leaf size={24} className="text-purple-600 dark:text-purple-400" />} title="Crop Doctor" description="Diagnose a plant disease" onClick={() => setActiveView('Crop Doctor')} />
          <ActionButton icon={<Bot size={24} className="text-purple-600 dark:text-purple-400" />} title="Agri-Bot" description="Ask our AI for advice" onClick={() => setActiveView('Agri-Bot')} />
        </div>
      </div>
      <div className="mt-8 p-6 bg-white dark:bg-gray-900/50 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold">Market Overview</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Charts and market data will be displayed here in a future update.</p>
        <div className="mt-4 h-48 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"><p className="text-gray-400">Chart Placeholder</p></div>
      </div>
    </div>
  );
};

// +++ NEW COMPONENT +++
const CropDoctor = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null); // Will hold diagnosis result
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setResult(null); // Reset result when new image is chosen
    }
  };

  const handleDiagnose = () => {
    if (!image) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // This is where we will call our Python API and Gemini
      setResult({
        disease: "Tomato Late Blight",
        confidence: "95.8%",
        recommendation: "This disease is caused by the oomycete Phytophthora infestans. For organic treatment, apply copper-based fungicides. Ensure good air circulation by pruning lower leaves. Avoid overhead watering to keep foliage dry."
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2">AI Crop Doctor</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Upload an image of a plant leaf to get an instant diagnosis and treatment recommendation.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Upload Section */}
        <div className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">1. Upload Leaf Image</h2>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
            <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Selected leaf" className="max-h-64 mx-auto rounded-lg" />
                <button onClick={() => { setPreview(null); setImage(null); setResult(null); }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud size={48} className="text-gray-400 dark:text-gray-500 mb-2" />
                <span className="font-semibold text-purple-600 dark:text-purple-400">Click to upload</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">or drag and drop (PNG, JPG)</p>
              </label>
            )}
          </div>
          <button 
            onClick={handleDiagnose} 
            disabled={!image || isLoading}
            className="w-full mt-6 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {isLoading ? <><Loader2 size={20} className="animate-spin mr-2" /> Diagnosing...</> : 'Diagnose Plant'}
          </button>
        </div>

        {/* Diagnosis Result Section */}
        <div className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">2. Diagnosis Result</h2>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 size={48} className="animate-spin text-purple-500" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">Analyzing image...</p>
            </div>
          ) : result ? (
            <div>
              <div className="flex items-center bg-green-100 dark:bg-green-900/50 p-4 rounded-lg">
                <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                <div className="ml-3">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">{result.disease}</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">Confidence: {result.confidence}</p>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-bold text-gray-800 dark:text-white">Recommended Organic Treatment:</h4>
                <p className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{result.recommendation}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileImage size={48} className="text-gray-400 dark:text-gray-500" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">Your diagnosis will appear here after you upload an image and click diagnose.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// Main App Component
export default function App() {
  const [activeView, setActiveView] = useState('Dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const MainContent = () => {
    switch (activeView) {
      case 'Dashboard':
        return <Dashboard setActiveView={setActiveView} />;
      case 'Crop Doctor':
        return <CropDoctor />; // <-- UPDATED
      case 'Marketplace':
        return <div className="p-8"><h1 className="text-3xl font-bold">Marketplace</h1><p className="mt-2">View and list products.</p></div>;
      case 'Schemes Hub':
        return <div className="p-8"><h1 className="text-3xl font-bold">Schemes Hub</h1><p className="mt-2">Information about government schemes.</p></div>;
      case 'Agri-Bot':
        return <div className="p-8"><h1 className="text-3xl font-bold">Agri-Bot</h1><p className="mt-2">Ask me anything about farming!</p></div>;
      case 'Community':
        return <div className="p-8"><h1 className="text-3xl font-bold">Community Forum</h1><p className="mt-2">Connect with other farmers.</p></div>;
      default:
        return <Dashboard setActiveView={setActiveView} />;
    }
  };
  
  const Sidebar = () => (
    <aside className={`fixed top-0 left-0 h-full bg-gray-800 dark:bg-gray-900 text-white transition-transform duration-300 ease-in-out z-40 ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'} md:relative md:translate-x-0 md:w-64 flex-shrink-0`}>
      <div className="p-6 text-2xl font-bold border-b border-gray-700">Agri-Dash</div>
      <nav className="mt-6">
        <NavItem icon={<LayoutDashboard size={20} />} name="Dashboard" />
        <NavItem icon={<Leaf size={20} />} name="Crop Doctor" />
        <NavItem icon={<Store size={20} />} name="Marketplace" />
        <NavItem icon={<LandPlot size={20} />} name="Schemes Hub" />
        <NavItem icon={<Bot size={20} />} name="Agri-Bot" />
        <NavItem icon={<Users size={20} />} name="Community" />
      </nav>
    </aside>
  );

  const NavItem = ({ icon, name }) => (
    <a href="#" onClick={(e) => { e.preventDefault(); setActiveView(name); if(window.innerWidth < 768) setIsSidebarOpen(false); }} className={`flex items-center px-6 py-3 text-gray-300 hover:bg-purple-700 hover:text-white transition-colors duration-200 ${activeView === name ? 'bg-purple-800 text-white' : ''}`}>
      {icon}
      <span className="ml-4">{name}</span>
    </a>
  );

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-y-auto">
          <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 dark:text-gray-400 focus:outline-none md:hidden">
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-xl font-semibold md:hidden">{activeView}</h2>
            <div className="flex items-center ml-auto">
              <div className="hidden md:block w-64 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <button onClick={toggleTheme} className="ml-4 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-200 dark:bg-gray-700">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </header>
          <main className="flex-1">
            <MainContent />
          </main>
        </div>
      </div>
    </div>
  );
}
