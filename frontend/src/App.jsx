import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, Moon, LayoutDashboard, Leaf, Store, LandPlot, Bot, Users, Menu, X, 
  Cloud, CloudRain, Zap, Snowflake, CloudFog, CloudDrizzle, CloudRainWind, CloudLightning, 
  UploadCloud, FileImage, AlertTriangle, CheckCircle, Loader2, Languages, SendHorizontal, LogOut, PlusCircle, ShoppingCart, Trash2, Heart, Image as ImageIcon, ArrowRight,
  ShieldCheck, BarChart as BarChartIcon, MessageCircle, ChevronDown, Minus, Plus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// --- 1. FIREBASE SETUP ---
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";


// Your web app's Firebase configuration
// SAFE: Keys are loaded from the secret .env.local file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase (and prevent duplicate app error)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


// --- 2. TRANSLATION SETUP ---
const translations = {
  en: {
    dashboard: "Dashboard", cropDoctor: "Crop Doctor", myProducts: "My Products", marketplace: "Marketplace", schemesHub: "Schemes Hub", agriBot: "Agri-Bot", community: "Community",
    hyderabadWeather: "Hyderabad Weather", diagnosePlant: "Diagnose a plant disease", askAI: "Ask our AI for advice", marketOverview: "Market Overview",
    chartsPlaceholder: "Charts and market data will be displayed here.", aiCropDoctorTitle: "AI Crop Doctor", aiCropDoctorSubtitle: "Upload an image of a plant leaf to get an instant diagnosis.",
    uploadTitle: "1. Upload Leaf Image", uploadButton: "Click to upload", diagnoseButton: "Diagnose Plant", diagnosing: "Diagnosing...",
    resultTitle: "2. Diagnosis Result", resultPlaceholder: "Your diagnosis will appear here.", errorTitle: "An Error Occurred",
    errorNetwork: "Could not connect to the diagnosis server. Please ensure it's running.", errorProcessing: "The server encountered an error processing the image.",
    organicTreatment: "Recommended Organic Treatment:",
    agriBotTitle: "Agri-Bot Assistant", agriBotSubtitle: "Your personal AI farming expert. Ask me anything!",
    agriBotPlaceholder: "Type your question here... (e.g., 'How to control pests for tomatoes?')",
    initialBotMessage: "Hello! I am your Agri-Bot. How can I help you with your farming questions today?",
    botError: "Sorry, I couldn't get an answer. Please try again.",
    myProductsTitle: "Manage Your Products", myProductsSubtitle: "Add, edit, or remove your product listings for the marketplace.",
    addNewProduct: "Add New Product", productName: "Product Name", price: "Price (per kg/unit)", description: "Description",
    productImage: "Product Image", saveProduct: "Save Product", cancel: "Cancel", noProducts: "You haven't listed any products yet.",
    quantity: "Quantity (in kg)",
    consumerDashboardTitle: "Marketplace", consumerDashboardSubtitle: "Browse fresh produce directly from local farmers.",
    buyNow: "Buy Now", noProductsAvailable: "No products are available in the marketplace right now. Please check back later.",
    deleteProduct: "Delete Product", confirmDeletePrompt: "Are you sure you want to delete this product? This action cannot be undone.", confirm: "Confirm",
    communityTitle: "Community Hub", communitySubtitle: "Connect with others, share updates, and ask questions.",
    createPostPlaceholder: "What's on your mind?", post: "Post", noPosts: "No posts yet. Be the first to share something!",
    addPhoto: "Add Photo",
    landingTitle: "Empowering Farmers, Sharing Knowledge",
    landingSubtitle: "The all-in-one platform for modern agriculture. Sell your produce, diagnose crop diseases with AI, and stay informed.",
    getStarted: "Get Started",
    login: "Login",
    features: "Features",
    ourFeatures: "Our Core Features",
    feature1Title: "AI Crop Doctor",
    feature1Desc: "Instantly diagnose plant diseases by uploading a photo and get AI-powered organic treatment advice.",
    feature2Title: "Direct Marketplace",
    feature2Desc: "Farmers can list their produce directly, and consumers can buy fresh, local goods without middlemen.",
    feature3Title: "Community Hub",
    feature3Desc: "A social space for farmers and consumers to connect, share knowledge, and discuss agricultural topics.",
    schemesTitle: "Government Schemes for Farmers",
    schemesSubtitle: "Stay updated with the latest beneficial schemes from the Government of India.",
    shoppingCart: "Shopping Cart",
    checkout: "Checkout",
    emptyCart: "Your cart is empty.",
    adminDashboard: "Admin Dashboard",
    manageUsers: "Manage Users",
    manageProducts: "Manage Products",
    managePosts: "Manage Posts",
  },
  hi: {
    dashboard: "डैशबोर्ड", cropDoctor: "फ़सल डॉक्टर", myProducts: "मेरे उत्पाद", marketplace: "बाज़ार", schemesHub: "योजनाएँ हब", agriBot: "एग्री-बॉट", community: "समुदाय",
    hyderabadWeather: "हैदराबाद मौसम", diagnosePlant: "एक पौधे की बीमारी का निदान करें", askAI: "सलाह के लिए हमारे AI से पूछें", marketOverview: "बाजार का अवलोकन",
    chartsPlaceholder: "चार्ट और बाजार डेटा यहां प्रदर्शित किया जाएगा।", aiCropDoctorTitle: "एआई फ़सल डॉक्टर", aiCropDoctorSubtitle: "तुरंत निदान पाने के लिए पौधे की पत्ती की एक छवि अपलोड करें।",
    uploadTitle: "१. पत्ती की छवि अपलोड करें", uploadButton: "अपलोड करने के लिए क्लिक करें", diagnoseButton: "पौधे का निदान करें", diagnosing: "निदान हो रहा है...",
    resultTitle: "२. निदान का परिणाम", resultPlaceholder: "आपका निदान यहां दिखाई देगा।", errorTitle: "एक त्रुटि हुई",
    errorNetwork: "निदान सर्वर से कनेक्ट नहीं हो सका। कृपया सुनिश्चित करें कि यह चल रहा है।", errorProcessing: "सर्वर को छवि संसाधित करने में एक त्रुटि का सामना करना पड़ा।",
    organicTreatment: "अनुशंसित जैविक उपचार:",
    agriBotTitle: "एग्री-बॉट सहायक", agriBotSubtitle: "आपका व्यक्तिगत AI खेती विशेषज्ञ। मुझसे कुछ भी पूछें!",
    agriBotPlaceholder: "अपना प्रश्न यहाँ लिखें... (जैसे, 'टमाटर के लिए कीटों को कैसे नियंत्रित करें?')",
    initialBotMessage: "नमस्ते! मैं आपका एग्री-बॉट हूँ। आज मैं आपके खेती संबंधी सवालों में कैसे मदद कर सकता हूँ?",
    botError: "क्षमा करें, मुझे उत्तर नहीं मिल सका। कृपया पुनः प्रयास करें।",
    myProductsTitle: "अपने उत्पादों का प्रबंधन करें", myProductsSubtitle: "बाज़ार के लिए अपनी उत्पाद सूची जोड़ें, संपादित करें या हटाएं।",
    addNewProduct: "नया उत्पाद जोड़ें", productName: "उत्पाद का नाम", price: "मूल्य (प्रति किलो/यूनिट)", description: "विवरण",
    productImage: "उत्पाद की छवि", saveProduct: "उत्पाद सहेजें", cancel: "रद्द करें", noProducts: "आपने अभी तक कोई उत्पाद सूचीबद्ध नहीं किया है।",
    quantity: "मात्रा (किलो में)",
    consumerDashboardTitle: "बाज़ार", consumerDashboardSubtitle: "स्थानीय किसानों से सीधे ताजा उपज ब्राउज़ करें।",
    buyNow: "अभी खरीदें", noProductsAvailable: "अभी बाज़ार में कोई उत्पाद उपलब्ध नहीं है। कृपया बाद में वापस देखें।",
    deleteProduct: "उत्पाद हटाएं", confirmDeletePrompt: "क्या आप वाकई इस उत्पाद को हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।", confirm: "पुष्टि करें",
    communityTitle: "सामुदायिक केंद्र", communitySubtitle: "दूसरों से जुड़ें, अपडेट साझा करें और प्रश्न पूछें।",
    createPostPlaceholder: "आपके मन में क्या है?", post: "पोस्ट करें", noPosts: "अभी तक कोई पोस्ट नहीं है। कुछ साझा करने वाले पहले व्यक्ति बनें!",
    addPhoto: "फोटो जोड़ें",
    landingTitle: "किसानों को सशक्त बनाना, समुदायों को जोड़ना",
    landingSubtitle: "आधुनिक कृषि के लिए ऑल-इन-वन प्लेटफॉर्म। अपनी उपज बेचें, एआई से फसल रोगों का निदान करें, और सूचित रहें।",
    getStarted: "शुरू हो जाओ",
    login: "लॉग इन करें",
    features: "विशेषताएं",
    ourFeatures: "हमारी मुख्य विशेषताएं",
    feature1Title: "एआई फसल डॉक्टर",
    feature1Desc: "एक तस्वीर अपलोड करके तुरंत पौधों की बीमारियों का निदान करें और एआई-संचालित जैविक उपचार सलाह प्राप्त करें।",
    feature2Title: "प्रत्यक्ष बाज़ार",
    feature2Desc: "किसान सीधे अपनी उपज सूचीबद्ध कर सकते हैं, और उपभोक्ता बिचौलियों के बिना ताजा, स्थानीय सामान खरीद सकते हैं।",
    feature3Title: "सामुदायिक केंद्र",
    feature3Desc: "किसानों और उपभोक्ताओं के लिए जुड़ने, ज्ञान साझा करने और कृषि विषयों पर चर्चा करने के लिए एक सामाजिक स्थान।",
    schemesTitle: "किसानों के लिए सरकारी योजनाएं",
    schemesSubtitle: "भारत सरकार की नवीनतम लाभकारी योजनाओं से अपडेट रहें।",
    shoppingCart: "शॉपिंग कार्ट",
    checkout: "चेक आउट",
    emptyCart: "आपकी कार्ट खाली है।",
    adminDashboard: "एडमिन डैशबोर्ड",
    manageUsers: "उपयोगकर्ताओं का प्रबंधन करें",
    manageProducts: "उत्पादों का प्रबंधन करें",
    managePosts: "पोस्ट का प्रबंधन करें",
  },
  te: {
    dashboard: "డాష్‌బోర్డ్", cropDoctor: "పంట వైద్యుడు", myProducts: "నా ఉత్పత్తులు", marketplace: "మార్కెట్‌ప్లేస్", schemesHub: "పథకాల హబ్", agriBot: "అగ్రి-బాట్", community: "సంఘం",
    hyderabadWeather: "హైదరాబాద్ వాతావరణం", diagnosePlant: "మొక్కల వ్యాధిని నిర్ధారించండి", askAI: "సలహా కోసం మా AIని అడగండి", marketOverview: "మార్కెట్ అవలోకనం",
    chartsPlaceholder: "చార్ట్‌లు మరియు మార్కెట్ డేటా ఇక్కడ ప్రదర్శించబడుతుంది.", aiCropDoctorTitle: "AI పంట వైద్యుడు", aiCropDoctorSubtitle: "తక్షణ నిర్ధారణ పొందడానికి మొక్క ఆకు చిత్రాన్ని అప్‌లోడ్ చేయండి.",
    uploadTitle: "1. ఆకు చిత్రాన్ని అప్‌లోడ్ చేయండి", uploadButton: "అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి", diagnoseButton: "మొక్కను నిర్ధారించండి", diagnosing: "నిర్ధారణ జరుగుతోంది...",
    resultTitle: "2. నిర్ధారణ ఫలితం", resultPlaceholder: "మీ నిర్ధారణ ఇక్కడ కనిపిస్తుంది.", errorTitle: "ఒక లోపం సంభవించింది",
    errorNetwork: "నిర్ధారణ సర్వర్‌కు కనెక్ట్ కాలేకపోయింది. దయచేసి ఇది నడుస్తోందని నిర్ధారించుకోండి.", errorProcessing: "సర్వర్ చిత్రాన్ని ప్రాసెస్ చేయడంలో లోపం ఎదుర్కొంది.",
    organicTreatment: "సిఫార్సు చేయబడిన సేంద్రీయ చికిత్స:",
    agriBotTitle: "అగ్రి-బాట్ అసిస్టెంట్", agriBotSubtitle: "మీ వ్యక్తిగత AI వ్యవసాయ నిపుణుడు. నన్ను ఏదైనా అడగండి!",
    agriBotPlaceholder: "మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి... (ఉదా., 'టమోటాల కోసం తెగుళ్లను ఎలా నియంత్రించాలి?')",
    initialBotMessage: "నమస్కారం! నేను మీ అగ్రి-బాట్‌ని. ఈ రోజు మీ వ్యవసాయ ప్రశ్నలతో నేను మీకు ఎలా సహాయపడగలను?",
    botError: "క్షమించండి, నాకు సమాధానం రాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.",
    myProductsTitle: "మీ ఉత్పత్తులను నిర్వహించండి", myProductsSubtitle: "మార్కెట్‌ప్లేస్ కోసం మీ ఉత్పత్తి జాబితాలను జోడించండి, సవరించండి లేదా తీసివేయండి.",
    addNewProduct: "కొత్త ఉత్పత్తిని జోడించండి", productName: "ఉత్పత్తి పేరు", price: "ధర (కిలో/యూనిట్‌కు)", description: "వివరణ",
    productImage: "ఉత్పత్తి చిత్రం", saveProduct: "ఉత్పత్తిని సేవ్ చేయండి", cancel: "రద్దు చేయండి", noProducts: "మీరు ఇంకా ఏ ఉత్పత్తులను జాబితా చేయలేదు.",
    quantity: "పరిమాణం (కిలోలలో)",
    consumerDashboardTitle: "మార్కెట్‌ప్లేస్", consumerDashboardSubtitle: "స్థానిక రైతుల నుండి నేరుగా తాజా ఉత్పత్తులను బ్రౌజ్ చేయండి.",
    buyNow: "ఇప్పుడే కొనండి", noProductsAvailable: "ప్రస్తుతం మార్కెట్‌లో ఉత్పత్తులు అందుబాటులో లేవు. దయచేసి తర్వాత మళ్లీ తనిఖీ చేయండి.",
    deleteProduct: "ఉత్పత్తిని తొలగించండి", confirmDeletePrompt: "మీరు ఖచ్చితంగా ఈ ఉత్పత్తిని తొలగించాలనుకుంటున్నారా? ఈ చర్యను రద్దు చేయడం సాధ్యం కాదు.", confirm: "నిర్ధారించండి",
    communityTitle: "కమ్యూనిటీ హబ్", communitySubtitle: "ఇతరులతో కనెక్ట్ అవ్వండి, నవీకరణలను పంచుకోండి మరియు ప్రశ్నలు అడగండి.",
    createPostPlaceholder: "మీ మనసులో ఏముంది?", post: "పోస్ట్ చేయండి", noPosts: "ఇంకా పోస్ట్‌లు లేవు. ఏదైనా పంచుకున్న మొదటి వ్యక్తి అవ్వండి!",
    addPhoto: "ఫోటోను జోడించండి",
    landingTitle: "రైతులను శక్తివంతం చేయడం, సంఘాలను అనుసంధానించడం",
    landingSubtitle: "ఆధునిక వ్యవసాయం కోసం ఆల్-ఇన్-వన్ ప్లాట్‌ఫాం. మీ ఉత్పత్తులను అమ్మండి, AI తో పంట వ్యాధులను నిర్ధారించండి మరియు సమాచారం తెలుసుకోండి.",
    getStarted: "ప్రారంభించండి",
    login: "లాగిన్",
    features: "ఫీచర్లు",
    ourFeatures: "మా ప్రధాన ఫీచర్లు",
    feature1Title: "AI పంట వైద్యుడు",
    feature1Desc: "ఒక ఫోటోను అప్‌లోడ్ చేయడం ద్వారా తక్షణమే మొక్కల వ్యాధులను నిర్ధారించండి మరియు AI- శక్తితో కూడిన సేంద్రీయ చికిత్స సలహాలను పొందండి.",
    feature2Title: "ప్రత్యక్ష మార్కెట్‌ప్లేస్",
    feature2Desc: "రైతులు తమ ఉత్పత్తులను నేరుగా జాబితా చేయవచ్చు మరియు వినియోగదారులు మధ్యవర్తులు లేకుండా తాజా, స్థానిక వస్తువులను కొనుగోలు చేయవచ్చు.",
    feature3Title: "కమ్యూనిటీ హబ్",
    feature3Desc: "రైతులు మరియు వినియోగదారులు కనెక్ట్ అవ్వడానికి, జ్ఞానాన్ని పంచుకోవడానికి మరియు వ్యవసాయ అంశాలపై చర్చించడానికి ఒక సామాజిక స్థలం.",
    schemesTitle: "రైతుల కోసం ప్రభుత్వ పథకాలు",
    schemesSubtitle: "భారత ప్రభుత్వం నుండి తాజా ప్రయోజనకరమైన పథకాలతో నవీకరించబడండి.",
    shoppingCart: "షాపింగ్ కార్ట్",
    checkout: "చెక్అవుట్",
    emptyCart: "మీ కార్ట్ ఖాళీగా ఉంది.",
    adminDashboard: "అడ్మిన్ డాష్‌బోర్డ్",
    manageUsers: "వినియోగదారులను నిర్వహించండి",
    manageProducts: "ఉత్పత్తులను నిర్వహించండి",
    managePosts: "పోస్ట్‌లను నిర్వహించండి",
  }
};

// --- 3. HELPER & FEATURE COMPONENTS ---

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

const Dashboard = ({ setActiveView, t }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=17.38&longitude=78.48&current_weather=true')
      .then(response => response.json()).then(data => {
        setWeather(data.current_weather);
        setLoading(false);
      }).catch(error => {
        console.error("Failed to fetch weather:", error);
        setLoading(false);
      });
  }, []);

  const WeatherCard = () => {
    if (loading) return <div className="bg-white dark:bg-gray-900/80 p-6 rounded-lg shadow-md flex items-center justify-center h-40"><p>Loading Weather...</p></div>;
    if (!weather) return <div className="bg-white dark:bg-gray-900/80 p-6 rounded-lg shadow-md flex items-center justify-center h-40"><p>Could not load weather data.</p></div>;
    const { description, icon } = getWeatherInfo(weather.weathercode);
    return (
      <div className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">{t('hyderabadWeather')}</p>
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
      <h1 className="text-3xl font-bold mb-6">{t('dashboard')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1"><WeatherCard /></div>
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActionButton icon={<Leaf size={24} className="text-purple-600 dark:text-purple-400" />} title={t('cropDoctor')} description={t('diagnosePlant')} onClick={() => setActiveView('Crop Doctor')} />
          <ActionButton icon={<Bot size={24} className="text-purple-600 dark:text-purple-400" />} title={t('agriBot')} description={t('askAI')} onClick={() => setActiveView('Agri-Bot')} />
        </div>
      </div>
      <div className="mt-8 p-6 bg-white dark:bg-gray-900/50 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold">{t('marketOverview')}</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t('chartsPlaceholder')}</p>
        <div className="mt-4 h-48 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"><p className="text-gray-400">Chart Placeholder</p></div>
      </div>
    </div>
  );
};

const CropDoctor = ({ t, language }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  };

  const handleDiagnose = async () => {
    if (!image) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', image);
    formData.append('language', language);

    try {
      const response = await fetch('http://localhost:5000/diagnose', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
      
      const data = await response.json();
      
      setResult({
        disease: data.disease.replace(/___/g, ' ').replace(/_/g, ' '),
        confidence: `${(data.confidence * 100).toFixed(2)}%`,
        recommendation: data.recommendation
      });

    } catch (err) {
      console.error("Diagnosis failed:", err);
      if (err instanceof TypeError) setError(t('errorNetwork'));
      else setError(t('errorProcessing'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2">{t('aiCropDoctorTitle')}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{t('aiCropDoctorSubtitle')}</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">{t('uploadTitle')}</h2>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
            <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
            {preview ? (
              <div className="relative"><img src={preview} alt="Selected leaf" className="max-h-64 mx-auto rounded-lg" /><button onClick={() => { setPreview(null); setImage(null); setResult(null); setError(null); }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"><X size={16} /></button></div>
            ) : (
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center"><UploadCloud size={48} className="text-gray-400 dark:text-gray-500 mb-2" /><span className="font-semibold text-purple-600 dark:text-purple-400">{t('uploadButton')}</span><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">or drag and drop (PNG, JPG)</p></label>
            )}
          </div>
          <button onClick={handleDiagnose} disabled={!image || isLoading} className="w-full mt-6 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
            {isLoading ? <><Loader2 size={20} className="animate-spin mr-2" />{t('diagnosing')}</> : t('diagnoseButton')}
          </button>
        </div>
        <div className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">{t('resultTitle')}</h2>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full"><Loader2 size={48} className="animate-spin text-purple-500" /><p className="mt-4 text-gray-500 dark:text-gray-400">Analyzing image...</p></div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">
                <AlertTriangle size={48} className="text-red-500" />
                <h3 className="mt-4 font-bold text-red-600 dark:text-red-400">{t('errorTitle')}</h3>
                <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : result ? (
            <div>
              <div className="flex items-center bg-green-100 dark:bg-green-900/50 p-4 rounded-lg"><CheckCircle size={24} className="text-green-600 dark:text-green-400" /><div className="ml-3"><h3 className="text-lg font-bold text-gray-800 dark:text-white">{result.disease}</h3><p className="text-sm text-green-700 dark:text-green-300">Confidence: {result.confidence}</p></div></div>
              <div className="mt-6"><h4 className="font-bold text-gray-800 dark:text-white">{t('organicTreatment')}</h4><p className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{result.recommendation}</p></div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center"><FileImage size={48} className="text-gray-400 dark:text-gray-500" /><p className="mt-4 text-gray-500 dark:text-gray-400">{t('resultPlaceholder')}</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

const AgriBot = ({ t, language }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([{ text: t('initialBotMessage'), sender: 'bot' }]);
  }, [t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/ask-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input, language: language }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const botResponse = { text: data.answer, sender: 'bot' };
      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error("Failed to get response from bot:", error);
      const errorResponse = { text: t('botError'), sender: 'bot' };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <h1 className="text-3xl font-bold mb-2">{t('agriBotTitle')}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{t('agriBotSubtitle')}</p>
      
      <div className="flex-1 bg-white dark:bg-gray-900/50 p-4 rounded-2xl shadow-lg overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-2xl bg-gray-200 dark:bg-gray-700">
              <Loader2 size={20} className="animate-spin text-gray-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="mt-6">
        <div className="relative">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('agriBotPlaceholder')} className="w-full py-3 pl-4 pr-12 bg-white dark:bg-gray-900 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500" disabled={isLoading} />
          <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors">
            <SendHorizontal size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

const MyProducts = ({ t, userData }) => {
    const [products, setProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productDesc, setProductDesc] = useState('');
    const [productQuantity, setProductQuantity] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        if (!userData?.uid) return;
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("farmerId", "==", userData.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const productsData = [];
            querySnapshot.forEach((doc) => {
                productsData.push({ id: doc.id, ...doc.data() });
            });
            productsData.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
            setProducts(productsData);
            setIsLoadingProducts(false);
        });
        return () => unsubscribe();
    }, [userData]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setProductName('');
        setProductPrice('');
        setProductDesc('');
        setProductQuantity('');
        setProductImage(null);
        setImagePreview('');
        setShowForm(false);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        if (!productImage) {
            setError("Please upload a product image.");
            return;
        }
        setIsSaving(true);
        setError('');

        try {
            const imageRef = ref(storage, `products/${Date.now()}_${productImage.name}`);
            const snapshot = await uploadBytes(imageRef, productImage);
            const imageUrl = await getDownloadURL(snapshot.ref);

            await addDoc(collection(db, "products"), {
                name: productName,
                price: parseFloat(productPrice),
                description: productDesc,
                quantity: parseFloat(productQuantity),
                imageUrl: imageUrl,
                farmerId: userData.uid,
                farmerEmail: userData.email,
                createdAt: new Date(),
            });

            resetForm();

        } catch (err) {
            console.error("Error saving product:", err);
            setError("Failed to save product. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const openDeleteModal = (product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setProductToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;

        try {
            const imageRef = ref(storage, productToDelete.imageUrl);
            await deleteObject(imageRef);
            await deleteDoc(doc(db, "products", productToDelete.id));
        } catch (err) {
            console.error("Error deleting product:", err);
            setError("Failed to delete product. Please try again.");
        } finally {
            closeDeleteModal();
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{t('myProductsTitle')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('myProductsSubtitle')}</p>
                </div>
                {!showForm && (
                    <button onClick={() => setShowForm(true)} className="flex items-center px-4 py-2 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700">
                        <PlusCircle size={20} className="mr-2" /> {t('addNewProduct')}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow-lg mb-8">
                    <h2 className="text-xl font-bold mb-4">{t('addNewProduct')}</h2>
                    <form onSubmit={handleSaveProduct} className="space-y-4">
                        <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder={t('productName')} required className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" step="0.01" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder={t('price')} required className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            <input type="number" step="0.1" value={productQuantity} onChange={(e) => setProductQuantity(e.target.value)} placeholder={t('quantity')} required className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <textarea value={productDesc} onChange={(e) => setProductDesc(e.target.value)} placeholder={t('description')} required className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" rows="3"></textarea>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('productImage')}</label>
                            <input type="file" onChange={handleImageChange} accept="image/*" required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"/>
                            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 h-32 w-32 object-cover rounded-md" />}
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div className="flex justify-end space-x-4">
                            <button type="button" onClick={resetForm} className="px-4 py-2 font-bold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">{t('cancel')}</button>
                            <button type="submit" disabled={isSaving} className="px-4 py-2 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-400 flex items-center">
                                {isSaving && <Loader2 size={20} className="animate-spin mr-2" />}
                                {t('saveProduct')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingProducts ? (
                    <p>Loading products...</p>
                ) : products.length > 0 ? (
                    products.map(product => (
                        <div key={product.id} className="bg-white dark:bg-gray-900/50 rounded-2xl shadow-lg overflow-hidden flex flex-col">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="text-lg font-bold">{product.name}</h3>
                                <div className="flex justify-between items-center">
                                    <p className="text-purple-500 font-semibold text-xl">₹{product.price}</p>
                                    <p className="text-sm text-gray-500">{product.quantity} kg available</p>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 flex-1">{product.description}</p>
                                <button onClick={() => openDeleteModal(product)} className="w-full mt-4 flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-md hover:bg-red-700">
                                    <Trash2 size={16} className="mr-2" /> {t('deleteProduct')}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    !showForm && <div className="col-span-full text-center py-12 bg-white dark:bg-gray-900/50 rounded-2xl">
                        <p className="text-gray-500">{t('noProducts')}</p>
                    </div>
                )}
            </div>
             {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h2 className="text-lg font-bold">{t('deleteProduct')}</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('confirmDeletePrompt')}</p>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button onClick={closeDeleteModal} className="px-4 py-2 font-bold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">{t('cancel')}</button>
                            <button onClick={handleConfirmDelete} className="px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700">{t('confirm')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Community = ({ t, userData }) => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newPost, setNewPost] = useState('');
    const [postImage, setPostImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        const postsRef = collection(db, "posts");
        const q = query(postsRef, orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsData = [];
            querySnapshot.forEach((doc) => {
                postsData.push({ id: doc.id, ...doc.data() });
            });
            setPosts(postsData);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPostImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPost.trim() && !postImage) return;
        setIsPosting(true);

        let imageUrl = '';
        try {
            if (postImage) {
                const imageRef = ref(storage, `posts/${Date.now()}_${postImage.name}`);
                const snapshot = await uploadBytes(imageRef, postImage);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            await addDoc(collection(db, "posts"), {
                text: newPost,
                imageUrl: imageUrl,
                authorId: userData.uid,
                authorEmail: userData.email,
                authorRole: userData.role,
                likes: [],
                createdAt: new Date(),
            });
            setNewPost('');
            setPostImage(null);
            setImagePreview('');
        } catch (error) {
            console.error("Error creating post:", error);
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (postId, currentLikes) => {
        const postRef = doc(db, "posts", postId);
        const userId = auth.currentUser.uid;
        if (currentLikes.includes(userId)) {
            await updateDoc(postRef, {
                likes: arrayRemove(userId)
            });
        } else {
            await updateDoc(postRef, {
                likes: arrayUnion(userId)
            });
        }
    };
    
    const handleDeletePost = async (post) => {
        if(post.authorId !== auth.currentUser.uid) return; // Security check
        if(!window.confirm("Are you sure you want to delete this post?")) return;

        try {
            // If post has an image, delete it from storage first
            if(post.imageUrl) {
                const imageRef = ref(storage, post.imageUrl);
                await deleteObject(imageRef);
            }
            // Delete the post document from Firestore
            await deleteDoc(doc(db, "posts", post.id));
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold">{t('communityTitle')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">{t('communitySubtitle')}</p>

            <form onSubmit={handlePostSubmit} className="bg-white dark:bg-gray-900/50 p-4 rounded-2xl shadow-lg mb-8">
                <textarea 
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder={t('createPostPlaceholder')}
                    className="w-full p-2 border-0 bg-transparent focus:ring-0 resize-none"
                    rows="3"
                />
                {imagePreview && (
                    <div className="relative my-2">
                        <img src={imagePreview} alt="Post preview" className="max-h-64 rounded-lg" />
                        <button type="button" onClick={() => {setPostImage(null); setImagePreview('')}} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"><X size={16} /></button>
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <label htmlFor="post-image-upload" className="cursor-pointer text-purple-600 hover:text-purple-700 flex items-center">
                        <ImageIcon size={20} className="mr-2" /> {t('addPhoto')}
                    </label>
                    <input type="file" id="post-image-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
                    <button type="submit" disabled={isPosting || (!newPost.trim() && !postImage)} className="px-4 py-2 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-400 flex items-center">
                        {isPosting && <Loader2 size={20} className="animate-spin mr-2" />}
                        {t('post')}
                    </button>
                </div>
            </form>

            <div className="space-y-4">
                {isLoading ? (
                    <p>Loading posts...</p>
                ) : posts.length > 0 ? (
                    posts.map(post => {
                        const userHasLiked = post.likes && post.likes.includes(auth.currentUser.uid);
                        return (
                            <div key={post.id} className="bg-white dark:bg-gray-900/50 rounded-2xl shadow-lg p-4 relative">
                                <div className="flex items-center mb-2">
                                    <p className="font-bold">{post.authorEmail}</p>
                                    <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${post.authorRole === 'Farmer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {post.authorRole}
                                    </span>
                                </div>
                                {post.text && <p className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap my-2">{post.text}</p>}
                                {post.imageUrl && <img src={post.imageUrl} alt="Post content" className="mt-2 rounded-lg max-h-96 w-auto" />}
                                <div className="flex items-center justify-end mt-2">
                                    <button onClick={() => handleLike(post.id, post.likes || [])} className={`flex items-center transition-colors ${userHasLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
                                        <Heart size={16} className={`mr-1 ${userHasLiked ? 'fill-current' : ''}`} /> {post.likes?.length || 0}
                                    </button>
                                </div>
                                {post.authorId === auth.currentUser.uid && (
                                    <button onClick={() => handleDeletePost(post)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">{t('noPosts')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const SchemesHub = ({ t }) => {
    const [openScheme, setOpenScheme] = useState(null);

    const schemes = [
        { id: 1, title: "PM-KISAN Scheme", description: "Provides income support of ₹6,000 per year to all landholding farmer families.", details: "The Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a central sector scheme with 100% funding from the Government of India. The fund is directly transferred to the bank accounts of the beneficiaries ." },
        { id: 2, title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)", description: "Provides comprehensive insurance coverage against crop failure, helping to stabilise the income of farmers.", details: "PMFBY covers all Food & Oilseeds crops and Annual Commercial/Horticultural Crops for which past yield data is available. The scheme is compulsory for loanee farmers availing Crop Loan /KCC account for notified crops and voluntary for other farmers." },
        { id: 3, title: "Kisan Credit Card (KCC) Scheme", description: "Aims at providing adequate and timely credit support from the banking system to farmers for their cultivation and other needs.", details: "Farmers can use the KCC for purchase of agricultural inputs like seeds, fertilizers, pesticides etc. and draw cash for their production needs." },
        { id: 4, title: "Soil Health Card Scheme", description: "Assists farmers in improving soil health and productivity by providing information on the nutrient status of their soil.", details: "The scheme provides a report on the status of 12 nutrients. It recommends the dosage of fertilizers and also the necessary soil amendments that a farmer should apply to his fields." },
        { id: 5, title: "Paramparagat Krishi Vikas Yojana (PKVY)", description: "Promotes organic farming through the adoption of organic village by cluster approach and PGS certification.", details: "The scheme encourages farmers to form groups or clusters and take up organic farming methods. Financial assistance is provided to farmers for input procurement, value addition and marketing." },
        { id: 6, title: "National Agriculture Market (e-NAM)", description: "A pan-India electronic trading portal which networks the existing APMC mandis to create a unified national market for agricultural commodities.", details: "e-NAM provides a single window service for all APMC related information and services. This includes commodity arrivals & prices, buy & sell trade offers, provision to respond to trade offers, among other services." }
    ];

    const toggleScheme = (id) => {
        setOpenScheme(openScheme === id ? null : id);
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold">{t('schemesTitle')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">{t('schemesSubtitle')}</p>
            <div className="space-y-4">
                {schemes.map(scheme => (
                    <div key={scheme.id} className="bg-white dark:bg-gray-900/50 rounded-lg shadow-md">
                        <button onClick={() => toggleScheme(scheme.id)} className="w-full flex justify-between items-center p-4 text-left">
                            <span className="font-bold">{scheme.title}</span>
                            <ChevronDown className={`transition-transform ${openScheme === scheme.id ? 'rotate-180' : ''}`} />
                        </button>
                        {openScheme === scheme.id && (
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="font-semibold mb-2">{scheme.description}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{scheme.details}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminHome = ({t}) => {
    const [stats, setStats] = useState({ users: 0, products: 0, posts: 0 });
    
    useEffect(() => {
        const unsubUsers = onSnapshot(collection(db, "users"), (snap) => setStats(s => ({...s, users: snap.size})));
        const unsubProducts = onSnapshot(collection(db, "products"), (snap) => setStats(s => ({...s, products: snap.size})));
        const unsubPosts = onSnapshot(collection(db, "posts"), (snap) => setStats(s => ({...s, posts: snap.size})));
        return () => { unsubUsers(); unsubProducts(); unsubPosts(); };
    }, []);

    const chartData = [
        { name: 'Users', count: stats.users },
        { name: 'Products', count: stats.products },
        { name: 'Posts', count: stats.posts },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Admin Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md"><h2 className="text-xl font-bold">Total Users</h2><p className="text-3xl font-bold text-purple-500">{stats.users}</p></div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md"><h2 className="text-xl font-bold">Total Products</h2><p className="text-3xl font-bold text-purple-500">{stats.products}</p></div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md"><h2 className="text-xl font-bold">Total Posts</h2><p className="text-3xl font-bold text-purple-500">{stats.posts}</p></div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md h-96">
                <h2 className="text-xl font-bold mb-4">Platform Activity</h2>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "users"), (snap) => {
            setUsers(snap.docs.map(doc => ({id: doc.id, ...doc.data()})));
        });
        return () => unsub();
    }, []);

    const handleDelete = async (userId) => {
        if(window.confirm("Are you sure you want to delete this user? This cannot be undone.")) {
            // Note: This only deletes the Firestore record, not the Auth user.
            // Deleting the Auth user requires backend functions for security.
            await deleteDoc(doc(db, "users", userId));
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4 text-left">Email</th>
                            <th className="p-4 text-left">Role</th>
                            <th className="p-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b dark:border-gray-700">
                                <td className="p-4">{user.email}</td>
                                <td className="p-4">{user.role}</td>
                                <td className="p-4">
                                    <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "products"), (snap) => {
            setProducts(snap.docs.map(doc => ({id: doc.id, ...doc.data()})));
        });
        return () => unsub();
    }, []);

    const handleDelete = async (product) => {
        if(window.confirm(`Delete ${product.name}?`)) {
            await deleteObject(ref(storage, product.imageUrl));
            await deleteDoc(doc(db, "products", product.id));
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Products</h1>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4 text-left">Product</th>
                            <th className="p-4 text-left">Farmer</th>
                            <th className="p-4 text-left">Price</th>
                            <th className="p-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="border-b dark:border-gray-700">
                                <td className="p-4">{product.name}</td>
                                <td className="p-4">{product.farmerEmail}</td>
                                <td className="p-4">₹{product.price}</td>
                                <td className="p-4">
                                    <button onClick={() => handleDelete(product)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "posts"), (snap) => {
            setPosts(snap.docs.map(doc => ({id: doc.id, ...doc.data()})));
        });
        return () => unsub();
    }, []);

    const handleDelete = async (post) => {
        if(window.confirm(`Delete post by ${post.authorEmail}?`)) {
            if(post.imageUrl) {
                await deleteObject(ref(storage, post.imageUrl));
            }
            await deleteDoc(doc(db, "posts", post.id));
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Posts</h1>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-4 text-left">Author</th>
                            <th className="p-4 text-left">Content</th>
                            <th className="p-4 text-left">Likes</th>
                            <th className="p-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map(post => (
                            <tr key={post.id} className="border-b dark:border-gray-700">
                                <td className="p-4">{post.authorEmail}</td>
                                <td className="p-4 max-w-xs truncate">{post.text}</td>
                                <td className="p-4">{post.likes?.length || 0}</td>
                                <td className="p-4">
                                    <button onClick={() => handleDelete(post)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- 4. PAGE & DASHBOARD COMPONENTS ---

const LandingPage = ({ setPage, t }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <header className="p-4 flex justify-between items-center container mx-auto">
                <h1 className="text-2xl font-bold text-purple-600">Agri-Dash</h1>
                <div className="space-x-2">
                    <button onClick={() => setPage('login')} className="px-4 py-2 font-bold text-purple-600 rounded-md hover:bg-purple-100 dark:hover:bg-gray-800">
                        {t('login')}
                    </button>
                    <button onClick={() => setPage('register')} className="px-4 py-2 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700">
                        {t('getStarted')}
                    </button>
                </div>
            </header>
            <main>
                <section className="container mx-auto px-4 py-24 text-center">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white">
                        {t('landingTitle')}
                    </h2>
                    <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {t('landingSubtitle')}
                    </p>
                    <button onClick={() => setPage('register')} className="mt-8 px-8 py-4 text-lg font-bold text-white bg-purple-600 rounded-full hover:bg-purple-700 inline-flex items-center">
                        {t('getStarted')} <ArrowRight className="ml-2" />
                    </button>
                </section>
                <section id="features" className="py-20 bg-white dark:bg-gray-800">
                    <div className="container mx-auto px-4">
                        <h3 className="text-3xl font-bold text-center mb-12">{t('ourFeatures')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-8 border rounded-lg dark:border-gray-700">
                                <Leaf size={40} className="text-purple-500 mb-4" />
                                <h4 className="text-xl font-bold mb-2">{t('feature1Title')}</h4>
                                <p className="text-gray-600 dark:text-gray-400">{t('feature1Desc')}</p>
                            </div>
                            <div className="p-8 border rounded-lg dark:border-gray-700">
                                <Store size={40} className="text-purple-500 mb-4" />
                                <h4 className="text-xl font-bold mb-2">{t('feature2Title')}</h4>
                                <p className="text-gray-600 dark:text-gray-400">{t('feature2Desc')}</p>
                            </div>
                            <div className="p-8 border rounded-lg dark:border-gray-700">
                                <MessageCircle size={40} className="text-purple-500 mb-4" />
                                <h4 className="text-xl font-bold mb-2">{t('feature3Title')}</h4>
                                <p className="text-gray-600 dark:text-gray-400">{t('feature3Desc')}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                <p>&copy; {new Date().getFullYear()} Agri-Dash. All rights reserved.</p>
            </footer>
        </div>
    );
};

const LoginPage = ({ setPage, t }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Failed to log in. Please check your email and password.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-center text-purple-600">Login to Agri-Dash</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700">Login</button>
        </form>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Don't have an account? <button onClick={() => setPage('register')} className="font-medium text-purple-600 hover:underline">Register here</button>
        </p>
      </div>
    </div>
  );
};

const RegisterPage = ({ setPage, t }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Farmer');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: role,
      });
    } catch (err) {
      setError('Failed to register. The email might already be in use.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-center text-purple-600">Create an Account</h1>
        <form onSubmit={handleRegister} className="space-y-6">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min. 6 characters)" required className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">I am a...</label>
            <div className="flex items-center space-x-4">
              <label><input type="radio" value="Farmer" checked={role === 'Farmer'} onChange={(e) => setRole(e.target.value)} className="mr-2" /> Farmer</label>
              <label><input type="radio" value="Consumer" checked={role === 'Consumer'} onChange={(e) => setRole(e.target.value)} className="mr-2" /> Consumer</label>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700">Register</button>
        </form>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Already have an account? <button onClick={() => setPage('login')} className="font-medium text-purple-600 hover:underline">Login here</button>
        </p>
      </div>
    </div>
  );
};

const FarmerDashboard = ({ t, language, userData, isDarkMode, toggleTheme, setLanguage }) => {
    const [activeView, setActiveView] = useState('Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
    const handleLogout = () => signOut(auth);

    const MainContent = () => {
        switch (activeView) {
            case 'Dashboard': return <Dashboard setActiveView={setActiveView} t={t} />;
            case 'Crop Doctor': return <CropDoctor t={t} language={language} />;
            case 'My Products': return <MyProducts t={t} userData={userData} />;
            case 'Agri-Bot': return <AgriBot t={t} language={language} />;
            case 'Community': return <Community t={t} userData={userData} />;
            case 'Schemes Hub': return <SchemesHub t={t} />;
            default: return <div className="p-8"><h1 className="text-3xl font-bold">{t(activeView.toLowerCase().replace(/ /g, ''))}</h1><p>Coming soon...</p></div>;
        }
    };
  
    const NavItem = ({ icon, name, viewName }) => (
        <a href="#" onClick={(e) => { e.preventDefault(); setActiveView(viewName); if(window.innerWidth < 768) setIsSidebarOpen(false); }} 
           className={`flex items-center px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-700 hover:text-purple-600 dark:hover:text-white transition-colors duration-200 ${activeView === viewName ? 'bg-purple-50 dark:bg-purple-800 text-purple-600 dark:text-white border-r-4 border-purple-500' : ''}`}>
            {icon} <span className="ml-4 font-medium">{name}</span>
        </a>
    );

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-lg dark:shadow-none transition-transform duration-300 ease-in-out z-40 ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'} md:relative md:translate-x-0 md:w-64 flex-shrink-0 flex flex-col`}>
                <div className="p-6 text-2xl font-bold border-b border-gray-200 dark:border-gray-700 text-purple-600">Agri-Dash</div>
                <nav className="mt-6 flex-1">
                    <NavItem icon={<LayoutDashboard size={20} />} name={t('dashboard')} viewName="Dashboard" />
                    <NavItem icon={<Leaf size={20} />} name={t('cropDoctor')} viewName="Crop Doctor" />
                    <NavItem icon={<Store size={20} />} name={t('myProducts')} viewName="My Products" />
                    <NavItem icon={<LandPlot size={20} />} name={t('schemesHub')} viewName="Schemes Hub" />
                    <NavItem icon={<Bot size={20} />} name={t('agriBot')} viewName="Agri-Bot" />
                    <NavItem icon={<Users size={20} />} name={t('community')} viewName="Community" />
                </nav>
                <div className="p-4">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700">
                        <LogOut size={20} className="mr-2" /> Logout
                    </button>
                </div>
            </aside>
            <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 dark:text-gray-400 focus:outline-none md:hidden"><Menu size={24} /></button>
                    <div className="flex items-center ml-auto space-x-4">
                        <div className="relative">
                            <Languages className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                            <select onChange={(e) => setLanguage(e.target.value)} value={language} className="bg-gray-200 dark:bg-gray-700 rounded-lg py-2 pl-10 pr-4 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                                <option value="en">English</option>
                                <option value="hi">हिन्दी</option>
                                <option value="te">తెలుగు</option>
                            </select>
                        </div>
                        <button onClick={toggleTheme} className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 bg-gray-200 dark:bg-gray-700">
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </header>
                <main className="flex-1 h-full overflow-y-auto">
                    <MainContent />
                </main>
            </div>
        </div>
    );
};

const ConsumerDashboard = ({ userData, t, isDarkMode, toggleTheme, setLanguage, language }) => {
    const [activeView, setActiveView] = useState('Marketplace');
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const handleLogout = () => signOut(auth);

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                const newQuantity = existingItem.cartQuantity + 1;
                if (newQuantity > product.quantity) {
                    alert(`Cannot add more than the available ${product.quantity} kg.`);
                    return prevCart;
                }
                return prevCart.map(item => item.id === product.id ? { ...item, cartQuantity: newQuantity } : item);
            }
            return [...prevCart, { ...product, cartQuantity: 1 }];
        });
    };

    const updateCartQuantity = (productId, newQuantity) => {
        setCart(prevCart => {
            if (newQuantity <= 0) {
                return prevCart.filter(item => item.id !== productId);
            }
            const product = prevCart.find(item => item.id === productId);
            if (newQuantity > product.quantity) {
                alert(`Cannot add more than the available ${product.quantity} kg.`);
                return prevCart;
            }
            return prevCart.map(item => item.id === productId ? { ...item, cartQuantity: newQuantity } : item);
        });
    };
    
    const handleCheckout = () => {
        alert("Thank you for your purchase!");
        setCart([]);
        setIsCartOpen(false);
    };
    
    const MainContent = () => {
        switch(activeView) {
            case 'Marketplace': return <Marketplace t={t} onAddToCart={addToCart} cart={cart} />;
            case 'Community': return <Community t={t} userData={userData} />;
            default: return <Marketplace t={t} onAddToCart={addToCart} cart={cart} />;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <header className="w-full p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-purple-600">Agri-Dash</h1>
                <nav className="hidden md:flex items-center space-x-6">
                    <button onClick={() => setActiveView('Marketplace')} className={`font-medium ${activeView === 'Marketplace' ? 'text-purple-600' : 'text-gray-500 hover:text-purple-600'}`}>{t('marketplace')}</button>
                    <button onClick={() => setActiveView('Community')} className={`font-medium ${activeView === 'Community' ? 'text-purple-600' : 'text-gray-500 hover:text-purple-600'}`}>{t('community')}</button>
                </nav>
                <div className="flex items-center space-x-4">
                    <button onClick={() => setIsCartOpen(true)} className="relative text-gray-600 dark:text-gray-300 hover:text-purple-600">
                        <ShoppingCart />
                        {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cart.reduce((total, item) => total + item.cartQuantity, 0)}</span>}
                    </button>
                    <span className="text-sm hidden sm:inline">Welcome, {userData?.email}</span>
                    <button onClick={handleLogout} className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-md hover:bg-red-700">
                        Logout
                    </button>
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto">
                <MainContent />
            </main>

            {isCartOpen && <CartModal t={t} cart={cart} onClose={() => setIsCartOpen(false)} onUpdateQuantity={updateCartQuantity} onCheckout={handleCheckout} />}
        </div>
    );
};

const AdminDashboard = ({ t, userData }) => {
    const [activeView, setActiveView] = useState('Dashboard');
    const handleLogout = () => signOut(auth);

    const MainContent = () => {
        switch(activeView) {
            case 'Dashboard': return <AdminHome t={t} />;
            case 'Manage Users': return <UserManagement />;
            case 'Manage Products': return <ProductManagement />;
            case 'Manage Posts': return <PostManagement />;
            default: return <AdminHome t={t} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <aside className="w-64 bg-white dark:bg-gray-900 shadow-md flex flex-col">
                <div className="p-6 text-2xl font-bold border-b border-gray-200 dark:border-gray-700 text-purple-600">{t('adminDashboard')}</div>
                <nav className="mt-6 flex-1">
                    <button onClick={() => setActiveView('Dashboard')} className={`w-full flex items-center px-6 py-3 text-left ${activeView === 'Dashboard' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}><LayoutDashboard className="mr-3" />{t('dashboard')}</button>
                    <button onClick={() => setActiveView('Manage Users')} className={`w-full flex items-center px-6 py-3 text-left ${activeView === 'Manage Users' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}><Users className="mr-3" />{t('manageUsers')}</button>
                    <button onClick={() => setActiveView('Manage Products')} className={`w-full flex items-center px-6 py-3 text-left ${activeView === 'Manage Products' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}><Store className="mr-3" />{t('manageProducts')}</button>
                    <button onClick={() => setActiveView('Manage Posts')} className={`w-full flex items-center px-6 py-3 text-left ${activeView === 'Manage Posts' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}><MessageCircle className="mr-3" />{t('managePosts')}</button>
                </nav>
                <div className="p-4"><button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700"><LogOut size={20} className="mr-2" /> Logout</button></div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto"><MainContent /></main>
        </div>
    );
};

const Marketplace = ({ t, onAddToCart, cart }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const productsRef = collection(db, "products");
        const q = query(productsRef, orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const productsData = [];
            querySnapshot.forEach((doc) => {
                productsData.push({ id: doc.id, ...doc.data() });
            });
            setProducts(productsData);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold">{t('consumerDashboardTitle')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">{t('consumerDashboardSubtitle')}</p>
            {isLoading ? (
                <div className="flex justify-center items-center h-64"><Loader2 size={48} className="animate-spin text-purple-500" /></div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map(product => {
                        const itemInCart = cart.find(item => item.id === product.id);
                        const remainingQuantity = product.quantity - (itemInCart?.cartQuantity || 0);
                        return (
                            <div key={product.id} className="bg-white dark:bg-gray-900/50 rounded-2xl shadow-lg overflow-hidden flex flex-col">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="text-lg font-bold">{product.name}</h3>
                                    <div className="flex justify-between items-center">
                                      <p className="text-purple-500 font-semibold text-xl">₹{product.price}</p>
                                      <p className="text-sm text-gray-500">{remainingQuantity} kg available</p>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 flex-1">{product.description}</p>
                                    <p className="text-xs text-gray-400 mt-2">Sold by: {product.farmerEmail}</p>
                                    <button onClick={() => onAddToCart(product)} disabled={remainingQuantity <= 0} className="w-full mt-4 flex items-center justify-center px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400">
                                        <ShoppingCart size={16} className="mr-2" /> {t('buyNow')}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-900/50 rounded-2xl">
                    <p className="text-gray-500">{t('noProductsAvailable')}</p>
                </div>
            )}
        </div>
    );
};

const CartModal = ({ t, cart, onClose, onUpdateQuantity, onCheckout }) => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-lg font-bold mb-4">{t('shoppingCart')}</h2>
                {cart.length > 0 ? (
                    <>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div>
                                        <p>{item.name}</p>
                                        <p className="text-sm text-gray-500">₹{item.price} x {item.cartQuantity}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => onUpdateQuantity(item.id, item.cartQuantity - 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-700"><Minus size={12} /></button>
                                        <span>{item.cartQuantity}</span>
                                        <button onClick={() => onUpdateQuantity(item.id, item.cartQuantity + 1)} disabled={item.cartQuantity >= item.quantity} className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-50"><Plus size={12} /></button>
                                    </div>
                                    <span>₹{(item.price * item.cartQuantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t mt-4 pt-4 flex justify-between font-bold">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                        <button onClick={onCheckout} className="w-full mt-4 py-2 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700">{t('checkout')}</button>
                    </>
                ) : (
                    <p>{t('emptyCart')}</p>
                )}
                 <button onClick={onClose} className="w-full mt-2 py-2 font-bold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">{t('cancel')}</button>
            </div>
        </div>
    )
};


// --- 5. MAIN APP COMPONENT (ROUTER) ---
export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState('landing');

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState('en');
  const t = (key) => translations[language]?.[key] || key;
  
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
        setUser(currentUser);
      } else {
        setUser(null);
        setUserData(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 size={48} className="animate-spin text-purple-500" /></div>;
  }

  if (!user) {
    switch(page) {
        case 'login':
            return <LoginPage setPage={setPage} t={t} />;
        case 'register':
            return <RegisterPage setPage={setPage} t={t} />;
        default:
            return <LandingPage setPage={setPage} t={t} />;
    }
  }

  if (userData?.role === 'Admin') {
      return <AdminDashboard t={t} userData={userData} />;
  } else if (userData?.role === 'Farmer') {
    return <FarmerDashboard t={t} language={language} userData={userData} isDarkMode={isDarkMode} toggleTheme={toggleTheme} setLanguage={setLanguage} />;
  } else if (userData?.role === 'Consumer') {
    return <ConsumerDashboard userData={userData} t={t} isDarkMode={isDarkMode} toggleTheme={toggleTheme} setLanguage={setLanguage} language={language} />;
  } else {
    return (
        <div className="p-8">
            <h1 className="text-xl">Waiting for user data... If this persists, please log out and back in.</h1>
            <button onClick={() => signOut(auth)} className="mt-4 px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700">Logout</button>
        </div>
    );
  }
}
