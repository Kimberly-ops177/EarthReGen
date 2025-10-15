import React, { useState, useEffect } from 'react';
import { SignInPage } from './pages/SignInPage';
import { supabase } from './supabaseClient';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Leaf, Home, BarChart3, FlaskConical, Map, Wind, TrendingUp, DollarSign, Users, Info, Menu, X, Upload, MapPin, Droplets, Sun, AlertTriangle, CheckCircle, Activity, Cloud, Sprout, FileText, TrendingDown } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; 
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


export default function EarthReGen() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [soilAnalysis, setSoilAnalysis] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [countyInsights, setCountyInsights] = useState(null);
  const [mapLayer, setMapLayer] = useState('satellite');
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  
  
  // Land Assessment State
  const [location, setLocation] = useState('');
  const [landSize, setLandSize] = useState('');
  const [soilType, setSoilType] = useState('');
  const [degradationLevel, setDegradationLevel] = useState('');
  const [waterAccess, setWaterAccess] = useState('');
  const [assessmentResults, setAssessmentResults] = useState(null);
  
  // Satellite data state
  const [satelliteData, setSatelliteData] = useState(null);
  const [loadingSatellite, setLoadingSatellite] = useState(false);

  // Financial states
  const [financialRecords, setFinancialRecords] = useState([]);
  const [financialType, setFinancialType] = useState('expense');
  const [financialAmount, setFinancialAmount] = useState('');
  const [financialCategory, setFinancialCategory] = useState('');
  const [financialDescription, setFinancialDescription] = useState('');


  // Team states
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamEmail, setTeamEmail] = useState('');

   // Authentication States
  const [currentUser, setCurrentUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');


   // ========== CHECK FOR LOGGED-IN USER ==========
  useEffect(() => {
    const savedUser = localStorage.getItem('earthregen_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  
  const navigation = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'dashboard', name: 'Monitor', icon: BarChart3 },
    { id: 'soil-analyzer', name: 'AI Analyzer', icon: FlaskConical },
    { id: 'assessment', name: 'Assessment', icon: CheckCircle },
    { id: 'map', name: 'Map', icon: Map },
    { id: 'carbon', name: 'Carbon', icon: Leaf },
    { id: 'weather', name: 'Weather', icon: Wind },
    { id: 'kenya', name: 'Kenya', icon: TrendingUp },
    { id: 'financial', name: 'Financial', icon: DollarSign },
    { id: 'team', name: 'Team', icon: Users },
  ];

  // Monitoring data
  const ndviData = [
    { month: 'Apr', value: 0.65, threshold: 0.5 },
    { month: 'May', value: 0.68, threshold: 0.5 },
    { month: 'Jun', value: 0.7, threshold: 0.5 },
    { month: 'Jul', value: 0.72, threshold: 0.5 },
    { month: 'Aug', value: 0.75, threshold: 0.5 },
    { month: 'Sep', value: 0.78, threshold: 0.5 },
    { month: 'Oct', value: 0.8, threshold: 0.5 },
  ];

  const regionData = [
    { name: 'Nairobi', degradation: 42, vegetation: 68 },
    { name: 'Kiambu', degradation: 38, vegetation: 72 },
    { name: 'Machakos', degradation: 65, vegetation: 45 },
    { name: 'Nakuru', degradation: 48, vegetation: 62 },
  ];

  const alerts = [
    { id: 1, severity: 'medium', message: 'Vegetation density decreasing in Zone A3', time: '3 hours ago' },
    { id: 2, severity: 'low', message: 'Rainfall below seasonal average', time: '1 day ago' },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Load users from localStorage
const getUsers = () => {
  const users = localStorage.getItem('earthregen_users');
  return users ? JSON.parse(users) : [];
};

// Save users to localStorage
const saveUsers = (users) => {
  localStorage.setItem('earthregen_users', JSON.stringify(users));
};

// Check if user is logged in on page load
useState(() => {
  const savedUser = localStorage.getItem('earthregen_current_user');
  if (savedUser) {
    setCurrentUser(JSON.parse(savedUser));
  }
}, []);

// Sign Up Function
const handleSignUp = async () => {
  if (authUsername.length < 3) {
    alert('Username must be at least 3 characters');
    return;
  }
  if (!authEmail || !authEmail.includes('@')) {
    alert('Please enter a valid email');
    return;
  }
  if (authPassword.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  if (authPassword !== authConfirmPassword) {
    alert('Passwords do not match');
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('earthregen_users') || '[]');
  
  if (users.find(u => u.email === authEmail)) {
    alert('❌ Email already registered');
    return;
  }
  
  users.push({ username: authUsername, email: authEmail, password: authPassword });
  localStorage.setItem('earthregen_users', JSON.stringify(users));
  
  alert('✅ Account created successfully!');
  setAuthUsername('');
  setAuthEmail('');
  setAuthPassword('');
  setAuthConfirmPassword('');
  setIsSignUp(false);
  setCurrentPage('home');
};

// Sign In Function
const handleSignIn = async () => {
  if (!authEmail || !authPassword) {
    alert('Please enter email and password');
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('earthregen_users') || '[]');
  const user = users.find(u => u.email === authEmail && u.password === authPassword);
  
  if (!user) {
    alert('❌ Invalid login credentials');
    return;
  }
  
  localStorage.setItem('earthregen_current_user', authEmail);
  alert('✅ Signed in successfully!');
  setAuthEmail('');
  setAuthPassword('');
  setCurrentPage('home');
};

// Sign Out Function
const handleSignOut = async () => {
  if (window.confirm('Are you sure you want to sign out?')) {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentPage('home');
    alert('You have been signed out successfully.');
  }
};

  const processFile = async (file) => {
    setSelectedFile(URL.createObjectURL(file));
    setShowUploadOptions(false);
    setAnalyzingImage(true);
    
    try {
      // Convert image to base64 for AI analysis
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        
        // Analyze image with AI (simulated - replace with Claude Vision API)
        await analyzeImageWithAI(base64Image);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      setAnalyzingImage(false);
      alert('Error analyzing image. Please try again.');
    }
  };
  
  const saveSoilAnalysisToDatabase = async (analysis) => {
    console.log('Saving to Supabase:', {
      timestamp: new Date().toISOString(),
      analysis: analysis,
      user_location: location || 'Unknown'
    });
  };
  
  const analyzeImageWithAI = async (imageData) => {
  setTimeout(() => {
    
    const analysis = {
      healthScore: Math.floor(Math.random() * 30) + 60, // 60-90
      nitrogen: ['Low (20-30 ppm)', 'Moderate (40-50 ppm)', 'Good (60-70 ppm)'][Math.floor(Math.random() * 3)],
      phosphorus: ['Low (15-20 ppm)', 'Moderate (25-30 ppm)', 'Good (35-40 ppm)'][Math.floor(Math.random() * 3)],
      potassium: ['Low (80-100 ppm)', 'Moderate (110-130 ppm)', 'Good (140-160 ppm)'][Math.floor(Math.random() * 3)],
      ph: (Math.random() * 2 + 5.5).toFixed(1) + ' (Slightly Acidic)',
      organicMatter: (Math.random() * 2 + 2).toFixed(1) + '%',
      moisture: Math.floor(Math.random() * 15 + 15) + '%',
      soilTexture: ['Clay loam', 'Sandy loam', 'Silt loam', 'Loamy'][Math.floor(Math.random() * 4)],
      erosionRisk: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)],
      aiDetectedFeatures: [
        'Dark organic-rich topsoil visible',
        'Moderate soil aggregation observed',
        'Evidence of root systems present',
        'Surface moisture indicators detected'
      ],
      recommendations: [
        'Add potassium-rich fertilizer or compost',
        'Maintain current organic matter levels through mulching',
        'Consider crop rotation with legumes to boost nitrogen',
        'Monitor soil pH and add lime if needed',
        'Test soil again in 3 months to track improvements'
      ]
    };
    
    setSoilAnalysis(analysis);
    setAnalyzingImage(false);
    
    saveSoilAnalysisToDatabase(analysis);
  }, 3000);
};
  
  
  const fetchSatelliteData = async (locationName) => {
  setLoadingSatellite(true);
  try {
    // Get coordinates from location
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`
    );
    const geoData = await geoResponse.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('Location not found');
    }

    const { latitude, longitude, name } = geoData.results[0];

    // Simulated satellite data (replace with real API in production)
    const mockSatelliteData = {
      location: name,
      coordinates: { latitude, longitude },
      ndviData: generateNDVIData(),
      degradationZones: [
        { zone: 'Zone A', severity: 'Low', area: '125 ha', ndvi: 0.72 },
        { zone: 'Zone B', severity: 'Moderate', area: '80 ha', ndvi: 0.58 },
        { zone: 'Zone C', severity: 'High', area: '45 ha', ndvi: 0.35 }
      ],
      lastUpdated: new Date().toISOString(),
      vegetationHealth: 'Moderate',
      soilMoisture: 'Adequate',
      changeDetection: {
        lastMonth: '+5%',
        lastQuarter: '+12%',
        trend: 'improving'
      }
    };

    setSatelliteData(mockSatelliteData);
    setLoadingSatellite(false);
  } catch (error) {
    console.error('Error fetching satellite data:', error);
    setLoadingSatellite(false);
    alert('Could not fetch satellite data. Please try again.');
  }
};

  const generateNDVIData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      ndvi: (Math.random() * 0.3 + 0.5).toFixed(2),
      threshold: 0.5
    }));
  };

  // Land Assessment Functions
  const analyzeAndPlan = () => {
    if (!location || !landSize || !soilType || !degradationLevel || !waterAccess) {
      alert('Please fill in all fields to generate your plan');
      return;
    }

    const soilHealthScore = calculateSoilHealth();
    const treeRecommendations = getTreeRecommendations();
    const actionPlan = generateActionPlan();

    setAssessmentResults({
      soilHealthScore,
      treeRecommendations,
      actionPlan,
      timeline: generateTimeline()
    });
  };

  const calculateSoilHealth = () => {
    let score = 50;
    if (degradationLevel === 'low') score += 30;
    else if (degradationLevel === 'medium') score += 15;
    else if (degradationLevel === 'severe') score -= 20;
    if (soilType === 'loam') score += 20;
    else if (soilType === 'clay' || soilType === 'sandy') score += 10;
    if (waterAccess === 'good') score += 10;
    else if (waterAccess === 'moderate') score += 5;
    return Math.max(0, Math.min(100, score));
  };

  const getTreeRecommendations = () => {
    const recommendations = {
      loam: {
        low: ['Oak', 'Maple', 'Mahogany', 'Teak'],
        medium: ['Acacia', 'Eucalyptus', 'Pine', 'Cedar'],
        severe: ['Nitrogen-fixing Acacia', 'Moringa', 'Leucaena']
      },
      clay: {
        low: ['Willow', 'Ash', 'Poplar', 'Sycamore'],
        medium: ['Black Locust', 'Eastern Cottonwood', 'Silver Maple'],
        severe: ['Hardy Willows', 'Alder', 'Nitrogen-fixing Acacia']
      },
      sandy: {
        low: ['Pine', 'Cedar', 'Juniper', 'Mesquite'],
        medium: ['Acacia', 'Casuarina', 'Eucalyptus'],
        severe: ['Casuarina', 'Prosopis', 'Hardy Acacias']
      },
      rocky: {
        low: ['Juniper', 'Pine', 'Oak'],
        medium: ['Hardy Shrubs', 'Native Grasses', 'Acacia'],
        severe: ['Ground Cover', 'Vetiver Grass', 'Hardy Shrubs']
      }
    };
    return recommendations[soilType]?.[degradationLevel] || ['Consult local expert'];
  };

  const generateActionPlan = () => {
    const plans = {
      low: [
        'Soil testing for baseline nutrients',
        'Prepare land with minimal disturbance',
        'Plant trees in optimal spacing (6-8m apart)',
        'Establish mulching system',
        'Set up irrigation if needed'
      ],
      medium: [
        'Comprehensive soil analysis',
        'Add organic matter and compost',
        'Create contour terraces if on slopes',
        'Plant nitrogen-fixing trees first',
        'Implement water conservation techniques',
        'Schedule regular soil monitoring'
      ],
      severe: [
        'Emergency soil stabilization',
        'Install erosion control measures',
        'Heavy composting and organic amendments',
        'Plant ground cover immediately',
        'Establish water harvesting systems',
        'Phase 1: Stabilization (6 months)',
        'Phase 2: Soil building (1 year)',
        'Phase 3: Tree planting (after soil recovery)'
      ]
    };
    return plans[degradationLevel] || [];
  };

  const generateTimeline = () => {
    if (degradationLevel === 'severe') return '2-3 years for full restoration';
    if (degradationLevel === 'medium') return '1-2 years for restoration';
    return '6-12 months for planting and establishment';
  };

  const getSoilHealthColor = (score) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSoilHealthStatus = (score) => {
    if (score >= 70) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const generateKenyaInsights = () => {
  if (!selectedCrop) return null;
  
  const cropLower = selectedCrop.toLowerCase().trim();
  
  // Comprehensive crop database for Kenya
  const cropDatabase = {
    'maize': {
      plantingWindow: 'March-May (Long Rains) or October-December (Short Rains)',
      avgYield: '2.5-4 tons per hectare',
      waterRequirement: '450-650mm during growing season',
      commonPests: 'Fall armyworm, stem borers, aphids',
      marketPrice: 'KES 3,200-3,800 per 90kg bag',
      bestPractices: [
        'Plant disease-resistant varieties like H614 or DH04',
        'Use proper spacing (75cm x 25cm)',
        'Apply DAP fertilizer at planting and top-dress with CAN',
        'Implement integrated pest management for fall armyworm'
      ]
    },
    'beans': {
      plantingWindow: 'March-May (Long Rains) or October-November (Short Rains)',
      avgYield: '0.8-1.2 tons per hectare',
      waterRequirement: '350-500mm during growing season',
      commonPests: 'Bean stem maggot, aphids, bean fly',
      marketPrice: 'KES 8,000-12,000 per 90kg bag',
      bestPractices: [
        'Use certified seeds like Rosecoco or Mwitemania',
        'Plant at 50cm x 10cm spacing',
        'Practice crop rotation with cereals',
        'Apply organic manure before planting'
      ]
    },
    'green grams': {
      plantingWindow: 'March-May or October-December',
      avgYield: '0.5-0.8 tons per hectare',
      waterRequirement: '300-400mm during growing season',
      commonPests: 'Aphids, pod borers, thrips',
      marketPrice: 'KES 10,000-15,000 per 90kg bag',
      bestPractices: [
        'Use varieties like N26 or KS20',
        'Plant at 45cm x 10cm spacing',
        'Requires minimal fertilizer due to nitrogen fixation',
        'Harvest when 80% of pods turn black',
        'Drought tolerant - ideal for semi-arid areas'
      ]
    },
    'lentils': {
      plantingWindow: 'September-November (cool season crop)',
      avgYield: '0.6-1.0 tons per hectare',
      waterRequirement: '250-400mm during growing season',
      commonPests: 'Aphids, pod borers, rust',
      marketPrice: 'KES 12,000-18,000 per 90kg bag',
      bestPractices: [
        'Grows well in highland areas (1,800-2,500m)',
        'Plant at 30cm x 10cm spacing',
        'Minimal fertilizer needed - fixes nitrogen',
        'Harvest when plants turn yellow-brown',
        'Good rotation crop with cereals'
      ]
    },
    'cowpeas': {
      plantingWindow: 'March-May or October-November',
      avgYield: '0.7-1.0 tons per hectare',
      waterRequirement: '300-500mm during growing season',
      commonPests: 'Aphids, pod borers, leaf miners',
      marketPrice: 'KES 8,000-12,000 per 90kg bag',
      bestPractices: [
        'Use varieties like M66 or K80',
        'Plant at 60cm x 20cm spacing',
        'Highly drought tolerant',
        'Good cover crop for soil improvement',
        'Leaves can be used as sukuma wiki'
      ]
    },
    'soybeans': {
      plantingWindow: 'March-April (long rains)',
      avgYield: '1.2-2.0 tons per hectare',
      waterRequirement: '450-700mm during growing season',
      commonPests: 'Pod borers, aphids, whiteflies',
      marketPrice: 'KES 6,000-8,000 per 90kg bag',
      bestPractices: [
        'Use varieties like Gazelle or Nyala',
        'Inoculate seeds with rhizobium before planting',
        'Plant at 45cm x 5cm spacing',
        'Good for crop rotation and soil fertility',
        'Harvest when 95% of pods are brown'
      ]
    },
    'wheat': {
      plantingWindow: 'May-June or November-December',
      avgYield: '3-5 tons per hectare',
      waterRequirement: '450-650mm during growing season',
      commonPests: 'Wheat rust, aphids, armyworm',
      marketPrice: 'KES 4,500-5,500 per 90kg bag',
      bestPractices: [
        'Use certified seeds like Kenya Sunbird or Robin',
        'Apply 100-150 kg/ha of DAP at planting',
        'Practice early planting to avoid rust',
        'Use fungicides for rust control'
      ]
    },
    'rice': {
      plantingWindow: 'March-April or September-October',
      avgYield: '4-6 tons per hectare',
      waterRequirement: '1000-1500mm (flooded conditions)',
      commonPests: 'Rice blast, stem borers, birds',
      marketPrice: 'KES 6,000-8,000 per 90kg bag',
      bestPractices: [
        'Use varieties like Basmati 370 or NERICA',
        'Maintain flooded conditions during growth',
        'Apply nitrogen fertilizer in split applications',
        'Control weeds early in the season'
      ]
    },
    'sorghum': {
      plantingWindow: 'March-April or October-November',
      avgYield: '1.5-3.0 tons per hectare',
      waterRequirement: '400-600mm during growing season',
      commonPests: 'Shoot fly, stem borers, birds',
      marketPrice: 'KES 4,000-6,000 per 90kg bag',
      bestPractices: [
        'Use varieties like Gadam or Serena',
        'Highly drought tolerant - ideal for dry areas',
        'Plant at 75cm x 15cm spacing',
        'Use bird scarers during grain filling',
        'Can be intercropped with legumes'
      ]
    },
    'millet': {
      plantingWindow: 'March-May or October-November',
      avgYield: '0.8-1.5 tons per hectare',
      waterRequirement: '300-500mm during growing season',
      commonPests: 'Birds, stem borers, head miner',
      marketPrice: 'KES 5,000-8,000 per 90kg bag',
      bestPractices: [
        'Extremely drought tolerant',
        'Plant at 60cm x 10cm spacing',
        'Minimal input requirements',
        'Harvest when grains are hard',
        'Good for arid and semi-arid areas'
      ]
    },
    'potatoes': {
      plantingWindow: 'March-April or September-October',
      avgYield: '20-30 tons per hectare',
      waterRequirement: '500-700mm during growing season',
      commonPests: 'Late blight, potato tuber moth, aphids',
      marketPrice: 'KES 30-50 per kg',
      bestPractices: [
        'Use certified seeds like Shangi or Dutch Robjin',
        'Plant at 75cm x 30cm spacing',
        'Apply fungicides preventively for late blight',
        'Earth up plants to prevent greening of tubers'
      ]
    },
    'sweet potatoes': {
      plantingWindow: 'March-May (long rains)',
      avgYield: '10-20 tons per hectare',
      waterRequirement: '500-750mm during growing season',
      commonPests: 'Sweet potato weevils, virus diseases',
      marketPrice: 'KES 20-40 per kg',
      bestPractices: [
        'Use virus-free vines from certified sources',
        'Plant vines at 1m x 30cm spacing',
        'Grows well in sandy loam soils',
        'Harvest at 4-5 months',
        'Orange-fleshed varieties rich in Vitamin A'
      ]
    },
    'cassava': {
      plantingWindow: 'March-May (beginning of rains)',
      avgYield: '10-20 tons per hectare',
      waterRequirement: '1000-1500mm well distributed',
      commonPests: 'Cassava mosaic disease, mealybugs, green mites',
      marketPrice: 'KES 20-35 per kg',
      bestPractices: [
        'Use disease-free stem cuttings',
        'Plant at 1m x 1m spacing',
        'Very drought tolerant once established',
        'Harvest at 9-12 months',
        'Process quickly to avoid post-harvest rot'
      ]
    },
    'tea': {
      plantingWindow: 'March-May (during rainy season)',
      avgYield: '2,500-3,500 kg made tea per hectare per year',
      waterRequirement: '1,200-1,400mm well distributed annually',
      commonPests: 'Tea mosquito bug, thrips, red spider mites',
      marketPrice: 'KES 40-70 per kg (green leaf)',
      bestPractices: [
        'Plant certified clones like TRFK 6/8 or TRFK 31/8',
        'Maintain pH of 4.5-5.5',
        'Apply NPK fertilizer quarterly',
        'Prune regularly to maintain plucking table'
      ]
    },
    'coffee': {
      plantingWindow: 'March-April (before long rains)',
      avgYield: '5-10 kg cherry per tree per year',
      waterRequirement: '1,000-1,500mm well distributed',
      commonPests: 'Coffee berry disease, leaf rust, antestia bugs',
      marketPrice: 'KES 80-120 per kg (parchment)',
      bestPractices: [
        'Use disease-resistant varieties like Ruiru 11 or Batian',
        'Maintain proper shade with trees',
        'Apply copper-based fungicides for CBD',
        'Mulch heavily to conserve moisture'
      ]
    },
    'tomatoes': {
      plantingWindow: 'Year-round with irrigation, March-April for rain-fed',
      avgYield: '20-40 tons per hectare',
      waterRequirement: '400-600mm during growing season',
      commonPests: 'Bacterial wilt, late blight, whiteflies, tomato leaf miner',
      marketPrice: 'KES 30-80 per kg (varies by season)',
      bestPractices: [
        'Use hybrid varieties like Anna F1 or Eden F1',
        'Practice crop rotation to avoid soil-borne diseases',
        'Stake plants and prune for better aeration',
        'Apply drip irrigation for water efficiency'
      ]
    },
    'cabbage': {
      plantingWindow: 'Year-round with irrigation',
      avgYield: '40-60 tons per hectare',
      waterRequirement: '380-500mm during growing season',
      commonPests: 'Diamondback moth, aphids, cutworms',
      marketPrice: 'KES 10-30 per kg',
      bestPractices: [
        'Use varieties like Gloria F1 or Riana F1',
        'Plant at 60cm x 45cm spacing',
        'Apply organic manure and NPK fertilizer',
        'Use Bt-based pesticides for diamondback moth'
      ]
    },
    'kale': {
      plantingWindow: 'Year-round with irrigation',
      avgYield: '15-25 tons per hectare',
      waterRequirement: '380-500mm during growing season',
      commonPests: 'Aphids, diamondback moth, cutworms',
      marketPrice: 'KES 20-50 per kg',
      bestPractices: [
        'Most popular vegetable in Kenya (sukuma wiki)',
        'Plant at 45cm x 45cm spacing',
        'Harvest leaves continuously for extended period',
        'Apply manure and CAN fertilizer regularly',
        'Can be intercropped with maize and beans'
      ]
    },
    'spinach': {
      plantingWindow: 'Year-round, best in cool seasons',
      avgYield: '10-15 tons per hectare',
      waterRequirement: '350-500mm during growing season',
      commonPests: 'Leaf miners, aphids, caterpillars',
      marketPrice: 'KES 30-60 per kg',
      bestPractices: [
        'Use varieties suited to local conditions',
        'Plant at 20cm x 10cm spacing',
        'Requires rich, well-drained soil',
        'Harvest leaves when 10-15cm long',
        'Quick growing - ready in 6-8 weeks'
      ]
    },
    'onions': {
      plantingWindow: 'January-February or July-August',
      avgYield: '15-25 tons per hectare',
      waterRequirement: '350-550mm during growing season',
      commonPests: 'Thrips, purple blotch, downy mildew',
      marketPrice: 'KES 40-100 per kg',
      bestPractices: [
        'Use varieties like Red Creole or Bombay Red',
        'Plant at 20cm x 10cm spacing',
        'Reduce watering 2 weeks before harvest',
        'Cure bulbs properly before storage'
      ]
    },
    'peppers': {
      plantingWindow: 'March-May or September-October',
      avgYield: '10-20 tons per hectare',
      waterRequirement: '600-850mm during growing season',
      commonPests: 'Aphids, whiteflies, bacterial wilt',
      marketPrice: 'KES 60-150 per kg (bell peppers)',
      bestPractices: [
        'Use hybrid varieties like California Wonder',
        'Plant at 60cm x 45cm spacing',
        'Requires well-drained fertile soils',
        'Stake plants for support',
        'Harvest when fruits reach full size'
      ]
    },
    'carrots': {
      plantingWindow: 'Year-round with irrigation, best March-May',
      avgYield: '20-35 tons per hectare',
      waterRequirement: '350-500mm during growing season',
      commonPests: 'Leaf blight, aphids, carrot fly',
      marketPrice: 'KES 30-60 per kg',
      bestPractices: [
        'Use varieties like Nantes or Chantenay',
        'Plant in well-drained sandy loam soils',
        'Thin seedlings to 5cm spacing',
        'Harvest at 90-120 days for best quality'
      ]
    },
    'sugarcane': {
      plantingWindow: 'March-April or October-November',
      avgYield: '80-120 tons per hectare',
      waterRequirement: '1,500-2,500mm during growing season',
      commonPests: 'Sugarcane borer, aphids, white grubs',
      marketPrice: 'KES 4,500-5,500 per ton',
      bestPractices: [
        'Use healthy seed cane from certified nurseries',
        'Apply NPK fertilizer at planting',
        'Practice trash blanketing to conserve moisture',
        'Harvest at 18-24 months maturity'
      ]
    },
    'bananas': {
      plantingWindow: 'Year-round in areas with adequate rainfall',
      avgYield: '30-50 tons per hectare per year',
      waterRequirement: '1,200-1,500mm well distributed',
      commonPests: 'Panama disease, weevils, nematodes',
      marketPrice: 'KES 20-50 per kg',
      bestPractices: [
        'Use tissue culture seedlings for disease-free planting',
        'Apply organic mulch heavily around plants',
        'De-sucker regularly to maintain 3-5 stems per mat',
        'Practice crop rotation with legumes'
      ]
    },
    'mangoes': {
      plantingWindow: 'March-May (beginning of rains)',
      avgYield: '100-200 kg per tree per year (mature trees)',
      waterRequirement: '1,000-1,250mm well distributed',
      commonPests: 'Fruit flies, anthracnose, mango weevils',
      marketPrice: 'KES 30-80 per kg',
      bestPractices: [
        'Use grafted varieties like Apple, Ngowe, or Kent',
        'Plant at 10m x 10m spacing',
        'Requires deep, well-drained soils',
        'Apply organic manure annually',
        'Use fruit fly traps during fruiting season',
        'Trees start bearing at 3-5 years'
      ]
    },
    'oranges': {
      plantingWindow: 'March-May (beginning of rains)',
      avgYield: '150-250 kg per tree per year (mature trees)',
      waterRequirement: '900-1,200mm well distributed',
      commonPests: 'Citrus greening, fruit flies, scale insects',
      marketPrice: 'KES 40-80 per kg',
      bestPractices: [
        'Use certified grafted seedlings',
        'Plant at 6m x 6m spacing',
        'Requires well-drained soils with pH 6-7',
        'Apply NPK fertilizer 3-4 times per year',
        'Control citrus greening with psyllid management',
        'Trees start bearing at 3-4 years'
      ]
    },
    'apples': {
      plantingWindow: 'March-April or October-November',
      avgYield: '15-25 tons per hectare',
      waterRequirement: '1,000-1,200mm well distributed',
      commonPests: 'Codling moth, aphids, fruit flies, scab',
      marketPrice: 'KES 80-150 per kg',
      bestPractices: [
        'Requires cool highland areas (1,800-2,500m altitude)',
        'Use varieties like Anna, Golden Dorsett',
        'Plant at 4m x 4m spacing',
        'Requires cross-pollination - plant 2+ varieties',
        'Apply dormant spray for pest control',
        'Thin fruits for better size and quality'
      ]
    },
    'avocados': {
      plantingWindow: 'March-May (beginning of rains)',
      avgYield: '7-15 tons per hectare (mature orchards)',
      waterRequirement: '1,000-1,600mm well distributed',
      commonPests: 'Fruit flies, thrips, root rot',
      marketPrice: 'KES 15-40 per fruit (export quality higher)',
      bestPractices: [
        'Use grafted varieties like Hass or Fuerte',
        'Plant at 8m x 8m spacing',
        'Requires well-drained soils - sensitive to waterlogging',
        'Apply mulch to maintain soil moisture',
        'Trees start bearing at 3-5 years',
        'High export potential to Europe and Middle East'
      ]
    },
    'pawpaw': {
      plantingWindow: 'Year-round with irrigation',
      avgYield: '40-60 kg per tree per year',
      waterRequirement: '1,000-1,500mm well distributed',
      commonPests: 'Papaya ringspot virus, fruit flies, aphids',
      marketPrice: 'KES 30-60 per kg',
      bestPractices: [
        'Use varieties like Solo or Red Lady',
        'Plant at 2.5m x 2.5m spacing',
        'Fast growing - fruits in 9-12 months',
        'Requires well-drained fertile soils',
        'Remove male trees after flowering',
        'Economic lifespan of 3-4 years'
      ]
    },
    'passion fruit': {
      plantingWindow: 'March-May or September-October',
      avgYield: '10-20 tons per hectare per year',
      waterRequirement: '900-1,500mm well distributed',
      commonPests: 'Fusarium wilt, fruit flies, aphids',
      marketPrice: 'KES 30-80 per kg',
      bestPractices: [
        'Use disease-resistant grafted seedlings',
        'Plant at 3m x 3m spacing with trellising',
        'Requires well-drained soils',
        'Apply organic manure and NPK fertilizer',
        'Fruits start at 6-9 months',
        'High demand for juice processing'
      ]
    },
    'pineapples': {
      plantingWindow: 'March-May (beginning of rains)',
      avgYield: '40-60 tons per hectare',
      waterRequirement: '1,000-1,500mm well distributed',
      commonPests: 'Mealybugs, heart rot, nematodes',
      marketPrice: 'KES 50-100 per kg',
      bestPractices: [
        'Use disease-free suckers or crowns',
        'Plant at 90cm x 60cm spacing',
        'Requires well-drained acidic soils',
        'Apply organic mulch',
        'Fruits at 18-24 months after planting',
        'Can get ratoon crops for 2-3 years'
      ]
    },
    'watermelon': {
      plantingWindow: 'February-March or August-September',
      avgYield: '20-40 tons per hectare',
      waterRequirement: '400-600mm during growing season',
      commonPests: 'Aphids, fruit flies, fusarium wilt',
      marketPrice: 'KES 15-30 per kg',
      bestPractices: [
        'Use hybrid varieties for better yields',
        'Plant at 2m x 1m spacing',
        'Requires warm temperatures and full sun',
        'Apply drip irrigation for water efficiency',
        'Harvest at 80-90 days when tendril dries',
        'Good cash crop for dry areas'
      ]
    },
    'strawberries': {
      plantingWindow: 'March-April or September-October',
      avgYield: '15-25 tons per hectare',
      waterRequirement: '500-700mm during growing season',
      commonPests: 'Spider mites, aphids, gray mold',
      marketPrice: 'KES 200-400 per kg',
      bestPractices: [
        'Grows well in highland areas (1,500-2,500m)',
        'Use certified disease-free runners',
        'Plant on raised beds with plastic mulch',
        'Requires drip irrigation',
        'Harvest fruits regularly when fully red',
        'High value crop with good market demand'
      ]
    },
    'macadamia': {
      plantingWindow: 'March-May (beginning of rains)',
      avgYield: '2-4 tons per hectare (mature orchards)',
      waterRequirement: '1,000-1,500mm well distributed',
      commonPests: 'Nut borer, stink bugs, rats',
      marketPrice: 'KES 80-150 per kg (in shell)',
      marketPrice: 'KES 80-150 per kg (in shell)',
      bestPractices: [
        'Use grafted varieties like Beaumont or Murang\'a 20',
        'Plant at 8m x 8m spacing',
        'Trees start bearing at 5-7 years',
        'Requires minimal pruning',
        'High export value - strong demand',
        'Long-term investment crop'
      ]
    }
  };
  
  // Find matching crop (flexible matching)
  let cropData = null;
  for (const [key, value] of Object.entries(cropDatabase)) {
    if (cropLower.includes(key) || key.includes(cropLower)) {
      cropData = value;
      break;
    }
  }
  
  // If crop not found, return generic insights
  if (!cropData) {
    return {
      plantingWindow: 'Varies by crop - consult local extension officer',
      avgYield: 'Data not available for this crop',
      waterRequirement: '400-800mm during growing season (typical)',
      commonPests: 'Consult local agricultural extension for specific pests',
      marketPrice: 'Contact local markets for current pricing',
      bestPractices: [
        'Use certified seeds from authorized dealers',
        'Test soil and apply recommended fertilizers',
        'Practice proper spacing based on crop requirements',
        'Monitor for pests and diseases regularly',
        'Harvest at the right maturity stage'
      ]
    };
  }
  
  return cropData;
};

const generateCountyInsights = () => {
  if (!selectedCounty) {
    alert('Please select a county first');
    return;
  }

  const countyDatabase = {
    // CENTRAL REGION
    'nairobi': {
      climate: 'Subtropical highland climate, cool and temperate',
      rainfall: '900-1,200mm annually',
      temperature: '12-26°C year-round',
      altitude: '1,600-1,800m above sea level',
      soilTypes: ['Red volcanic soils', 'Black cotton soils', 'Alluvial soils'],
      bestCrops: ['Kale (Sukuma wiki)', 'Cabbage', 'Tomatoes', 'Beans', 'Carrots', 'Spinach'],
      challenges: ['Limited agricultural land due to urbanization', 'High land prices', 'Water scarcity in dry seasons'],
      opportunities: ['Urban farming and vertical gardens', 'High market demand', 'Greenhouse farming', 'Value addition and processing']
    },
    'kiambu': {
      climate: 'Tropical highland climate with moderate temperatures',
      rainfall: '1,000-1,800mm annually (bimodal)',
      temperature: '14-24°C year-round',
      altitude: '1,400-2,300m above sea level',
      soilTypes: ['Red volcanic soils (very fertile)', 'Humic Nitisols', 'Clay loam'],
      bestCrops: ['Coffee', 'Tea', 'Macadamia', 'Avocado', 'Bananas', 'Irish potatoes', 'Vegetables'],
      challenges: ['Unpredictable rainfall patterns', 'Coffee Berry Disease', 'Soil acidity in some areas'],
      opportunities: ['High-value crops (coffee, avocado)', 'Proximity to Nairobi market', 'Greenhouse farming', 'Agro-tourism']
    },
    'muranga': {
      climate: 'Tropical highland climate',
      rainfall: '1,200-2,000mm annually',
      temperature: '14-24°C year-round',
      altitude: '1,200-3,353m above sea level',
      soilTypes: ['Rich volcanic soils', 'Humic Nitisols', 'Red clay loam'],
      bestCrops: ['Tea', 'Coffee', 'Macadamia', 'Bananas', 'Maize', 'Beans', 'Irish potatoes'],
      challenges: ['Soil erosion on steep slopes', 'Land fragmentation', 'Coffee diseases'],
      opportunities: ['Premium tea and coffee', 'Macadamia farming', 'Dairy farming', 'Horticulture']
    },
    'nyeri': {
      climate: 'Tropical highland climate, cool and wet',
      rainfall: '1,000-2,000mm annually',
      temperature: '12-24°C year-round',
      altitude: '1,800-5,199m (includes Mt. Kenya)',
      soilTypes: ['Rich volcanic soils (humic nitisols)', 'Red clay', 'Mountain soils'],
      bestCrops: ['Tea', 'Coffee (high quality)', 'Macadamia', 'Irish potatoes', 'Maize', 'Beans', 'Vegetables'],
      challenges: ['Frost in high altitude areas', 'Small land parcels', 'High production costs'],
      opportunities: ['Premium tea and coffee', 'Horticulture', 'Macadamia farming', 'Dairy farming']
    },
    'nyandarua': {
      climate: 'Cool highland climate',
      rainfall: '800-1,400mm annually',
      temperature: '8-22°C year-round (can drop below 0°C)',
      altitude: '1,800-3,906m above sea level',
      soilTypes: ['Volcanic soils', 'Andosols', 'Clay loam'],
      bestCrops: ['Irish potatoes', 'Wheat', 'Barley', 'Pyrethrum', 'Peas', 'Vegetables', 'Dairy farming'],
      challenges: ['Frequent frost', 'Hailstorms', 'High altitude limitations'],
      opportunities: ['Large-scale potato production', 'Pyrethrum (natural insecticide)', 'Dairy farming', 'Horticulture']
    },
    'kirinyaga': {
      climate: 'Tropical to highland climate',
      rainfall: '1,200-2,100mm annually',
      temperature: '14-26°C year-round',
      altitude: '1,200-5,199m above sea level',
      soilTypes: ['Fertile volcanic soils', 'Alluvial soils', 'Clay loam'],
      bestCrops: ['Rice', 'Coffee', 'Tea', 'Maize', 'Beans', 'Tomatoes', 'Bananas'],
      challenges: ['Flooding in rice-growing areas', 'Post-harvest losses', 'Market fluctuations'],
      opportunities: ['Rice production (Mwea)', 'Coffee and tea', 'Horticulture', 'Fish farming']
    },

    // COAST REGION
    'mombasa': {
      climate: 'Tropical coastal climate, hot and humid',
      rainfall: '900-1,200mm annually',
      temperature: '24-32°C year-round',
      altitude: '0-50m above sea level',
      soilTypes: ['Coral limestone soils', 'Sandy soils', 'Alluvial soils'],
      bestCrops: ['Coconuts', 'Cashew nuts', 'Mangoes', 'Oranges', 'Cassava', 'Sweet potatoes', 'Pawpaw'],
      challenges: ['Saline soils in coastal areas', 'High temperatures', 'Limited agricultural land (urban)'],
      opportunities: ['Coconut value chain', 'Fruit tree farming', 'Urban farming', 'Aquaculture']
    },
    'kwale': {
      climate: 'Tropical coastal climate',
      rainfall: '1,000-1,400mm annually',
      temperature: '23-30°C year-round',
      altitude: '0-500m above sea level',
      soilTypes: ['Sandy soils', 'Clay soils', 'Alluvial soils'],
      bestCrops: ['Coconuts', 'Cashew nuts', 'Mangoes', 'Cassava', 'Maize', 'Cowpeas', 'Sesame'],
      challenges: ['Erratic rainfall', 'Poor soil fertility', 'Limited irrigation'],
      opportunities: ['Cashew nut processing', 'Coconut value chain', 'Tourism integration', 'Fruit farming']
    },
    'kilifi': {
      climate: 'Tropical coastal climate',
      rainfall: '900-1,200mm annually',
      temperature: '22-32°C year-round',
      altitude: '0-400m above sea level',
      soilTypes: ['Sandy soils', 'Coral limestone', 'Red clay'],
      bestCrops: ['Coconuts', 'Cashew nuts', 'Mangoes', 'Pineapples', 'Cassava', 'Sweet potatoes'],
      challenges: ['Water scarcity in dry seasons', 'Soil salinity near coast', 'Human-wildlife conflict'],
      opportunities: ['Coconut farming', 'Fruit processing', 'Beekeeping', 'Ecotourism']
    },
    'tana-river': {
      climate: 'Hot and dry semi-arid climate',
      rainfall: '300-700mm annually',
      temperature: '24-36°C year-round',
      altitude: '0-300m above sea level',
      soilTypes: ['Alluvial soils', 'Sandy soils', 'Clay soils'],
      bestCrops: ['Rice', 'Maize', 'Cowpeas', 'Green grams', 'Mangoes', 'Bananas (irrigated)'],
      challenges: ['Frequent flooding', 'Droughts', 'Poor infrastructure', 'Insecurity'],
      opportunities: ['Irrigation farming along Tana River', 'Rice production', 'Livestock keeping', 'Fishing']
    },
    'lamu': {
      climate: 'Tropical coastal climate',
      rainfall: '900-1,100mm annually',
      temperature: '24-31°C year-round',
      altitude: '0-20m above sea level',
      soilTypes: ['Sandy soils', 'Coral limestone', 'Mangrove soils'],
      bestCrops: ['Coconuts', 'Mangoes', 'Cassava', 'Cowpeas', 'Sesame', 'Sweet potatoes'],
      challenges: ['Limited arable land', 'Water scarcity', 'Insecurity concerns'],
      opportunities: ['Coconut farming', 'Fishing and aquaculture', 'Tourism integration', 'Mangrove conservation']
    },
    'taita-taveta': {
      climate: 'Varied - from hot dry plains to cool highlands',
      rainfall: '500-1,400mm annually',
      temperature: '14-32°C depending on altitude',
      altitude: '600-2,208m above sea level',
      soilTypes: ['Volcanic soils in highlands', 'Sandy loam', 'Red clay'],
      bestCrops: ['Maize', 'Beans', 'Bananas', 'Coffee', 'Sisal', 'Fruits', 'Vegetables in highlands'],
      challenges: ['Erratic rainfall', 'Human-wildlife conflict', 'Water scarcity in lowlands'],
      opportunities: ['Horticulture in highlands', 'Sisal farming', 'Wildlife conservation', 'Tourism']
    },

    // EASTERN REGION
    'machakos': {
      climate: 'Semi-arid to sub-humid climate',
      rainfall: '500-1,300mm annually (erratic)',
      temperature: '18-28°C year-round',
      altitude: '1,000-1,800m above sea level',
      soilTypes: ['Red sandy loam', 'Murram soils', 'Rocky soils in some areas'],
      bestCrops: ['Maize', 'Beans', 'Cowpeas', 'Green grams', 'Pigeon peas', 'Mangoes', 'Oranges', 'Sorghum'],
      challenges: ['Erratic rainfall and frequent droughts', 'Soil erosion', 'Low soil fertility'],
      opportunities: ['Drought-resistant crops', 'Water harvesting potential', 'Fruit tree farming', 'Poultry farming']
    },
    'makueni': {
      climate: 'Semi-arid climate',
      rainfall: '500-1,050mm annually',
      temperature: '18-30°C year-round',
      altitude: '600-1,800m above sea level',
      soilTypes: ['Sandy loam', 'Red soils', 'Rocky soils'],
      bestCrops: ['Green grams', 'Cowpeas', 'Pigeon peas', 'Sorghum', 'Millet', 'Mangoes', 'Oranges'],
      challenges: ['Frequent droughts', 'Low soil fertility', 'Water scarcity'],
      opportunities: ['Drought-resistant legumes', 'Fruit tree farming', 'Beekeeping', 'Sand dams']
    },
    'kitui': {
      climate: 'Semi-arid to arid climate',
      rainfall: '500-1,100mm annually (unreliable)',
      temperature: '18-30°C year-round',
      altitude: '400-1,830m above sea level',
      soilTypes: ['Sandy loam', 'Red soils', 'Rocky soils'],
      bestCrops: ['Green grams', 'Cowpeas', 'Pigeon peas', 'Sorghum', 'Millet', 'Drought-tolerant maize', 'Mangoes'],
      challenges: ['Frequent droughts', 'Soil erosion', 'Poor road network', 'Water scarcity'],
      opportunities: ['Drought-resistant legumes', 'Mango farming', 'Beekeeping', 'Sand harvesting']
    },
    'embu': {
      climate: 'Tropical highland climate',
      rainfall: '1,200-1,800mm annually',
      temperature: '14-26°C year-round',
      altitude: '700-5,199m above sea level',
      soilTypes: ['Volcanic soils', 'Red clay loam', 'Humic soils'],
      bestCrops: ['Tea', 'Coffee', 'Maize', 'Beans', 'Rice', 'Bananas', 'Macadamia'],
      challenges: ['Soil erosion', 'Small land holdings', 'Market access'],
      opportunities: ['Tea and coffee', 'Rice farming (Mwea)', 'Dairy farming', 'Horticulture']
    },
    'tharaka-nithi': {
      climate: 'Semi-arid to highland climate',
      rainfall: '600-1,800mm annually',
      temperature: '16-28°C year-round',
      altitude: '400-5,199m above sea level',
      soilTypes: ['Volcanic soils in highlands', 'Sandy loam in lowlands', 'Red clay'],
      bestCrops: ['Tea', 'Coffee', 'Maize', 'Beans', 'Miraa', 'Bananas', 'Green grams in lowlands'],
      challenges: ['Variable rainfall', 'Soil erosion', 'Limited irrigation in lowlands'],
      opportunities: ['Tea and coffee in highlands', 'Miraa farming', 'Dairy farming', 'Horticulture']
    },
    'meru': {
      climate: 'Tropical to temperate highland climate',
      rainfall: '800-2,500mm annually (varies with altitude)',
      temperature: '12-26°C year-round',
      altitude: '300-5,199m (includes Mt. Kenya)',
      soilTypes: ['Rich volcanic soils', 'Red clay loam', 'Humic soils'],
      bestCrops: ['Tea', 'Coffee', 'Bananas', 'Maize', 'Beans', 'Irish potatoes', 'Miraa (khat)', 'Macadamia'],
      challenges: ['Variable rainfall patterns', 'Frost in higher zones', 'Market access in remote areas'],
      opportunities: ['High-value crops (tea, coffee, miraa)', 'Diverse agro-ecological zones', 'Fruit tree farming', 'Dairy farming']
    },
    'isiolo': {
      climate: 'Arid to semi-arid climate',
      rainfall: '300-700mm annually',
      temperature: '22-34°C year-round',
      altitude: '200-2,400m above sea level',
      soilTypes: ['Sandy soils', 'Rocky soils', 'Alluvial soils near rivers'],
      bestCrops: ['Sorghum', 'Millet', 'Green grams', 'Cowpeas', 'Aloe vera', 'Livestock (main)'],
      challenges: ['Severe water scarcity', 'Frequent droughts', 'Insecurity', 'Poor infrastructure'],
      opportunities: ['Irrigation farming', 'Livestock production', 'Aloe vera farming', 'Tourism']
    },
    'marsabit': {
      climate: 'Arid to semi-arid climate',
      rainfall: '200-800mm annually',
      temperature: '20-32°C year-round',
      altitude: '300-1,865m above sea level',
      soilTypes: ['Sandy soils', 'Volcanic soils', 'Rocky soils'],
      bestCrops: ['Sorghum', 'Millet', 'Cowpeas', 'Aloe vera', 'Livestock (camels, goats)'],
      challenges: ['Severe droughts', 'Water scarcity', 'Insecurity', 'Remote location'],
      opportunities: ['Camel farming', 'Gum and resin production', 'Drought-resistant crops', 'Tourism']
    },

    // NORTH EASTERN REGION
    'garissa': {
      climate: 'Arid climate',
      rainfall: '200-500mm annually',
      temperature: '24-38°C year-round (very hot)',
      altitude: '80-400m above sea level',
      soilTypes: ['Sandy soils', 'Alluvial soils along rivers', 'Rocky soils'],
      bestCrops: ['Sorghum', 'Cowpeas', 'Watermelon', 'Vegetables (irrigated)', 'Pastoralism (main)'],
      challenges: ['Extreme water scarcity', 'Very high temperatures', 'Insecurity', 'Poor infrastructure'],
      opportunities: ['Irrigation along Tana River', 'Camel and livestock', 'Gum arabic', 'Watermelon farming']
    },
    'wajir': {
      climate: 'Arid climate',
      rainfall: '200-400mm annually',
      temperature: '26-38°C year-round',
      altitude: '200-500m above sea level',
      soilTypes: ['Sandy soils', 'Rocky soils', 'Shallow soils'],
      bestCrops: ['Sorghum', 'Millet', 'Cowpeas', 'Pastoralism (camels, goats, sheep)'],
      challenges: ['Severe droughts', 'Extreme water scarcity', 'Insecurity', 'Desertification'],
      opportunities: ['Camel milk production', 'Livestock trading', 'Drought-resistant crops', 'Solar energy']
    },
    'mandera': {
      climate: 'Arid climate',
      rainfall: '150-400mm annually',
      temperature: '26-40°C year-round',
      altitude: '200-500m above sea level',
      soilTypes: ['Sandy soils', 'Rocky soils', 'Poor shallow soils'],
      bestCrops: ['Sorghum', 'Cowpeas', 'Watermelon (along rivers)', 'Pastoralism (main)'],
      challenges: ['Extreme droughts', 'Very limited water', 'Insecurity', 'Harsh climate'],
      opportunities: ['Cross-border livestock trade', 'Camel production', 'Gum and resin', 'Date palm farming']
    },

    // NYANZA REGION
    'kisumu': {
      climate: 'Tropical climate with high humidity',
      rainfall: '1,200-1,600mm annually',
      temperature: '18-32°C year-round',
      altitude: '1,100-1,400m above sea level',
      soilTypes: ['Alluvial soils', 'Black cotton soils', 'Red clay'],
      bestCrops: ['Rice', 'Sugarcane', 'Cotton', 'Maize', 'Sorghum', 'Cassava', 'Sweet potatoes', 'Fish farming'],
      challenges: ['Flooding in low-lying areas', 'Pests and diseases (humid conditions)', 'Limited irrigation'],
      opportunities: ['Rice farming in Kano plains', 'Fish farming (Lake Victoria)', 'Sugarcane processing', 'Horticulture']
    },
    'siaya': {
      climate: 'Tropical humid climate',
      rainfall: '1,200-1,800mm annually',
      temperature: '18-30°C year-round',
      altitude: '1,130-1,500m above sea level',
      soilTypes: ['Alluvial soils', 'Black cotton soils', 'Red clay'],
      bestCrops: ['Maize', 'Sorghum', 'Sweet potatoes', 'Cassava', 'Groundnuts', 'Fish farming'],
      challenges: ['Waterlogging', 'HIV/AIDS impact on labor', 'Limited mechanization'],
      opportunities: ['Fish farming', 'Sugarcane farming', 'Cotton revival', 'Value addition']
    },
    'homa-bay': {
      climate: 'Tropical humid climate',
      rainfall: '1,000-1,600mm annually',
      temperature: '18-32°C year-round',
      altitude: '1,140-1,800m above sea level',
      soilTypes: ['Alluvial soils', 'Black cotton soils', 'Red clay'],
      bestCrops: ['Maize', 'Sorghum', 'Sugarcane', 'Sweet potatoes', 'Cassava', 'Fish farming'],
      challenges: ['Poor soils in some areas', 'Limited irrigation', 'Post-harvest losses'],
      opportunities: ['Fish farming (Lake Victoria)', 'Sugarcane farming', 'Tobacco farming', 'Cotton']
    },
    'migori': {
      climate: 'Tropical climate',
      rainfall: '1,200-1,800mm annually',
      temperature: '18-30°C year-round',
      altitude: '1,200-2,000m above sea level',
      soilTypes: ['Volcanic soils', 'Alluvial soils', 'Clay loam'],
      bestCrops: ['Sugarcane', 'Tobacco', 'Maize', 'Sorghum', 'Sunflower', 'Fish farming'],
      challenges: ['Soil erosion', 'Limited irrigation', 'Market access'],
      opportunities: ['Sugarcane processing', 'Tobacco farming', 'Gold mining integration', 'Horticulture']
    },
    'kisii': {
      climate: 'Tropical highland climate',
      rainfall: '1,500-2,100mm annually',
      temperature: '14-28°C year-round',
      altitude: '1,200-2,206m above sea level',
      soilTypes: ['Volcanic soils (very fertile)', 'Red clay', 'Humic soils'],
      bestCrops: ['Tea', 'Bananas', 'Maize', 'Beans', 'Coffee', 'Avocados', 'Vegetables'],
      challenges: ['Small land parcels', 'Soil erosion on slopes', 'High population density'],
      opportunities: ['Tea farming', 'Soapstone carving', 'Dairy farming', 'Avocado export']
    },
    'nyamira': {
      climate: 'Tropical highland climate',
      rainfall: '1,400-2,000mm annually',
      temperature: '14-26°C year-round',
      altitude: '1,500-2,100m above sea level',
      soilTypes: ['Volcanic soils', 'Red clay', 'Humic soils'],
      bestCrops: ['Tea', 'Bananas', 'Maize', 'Beans', 'Irish potatoes', 'Vegetables'],
      challenges: ['Steep slopes', 'Soil erosion', 'Land fragmentation'],
      opportunities: ['Tea production', 'Dairy farming', 'Horticulture', 'Soapstone']
    },

    // RIFT VALLEY REGION
    'nakuru': {
      climate: 'Varied - from tropical to temperate highlands',
      rainfall: '700-1,500mm annually',
      temperature: '10-28°C depending on altitude',
      altitude: '1,800-2,700m above sea level',
      soilTypes: ['Volcanic soils (very fertile)', 'Black cotton soils', 'Sandy loam'],
      bestCrops: ['Wheat', 'Barley', 'Maize', 'Irish potatoes', 'Pyrethrum', 'Vegetables', 'Cut flowers'],
      challenges: ['Frost in higher altitudes', 'Hailstorms', 'Land fragmentation'],
      opportunities: ['Large-scale wheat farming', 'Horticulture for export', 'Dairy farming', 'Floriculture']
    },
    'narok': {
      climate: 'Tropical to temperate highland climate',
      rainfall: '700-1,800mm annually',
      temperature: '10-28°C year-round',
      altitude: '1,500-3,098m above sea level',
      soilTypes: ['Volcanic soils', 'Sandy loam', 'Clay soils'],
      bestCrops: ['Wheat', 'Barley', 'Maize', 'Irish potatoes', 'Beans', 'Livestock (main)'],
      challenges: ['Human-wildlife conflict', 'Land use conflicts', 'Limited infrastructure'],
      opportunities: ['Large-scale wheat farming', 'Livestock production', 'Tourism integration', 'Dairy farming']
    },
    'kajiado': {
      climate: 'Semi-arid to arid climate',
      rainfall: '300-800mm annually (erratic)',
      temperature: '20-30°C year-round',
      altitude: '500-2,460m above sea level',
      soilTypes: ['Volcanic soils', 'Sandy loam', 'Clay soils'],
      bestCrops: ['Drought-resistant maize', 'Sorghum', 'Cowpeas', 'Green grams', 'Sisal', 'Aloe vera', 'Livestock (main)'],
      challenges: ['Prolonged droughts', 'Water scarcity', 'Overgrazing', 'Human-wildlife conflict'],
      opportunities: ['Drought-tolerant crops', 'Range management', 'Game farming', 'Ecotourism']
    },
    'kericho': {
      climate: 'Cool highland climate, wet',
      rainfall: '1,400-2,100mm annually',
      temperature: '10-24°C year-round',
      altitude: '1,500-3,000m above sea level',
      soilTypes: ['Volcanic soils (very fertile)', 'Red clay', 'Humic soils'],
      bestCrops: ['Tea (main crop)', 'Maize', 'Irish potatoes', 'Dairy farming', 'Vegetables'],
      challenges: ['Frost in high areas', 'Hailstorms', 'High input costs'],
      opportunities: ['Large-scale tea production', 'Premium tea', 'Dairy farming', 'Tourism']
    },
    'bomet': {
      climate: 'Highland climate',
      rainfall: '1,200-1,800mm annually',
      temperature: '12-24°C year-round',
      altitude: '1,500-3,000m above sea level',
      soilTypes: ['Volcanic soils', 'Red clay', 'Humic soils'],
      bestCrops: ['Tea', 'Maize', 'Irish potatoes', 'Beans', 'Dairy farming'],
      challenges: ['Frost', 'Limited market access', 'Soil erosion on slopes'],
      opportunities: ['Tea farming', 'Dairy production', 'Irish potatoes', 'Horticulture']
    },
    'uasin-gishu': {
      climate: 'Temperate highland climate',
      rainfall: '900-1,200mm annually',
      temperature: '10-26°C year-round',
      altitude: '1,800-3,000m above sea level',
      soilTypes: ['Volcanic soils (fertile)', 'Red clay loam', 'Black cotton soils'],
      bestCrops: ['Maize (bread basket)', 'Wheat', 'Barley', 'Irish potatoes', 'Pyrethrum', 'Dairy farming'],
      challenges: ['Frost in some areas', 'Maize diseases (MLN, FAW)', 'Post-harvest losses'],
      opportunities: ['Large-scale cereal production', 'Mechanized farming', 'Dairy value chain', 'Agro-processing']
    },
    'elgeyo-marakwet': {
      climate: 'Varied - from hot valley to cool highlands',
      rainfall: '900-1,800mm annually',
      temperature: '10-30°C depending on altitude',
      altitude: '1,000-3,300m above sea level',
      soilTypes: ['Volcanic soils', 'Sandy loam in valley', 'Red clay in highlands'],
      bestCrops: ['Maize', 'Wheat', 'Irish potatoes', 'Vegetables', 'Bananas', 'Mangoes in valleys'],
      challenges: ['Steep terrain', 'Soil erosion', 'Limited irrigation in lowlands'],
      opportunities: ['Diverse agro-ecological zones', 'Fruit farming in valleys', 'Dairy farming', 'Tourism']
    },
    'nandi': {
      climate: 'Highland tropical climate',
      rainfall: '1,200-1,800mm annually',
      temperature: '12-26°C year-round',
      altitude: '1,500-2,900m above sea level',
      soilTypes: ['Volcanic soils (very fertile)', 'Red clay', 'Humic soils'],
      bestCrops: ['Tea', 'Maize', 'Irish potatoes', 'Dairy farming', 'Vegetables'],
      challenges: ['Frost in high areas', 'Small land parcels', 'Market fluctuations'],
      opportunities: ['Tea production', 'Dairy farming', 'Athletics tourism', 'Horticulture']
    },
    'baringo': {
      climate: 'Semi-arid climate',
      rainfall: '600-1,000mm annually',
      temperature: '18-32°C year-round',
      altitude: '900-2,700m above sea level',
      soilTypes: ['Sandy soils', 'Rocky soils', 'Volcanic soils in highlands'],
      bestCrops: ['Sorghum', 'Millet', 'Green grams', 'Mangoes', 'Livestock (main)'],
      challenges: ['Frequent droughts', 'Insecurity', 'Human-wildlife conflict'],
      opportunities: ['Irrigation farming', 'Livestock production', 'Tourism', 'Aloe vera']
    },
    'laikipia': {
      climate: 'Semi-arid to highland climate',
      rainfall: '400-900mm annually',
      temperature: '12-28°C year-round',
      altitude: '1,500-2,800m above sea level',
      soilTypes: ['Volcanic soils', 'Sandy loam', 'Red clay'],
      bestCrops: ['Wheat', 'Barley', 'Maize', 'Irish potatoes', 'Horticulture', 'Livestock (main)'],
      challenges: ['Water scarcity', 'Human-wildlife conflict', 'Limited infrastructure'],
      opportunities: ['Large-scale wheat farming', 'Wildlife conservancies', 'Livestock ranching', 'Tourism']
    },
    'samburu': {
      climate: 'Arid to semi-arid climate',
      rainfall: '200-700mm annually',
      temperature: '20-34°C year-round',
      altitude: '700-2,688m above sea level',
      soilTypes: ['Sandy soils', 'Rocky soils', 'Shallow soils'],
      bestCrops: ['Sorghum', 'Millet', 'Cowpeas', 'Aloe vera', 'Livestock (camels, cattle, goats)'],
      challenges: ['Severe droughts', 'Water scarcity', 'Insecurity', 'Remote location'],
      opportunities: ['Camel farming', 'Tourism', 'Aloe vera', 'Gum and resin']
    },
    'trans-nzoia': {
      climate: 'Highland tropical climate',
      rainfall: '1,000-1,800mm annually',
      temperature: '10-28°C year-round',
      altitude: '1,800-3,300m above sea level',
      soilTypes: ['Volcanic soils (very fertile)', 'Red clay', 'Black cotton soils'],
      bestCrops: ['Maize (main)', 'Wheat', 'Sunflower', 'Beans', 'Dairy farming', 'Poultry'],
      challenges: ['Maize diseases', 'Post-harvest losses', 'Land subdivision'],
      opportunities: ['Large-scale maize production', 'Dairy farming', 'Poultry', 'Agro-processing']
    },
    'west-pokot': {
      climate: 'Semi-arid to highland climate',
      rainfall: '700-1,400mm annually',
      temperature: '14-32°C depending on altitude',
      altitude: '900-3,500m above sea level',
      soilTypes: ['Sandy soils', 'Volcanic soils in highlands', 'Rocky soils'],
      bestCrops: ['Maize', 'Sorghum', 'Millet', 'Irish potatoes in highlands', 'Livestock (main)'],
      challenges: ['Insecurity', 'Poor infrastructure', 'Droughts in lowlands'],
      opportunities: ['Irrigation farming', 'Livestock production', 'Mining', 'Tourism']
    },
    'turkana': {
      climate: 'Arid to semi-arid climate',
      rainfall: '120-500mm annually (very erratic)',
      temperature: '24-38°C year-round (very hot)',
      altitude: '360-2,700m above sea level',
      soilTypes: ['Sandy soils', 'Rocky soils', 'Alluvial soils near rivers'],
      bestCrops: ['Sorghum', 'Millet', 'Cassava (drought-tolerant varieties)', 'Cowpeas', 'Aloe vera', 'Pastoralism (main)'],
      challenges: ['Severe droughts', 'Extreme water scarcity', 'Poor infrastructure', 'Insecurity'],
      opportunities: ['Irrigation farming along rivers', 'Drought-resistant crops', 'Camel farming', 'Gum and resin production', 'Oil exploration']
    },

    // WESTERN REGION
    'kakamega': {
      climate: 'Tropical humid climate',
      rainfall: '1,800-2,000mm annually',
      temperature: '14-30°C year-round',
      altitude: '1,200-2,000m above sea level',
      soilTypes: ['Red clay', 'Volcanic soils', 'Humic soils'],
      bestCrops: ['Sugarcane', 'Maize', 'Beans', 'Tea', 'Bananas', 'Sweet potatoes'],
      challenges: ['High rainfall causing leaching', 'Small land parcels', 'Soil erosion'],
      opportunities: ['Sugarcane farming', 'Tea production', 'Dairy farming', 'Gold panning']
    },
    'vihiga': {
      climate: 'Tropical highland climate',
      rainfall: '1,800-2,200mm annually',
      temperature: '14-28°C year-round',
      altitude: '1,300-1,900m above sea level',
      soilTypes: ['Red clay', 'Volcanic soils', 'Humic soils'],
      bestCrops: ['Tea', 'Bananas', 'Maize', 'Beans', 'Sweet potatoes', 'Vegetables'],
      challenges: ['High population density', 'Very small land parcels', 'Soil erosion'],
      opportunities: ['Tea farming', 'Intensive horticulture', 'Dairy goats', 'Chicken farming']
    },
    'bungoma': {
      climate: 'Tropical humid climate',
      rainfall: '1,500-2,000mm annually',
      temperature: '14-30°C year-round',
      altitude: '1,200-4,321m (includes Mt. Elgon)',
      soilTypes: ['Volcanic soils', 'Red clay', 'Humic soils'],
      bestCrops: ['Maize', 'Sugarcane', 'Beans', 'Coffee', 'Bananas', 'Sunflower'],
      challenges: ['Soil erosion', 'Market fluctuations', 'Limited mechanization'],
      opportunities: ['Maize production', 'Sugarcane farming', 'Coffee revival', 'Mt. Elgon tourism']
    },
    'busia': {
      climate: 'Tropical humid climate',
      rainfall: '1,200-1,800mm annually',
      temperature: '18-32°C year-round',
      altitude: '1,130-1,375m above sea level',
      soilTypes: ['Alluvial soils', 'Black cotton soils', 'Red clay'],
      bestCrops: ['Maize', 'Sorghum', 'Millet', 'Sweet potatoes', 'Cassava', 'Rice', 'Fish farming'],
      challenges: ['Waterlogging', 'Limited irrigation', 'Cross-border pest invasions'],
      opportunities: ['Rice farming', 'Fish farming (Lake Victoria)', 'Cross-border trade', 'Sugarcane']
    }
  };

  const insight = countyDatabase[selectedCounty.toLowerCase().replace(/\s+/g, '-')];
  
  if (!insight) {
    setCountyInsights({
      county: selectedCounty,
      message: 'Detailed data not yet available for this county. General Kenya insights apply.'
    });
    return;
  }

  setCountyInsights({
    county: selectedCounty,
    ...insight
  });
};

  const NavBar = () => (
  <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="py-3">
        {/* Logo and Right Actions */}
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
          >
            <img 
              src="/images/logo.png" 
              alt="EarthReGen Logo" 
              className="w-10 h-10 object-contain rounded-lg"
            />
            <span className="text-xl font-bold text-white">
              <span className="text-green-400">Earth</span>ReGen
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setCurrentPage('about')}
              className="text-gray-300 hover:text-white text-sm flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              About
            </button>
            <button 
              onClick={() => setCurrentPage('signin')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Sign In
            </button>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-gray-300 hover:text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Navigation Items - Wrappable */}
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  currentPage === item.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden py-4 border-t border-gray-800">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                  currentPage === item.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </button>
            );
          })}
          <button
            onClick={() => {
              setCurrentPage('about');
              setIsMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-gray-800"
          >
            <Info className="w-5 h-5" />
            About
          </button>
          <button
            onClick={() => {
              setCurrentPage('signin');
              setIsMenuOpen(false);
            }}
            className="w-full mt-2 mx-4 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition"
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  </nav>
);
  
  const HomePage = () => (
    <div className="bg-gradient-to-b from-gray-900 via-green-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Dead Soil. 
              <span className="text-blue-400">Smart Solutions.</span>
              <span className="text-green-400">Living Earth.</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              AI-powered regeneration for a planet that refuses to give up. 
Monitor. Analyze. Restore. Repeat
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition"
              >
                Get Started →
              </button>
              <button
                onClick={() => setCurrentPage('map')}
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition"
              >
                Explore Map
              </button>
            </div>
          </div>
          <div className="relative">
            <img
              src="images/EarthReGen.png"
              alt="Land regeneration"
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur p-8 rounded-xl text-center">
            <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <div className="text-5xl font-bold text-green-400 mb-2">120K+</div>
            <div className="text-gray-300">Under Watch</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur p-8 rounded-xl text-center">
            <Sprout className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <div className="text-5xl font-bold text-green-400 mb-2">2.8M+</div>
            <div className="text-gray-300">Seedlings Mapped</div>
          </div>
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur p-8 rounded-xl text-center">
            <Activity className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <div className="text-5xl font-bold text-green-400 mb-2">Real-Time</div>
            <div className="text-gray-300">Climate Analytics</div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Complete Ecosystem Intelligence Platform</h2>
          <p className="text-xl text-gray-300">Advanced tools combining space technology with ground-level precision</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition">
            <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <FlaskConical className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Smart Soil Diagnostics</h3>
            <p className="text-gray-300 mb-4">Drop an image, get instant nutrient breakdown. Our AI reads pH levels, detects deficiencies, and prescribes remedies in seconds.</p>
             <button
              onClick={() => setCurrentPage('soil-analyzer')}
              className="text-green-400 hover:text-green-300 font-medium"
            >
              Try analyzer →
            </button>
          </div>

          <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Live Degradation Alerts</h3>
            <p className="text-gray-300 mb-4">Satellites scan your land every few days. Get pinged when vegetation drops, erosion spikes, or rainfall shifts unexpectedly.</p>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="text-green-400 hover:text-green-300 font-medium"
            >
              View dashboard →
            </button>
          </div>

          <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Custom Restoration Roadmaps</h3>
            <p className="text-gray-300 mb-4">Tell us your soil type, location, and goals. We generate step-by-step recovery plans with species that actually thrive in your climate.</p>
            <button
              onClick={() => setCurrentPage('assessment')}
              className="text-green-400 hover:text-green-300 font-medium"
            >
              Build your plan →
            </button>
          </div>


          <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition">
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Sprout className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Reforestation Planning</h3>
            <p className="text-gray-300 mb-4">AI-driven restoration plans with native species recommendations and planting zone identification.</p>
            <button
              onClick={() => setCurrentPage('assessment')}
              className="text-green-400 hover:text-green-300 font-medium"
            >
              Learn more →
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Your Land's Revival Starts Now</h2>
          <p className="text-xl text-green-50 mb-8">Stop guessing. Start measuring. Transform barren acres into carbon-capturing ecosystems with data you can trust.</p>
           <button
            onClick={() => setCurrentPage('dashboard')}
            className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 rounded-lg font-bold text-lg transition"
          >
            Launch Your First Scan →
          </button>
        </div>
      </div>
    </div>
  );

  const DashboardPage = () => (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Land Monitoring Dashboard</h1>
          <p className="text-gray-400">Real-time environmental data and regeneration insights</p>
        </div>

        <div className="bg-yellow-900 bg-opacity-20 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-400" size={24} />
            <div>
              <p className="font-semibold text-yellow-300">{alerts.length} Active Alerts</p>
              <p className="text-yellow-200 text-sm">Review environmental changes</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <Leaf className="text-green-400" size={28} />
              <TrendingUp className="text-green-400" size={20} />
            </div>
            <p className="text-gray-400 text-sm">NDVI Index</p>
            <p className="text-3xl font-bold text-white">0.78</p>
            <p className="text-green-400 text-sm mt-1">Healthy vegetation</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <Droplets className="text-blue-400" size={28} />
              <TrendingUp className="text-blue-400" size={20} />
            </div>
            <p className="text-gray-400 text-sm">Soil Moisture</p>
            <p className="text-3xl font-bold text-white">35mm</p>
            <p className="text-blue-400 text-sm mt-1">Adequate levels</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <Wind className="text-orange-400" size={28} />
              <TrendingDown className="text-orange-400" size={20} />
            </div>
            <p className="text-gray-400 text-sm">Erosion Risk</p>
            <p className="text-3xl font-bold text-white">Low</p>
            <p className="text-orange-400 text-sm mt-1">Monitor conditions</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <Sprout className="text-purple-400" size={28} />
              <TrendingUp className="text-purple-400" size={20} />
            </div>
            <p className="text-gray-400 text-sm">Reforestation</p>
            <p className="text-3xl font-bold text-white">42%</p>
            <p className="text-purple-400 text-sm mt-1">On track</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-6">Vegetation Health Trend (NDVI)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ndviData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis domain={[0, 1]} stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} name="NDVI" />
                <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeDasharray="5 5" name="Critical Threshold" />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-400 mt-2">
              NDVI values above 0.5 indicate healthy vegetation
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-6">Regional Comparison</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                <Legend />
                <Bar dataKey="degradation" fill="#ef4444" name="Degradation %" />
                <Bar dataKey="vegetation" fill="#10b981" name="Vegetation Cover %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-4">Soil Health Metrics</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-lg border-2 bg-green-900 bg-opacity-20 text-green-300 border-green-700">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Organic Matter</span>
                  <span className="text-2xl font-bold">3.2%</span>
                </div>
              </div>
              <div className="p-4 rounded-lg border-2 bg-green-900 bg-opacity-20 text-green-300 border-green-700">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">pH Level</span>
                  <span className="text-2xl font-bold">6.5</span>
                </div>
              </div>
              <div className="p-4 rounded-lg border-2 bg-yellow-900 bg-opacity-20 text-yellow-300 border-yellow-700">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Moisture</span>
                  <span className="text-2xl font-bold">22%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-4">Active Alerts</h3>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="border-l-4 border-gray-600 p-4 rounded-r-lg bg-gray-700">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.severity === 'high' ? 'bg-red-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{alert.message}</p>
                      <p className="text-sm text-gray-400 mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4">
          <p className="text-sm text-blue-200">
            <strong>💡 Integration Ready:</strong> Connect Sentinel-2 API for real satellite data, 
            Supabase for data storage, and Claude API for AI predictions.
          </p>
        </div>
      </div>
    </div>
  );

  const SoilAnalyzerPage = () => (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Soil Health Analyzer</h1>
          <p className="text-gray-400">Upload soil images for instant AI-powered health assessment</p>
        </div>

        <div className="bg-gray-800 p-8 rounded-xl mb-8">
  <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center hover:border-green-500 transition">
    <Upload className="w-16 h-16 text-green-500 mx-auto mb-4" />
    <h3 className="text-2xl font-bold text-white mb-2">Drop your soil image here</h3>
    <p className="text-gray-400 mb-4">or click to browse your files</p>
    <p className="text-sm text-gray-500 mb-4">JPG, PNG, WebP</p>
    <button 
      onClick={() => setShowUploadOptions(true)}
      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
    >
      Select File
    </button>
  </div>

  {/* Upload Options Modal */}
  {showUploadOptions && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Choose Upload Method</h3>
          <button 
            onClick={() => setShowUploadOptions(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Gallery/Photos Option */}
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-center gap-4 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Photo Gallery</div>
                <div className="text-sm text-gray-400">Choose from your photos</div>
              </div>
            </div>
          </label>

          {/* Camera Option */}
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
            <div className="flex items-center gap-4 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Take Photo</div>
                <div className="text-sm text-gray-400">Use your camera</div>
              </div>
            </div>
          </label>

          {/* File Browser Option */}
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-center gap-4 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Browse Files</div>
                <div className="text-sm text-gray-400">Select from computer</div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  )}
</div>

        {selectedFile && analyzingImage && (
          <div className="bg-gray-800 p-8 rounded-xl text-center">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-white text-lg font-semibold mb-2">AI is analyzing your soil sample...</p>
            <p className="text-gray-400 text-sm">Using advanced computer vision to detect soil features</p>
          </div>
        )}

        {soilAnalysis && !analyzingImage && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-900 to-emerald-900 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-white mb-4">Soil Health Score</h3>
              <div className="flex items-center gap-6">
                <div className="text-6xl font-bold text-green-400">{soilAnalysis.healthScore}</div>
                <div>
                  <div className="text-2xl font-semibold text-white">Good</div>
                  <div className="text-gray-300">Current condition</div>
                </div>
              </div>
              <div className="mt-4 bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                  style={{ width: `${soilAnalysis.healthScore}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-white mb-6">Detailed Analysis</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Nitrogen (N)</div>
                  <div className="text-xl font-bold text-white">{soilAnalysis.nitrogen}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Phosphorus (P)</div>
                  <div className="text-xl font-bold text-white">{soilAnalysis.phosphorus}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Potassium (K)</div>
                  <div className="text-xl font-bold text-white">{soilAnalysis.potassium}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">pH Level</div>
                  <div className="text-xl font-bold text-white">{soilAnalysis.ph}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Organic Matter</div>
                  <div className="text-xl font-bold text-white">{soilAnalysis.organicMatter}</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Moisture</div>
                  <div className="text-xl font-bold text-white">{soilAnalysis.moisture}</div>
                </div>
              </div>

              {soilAnalysis.soilTexture && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Soil Texture</div>
                    <div className="text-xl font-bold text-white">{soilAnalysis.soilTexture}</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Erosion Risk</div>
                    <div className={`text-xl font-bold ${
                      soilAnalysis.erosionRisk === 'Low' ? 'text-green-400' :
                      soilAnalysis.erosionRisk === 'Moderate' ? 'text-yellow-400' : 'text-red-400'
                    }`}>{soilAnalysis.erosionRisk}</div>
                  </div>
                </div>
              )}
            </div>

            {soilAnalysis.aiDetectedFeatures && (
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-8 rounded-xl">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <FlaskConical className="w-6 h-6" />
                  AI Vision Analysis
                </h3>
                <p className="text-gray-300 mb-4 text-sm">Our computer vision AI detected the following features in your soil sample:</p>
                <div className="space-y-2">
                  {soilAnalysis.aiDetectedFeatures.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                      <Activity className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-200">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-800 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-white mb-6">AI Recommendations</h3>
              <div className="space-y-3">
                {soilAnalysis.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-700 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                    <p className="text-gray-200">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const AssessmentPage = () => (
    <div className="bg-gradient-to-br from-gray-900 to-green-900 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Land Assessment & Planning</h1>
          <p className="text-gray-300">AI-Powered Reforestation & Soil Health Assessment</p>
        </div>

        {!assessmentResults ? (
          <div className="bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Assess Your Land</h2>
            
            <div className="space-y-6">
              <div>
  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
    <MapPin className="w-4 h-4" />
    Location (Select County)
  </label>
  <select
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
  >
    <option value="">Select your county</option>
    
    <optgroup label="Central Region">
      <option value="Nairobi">Nairobi</option>
      <option value="Kiambu">Kiambu</option>
      <option value="Muranga">Murang'a</option>
      <option value="Nyeri">Nyeri</option>
      <option value="Nyandarua">Nyandarua</option>
      <option value="Kirinyaga">Kirinyaga</option>
    </optgroup>
    
    <optgroup label="Coast Region">
      <option value="Mombasa">Mombasa</option>
      <option value="Kwale">Kwale</option>
      <option value="Kilifi">Kilifi</option>
      <option value="Tana River">Tana River</option>
      <option value="Lamu">Lamu</option>
      <option value="Taita Taveta">Taita Taveta</option>
    </optgroup>
    
    <optgroup label="Eastern Region">
      <option value="Machakos">Machakos</option>
      <option value="Makueni">Makueni</option>
      <option value="Kitui">Kitui</option>
      <option value="Embu">Embu</option>
      <option value="Tharaka Nithi">Tharaka Nithi</option>
      <option value="Meru">Meru</option>
      <option value="Isiolo">Isiolo</option>
      <option value="Marsabit">Marsabit</option>
    </optgroup>
    
    <optgroup label="North Eastern Region">
      <option value="Garissa">Garissa</option>
      <option value="Wajir">Wajir</option>
      <option value="Mandera">Mandera</option>
    </optgroup>
    
    <optgroup label="Nyanza Region">
      <option value="Kisumu">Kisumu</option>
      <option value="Siaya">Siaya</option>
      <option value="Homa Bay">Homa Bay</option>
      <option value="Migori">Migori</option>
      <option value="Kisii">Kisii</option>
      <option value="Nyamira">Nyamira</option>
    </optgroup>
    
    <optgroup label="Rift Valley Region">
      <option value="Nakuru">Nakuru</option>
      <option value="Narok">Narok</option>
      <option value="Kajiado">Kajiado</option>
      <option value="Kericho">Kericho</option>
      <option value="Bomet">Bomet</option>
      <option value="Uasin Gishu">Uasin Gishu</option>
      <option value="Elgeyo Marakwet">Elgeyo Marakwet</option>
      <option value="Nandi">Nandi</option>
      <option value="Baringo">Baringo</option>
      <option value="Laikipia">Laikipia</option>
      <option value="Samburu">Samburu</option>
      <option value="Trans Nzoia">Trans Nzoia</option>
      <option value="West Pokot">West Pokot</option>
      <option value="Turkana">Turkana</option>
    </optgroup>
    
    <optgroup label="Western Region">
      <option value="Kakamega">Kakamega</option>
      <option value="Vihiga">Vihiga</option>
      <option value="Bungoma">Bungoma</option>
      <option value="Busia">Busia</option>
    </optgroup>
  </select>
  <p className="text-xs text-gray-400 mt-1">All 47 counties with region-specific recommendations</p>
</div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Land Size (hectares)
                </label>
                <input
                  type="number"
                  value={landSize}
                  onChange={(e) => setLandSize(e.target.value)}
                  placeholder="e.g., 5"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <Leaf className="w-4 h-4" />
                  Soil Type
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select soil type</option>
                  <option value="loam">Loam (ideal)</option>
                  <option value="clay">Clay (heavy)</option>
                  <option value="sandy">Sandy (light)</option>
                  <option value="rocky">Rocky/Poor</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Degradation Level
                </label>
                <select
                  value={degradationLevel}
                  onChange={(e) => setDegradationLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select degradation level</option>
                  <option value="low">Low - Healthy land</option>
                  <option value="medium">Medium - Some erosion/nutrient loss</option>
                  <option value="severe">Severe - Significant degradation</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <Droplets className="w-4 h-4" />
                  Water Access
                </label>
                <select
                  value={waterAccess}
                  onChange={(e) => setWaterAccess(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select water access</option>
                  <option value="good">Good - River/well/rainfall</option>
                  <option value="moderate">Moderate - Seasonal water</option>
                  <option value="limited">Limited - Dry conditions</option>
                </select>
              </div>

              <button
                onClick={analyzeAndPlan}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Generate ReGen Plan
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-900 to-emerald-900 p-8 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-3">Soil Health Score</h3>
              <div className="flex items-center gap-4">
                <div className={`text-5xl font-bold ${getSoilHealthColor(assessmentResults.soilHealthScore)}`}>
                  {assessmentResults.soilHealthScore}
                </div>
                <div>
                  <div className="text-2xl font-semibold text-white">
                    {getSoilHealthStatus(assessmentResults.soilHealthScore)}
                  </div>
                  <div className="text-sm text-gray-300">Current condition</div>
                </div>
              </div>
              <div className="mt-4 bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                  style={{ width: `${assessmentResults.soilHealthScore}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-400" />
                Recommended Trees for {location}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {assessmentResults.treeRecommendations.map((tree, index) => (
                  <div
                    key={index}
                    className="p-4 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg text-center font-semibold text-green-200"
                  >
                    {tree}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Action Plan
              </h3>
              <div className="space-y-3">
                {assessmentResults.actionPlan.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-200 pt-1">{action}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-blue-900 bg-opacity-30 border-2 border-blue-700 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Sun className="w-5 h-5 text-blue-400" />
                Timeline
              </h3>
              <p className="text-gray-200 text-lg">{assessmentResults.timeline}</p>
            </div>

            <button
              onClick={() => setAssessmentResults(null)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Assess Another Site
            </button>
          </div>
        )}
      </div>
    </div>
  );


const MapPage = () => {
  const [mapLocation, setMapLocation] = useState('');
  const [mapCenter, setMapCenter] = useState([-1.2921, 36.8219]); // Nairobi
  const [mapZoom, setMapZoom] = useState(7);
  const [selectedLayer, setSelectedLayer] = useState('satellite');
  const [markers, setMarkers] = useState([
    { id: 1, position: [-1.2921, 36.8219], name: 'Nairobi Central', health: 'Good', ndvi: 0.72, color: '#10b981' },
    { id: 2, position: [-1.0832, 37.0684], name: 'Machakos Region', health: 'Moderate', ndvi: 0.58, color: '#eab308' },
    { id: 3, position: [-0.0917, 34.7680], name: 'Kisumu Area', health: 'Good', ndvi: 0.75, color: '#10b981' },
    { id: 4, position: [-0.4031, 37.4537], name: 'Meru District', health: 'Excellent', ndvi: 0.82, color: '#22c55e' },
  ]);

  const tileLayers = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      name: '🛰️ Satellite View'
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      name: '⛰️ Terrain Map'
    },
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      name: '🗺️ Street Map'
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      name: '🌙 Dark Mode'
    }
  };

  const handleSearch = async () => {
    if (!mapLocation.trim()) {
      alert('Please enter a location');
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(mapLocation)},Kenya&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapCenter([lat, lon]);
        setMapZoom(12);
        
        // Add new marker
        setMarkers([...markers, {
          id: Date.now(),
          position: [lat, lon],
          name: data[0].display_name,
          health: 'Analyzing...',
          ndvi: 'N/A',
          color: '#3b82f6'
        }]);
      } else {
        alert('Location not found in Kenya');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to search location');
    }
  };

  // Create custom marker icon
  const createCustomIcon = (color) => {
    if (typeof window !== 'undefined' && window.L) {
      return new window.L.Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="3"/>
          </svg>
        `)}`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });
    }
    return null;
  };

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Interactive Land Map</h1>
          <p className="text-gray-400">Live satellite-powered visualization of Kenya</p>
        </div>

        {/* Search Bar */}
        <div className="bg-gray-800 p-6 rounded-xl mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-400" />
            Search Any Location in Kenya
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={mapLocation}
              onChange={(e) => setMapLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Try: Nairobi, Machakos, Kisumu, Mombasa..."
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleSearch}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition"
            >
              Search
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map Layers Sidebar */}
          <div className="bg-gray-800 p-6 rounded-xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Map Layers
              </h3>

              <div className="space-y-2">
                {Object.entries(tileLayers).map(([key, layer]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedLayer(key)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                      selectedLayer === key
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {layer.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-900 to-emerald-900 rounded-lg">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Live Satellite Data
              </h4>
              <p className="text-xs text-green-100">
                Free high-resolution satellite imagery, updated regularly
              </p>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="text-sm font-bold text-white mb-3">Vegetation Health Legend</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full" />
                    <span className="text-gray-300">Excellent</span>
                  </div>
                  <span className="text-gray-400">NDVI &gt; 0.8</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full" />
                    <span className="text-gray-300">Good</span>
                  </div>
                  <span className="text-gray-400">0.7 - 0.8</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                    <span className="text-gray-300">Moderate</span>
                  </div>
                  <span className="text-gray-400">0.5 - 0.7</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full" />
                    <span className="text-gray-300">Poor</span>
                  </div>
                  <span className="text-gray-400">&lt; 0.5</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => {
                  setMapCenter([-1.2921, 36.8219]);
                  setMapZoom(7);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Reset to Kenya View
              </button>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="text-sm font-bold text-white mb-2">Active Monitoring Sites</div>
              <div className="text-3xl font-bold text-green-400">{markers.length}</div>
              <div className="text-xs text-gray-400 mt-1">locations tracked</div>
            </div>
          </div>

          {/* Map Container */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl" style={{ height: '700px' }}>
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url={tileLayers[selectedLayer].url}
                  attribution='&copy; OpenStreetMap contributors'
                />

                {markers.map((marker) => (
                  <Marker 
                    key={marker.id} 
                    position={marker.position}
                    icon={createCustomIcon(marker.color)}
                  >
                    <Popup>
                      <div style={{ padding: '8px', minWidth: '200px' }}>
                        <h3 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>
                          📍 {marker.name}
                        </h3>
                        <div style={{ fontSize: '14px' }}>
                          <p><strong>Health Status:</strong> <span style={{ color: marker.color, fontWeight: 'bold' }}>{marker.health}</span></p>
                          <p><strong>NDVI Score:</strong> {marker.ndvi}</p>
                          <button 
                            style={{
                              marginTop: '8px',
                              width: '100%',
                              backgroundColor: '#10b981',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            📊 View Full Analysis
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Map Info */}
            <div className="mt-4 bg-gray-800 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-300">
                <strong className="text-white">💡 Map Controls:</strong> Click & drag to pan • Scroll/pinch to zoom • 
                Click colored markers for site details • Search any location in Kenya to add monitoring points
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">
                  {markers.filter(m => m.health === 'Good' || m.health === 'Excellent').length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Healthy Sites</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {markers.filter(m => m.health === 'Moderate').length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Moderate Sites</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-400">
                  {markers.filter(m => m.health === 'Poor' || m.health === 'Analyzing...').length}
                </div>
                <div className="text-xs text-gray-400 mt-1">At-Risk Sites</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


  const CarbonTrackerPage = () => {
    const [carbonArea, setCarbonArea] = useState('');
    const [vegetationType, setVegetationType] = useState('');
    const [carbonResults, setCarbonResults] = useState(null);

    const calculateCarbon = () => {
      if (!carbonArea || !vegetationType) {
        alert('Please fill in both fields to calculate carbon credits');
        return;
      }

      const area = parseFloat(carbonArea);
      
      // Carbon sequestration rates (tons CO2/hectare/year)
      const rates = {
        'native-forest': { min: 3, max: 5, rate: 4 },
        'grassland': { min: 1, max: 2, rate: 1.5 },
        'agroforestry': { min: 2, max: 4, rate: 3 }
      };

      const selectedRate = rates[vegetationType];
      const annualSequestration = area * selectedRate.rate;
      const tenYearSequestration = annualSequestration * 10;
      
      // Carbon credit pricing ($15-40 per ton, using $25 average)
      const pricePerTon = 25;
      const annualValue = annualSequestration * pricePerTon;
      const tenYearValue = tenYearSequestration * pricePerTon;

      setCarbonResults({
        area,
        vegetationType,
        annualSequestration: annualSequestration.toFixed(2),
        tenYearSequestration: tenYearSequestration.toFixed(2),
        annualValue: annualValue.toFixed(2),
        tenYearValue: tenYearValue.toFixed(2),
        sequestrationRate: selectedRate.rate
      });
    };

    return (
      <div className="bg-gray-900 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Carbon Sequestration Tracker</h1>
            <p className="text-gray-400">Track carbon capture and generate environmental credits</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-green-500">
              <Leaf className="w-8 h-8 text-green-400 mb-3" />
              <div className="text-sm text-gray-400 mb-1">Annual Carbon Capture</div>
              <div className="text-3xl font-bold text-white">
                {carbonResults ? carbonResults.annualSequestration : '0.00'} tons
              </div>
              <div className="text-xs text-gray-500 mt-1">CO₂ equivalent per year</div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-blue-500">
              <DollarSign className="w-8 h-8 text-blue-400 mb-3" />
              <div className="text-sm text-gray-400 mb-1">Annual Credit Value</div>
              <div className="text-3xl font-bold text-white">
                ${carbonResults ? carbonResults.annualValue : '0.00'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Market value per year</div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-purple-500">
              <CheckCircle className="w-8 h-8 text-purple-400 mb-3" />
              <div className="text-sm text-gray-400 mb-1">10-Year Potential</div>
              <div className="text-3xl font-bold text-white">
                {carbonResults ? carbonResults.tenYearSequestration : '0.00'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Tons CO₂</div>
            </div>
          </div>

          <div className="bg-gray-800 p-8 rounded-xl mb-6">
            <h3 className="text-2xl font-bold text-white mb-6">Calculate Carbon Credits</h3>
            <p className="text-gray-400 mb-6">Estimate carbon sequestration based on vegetation improvements</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Land Area (hectares)
                </label>
                <input
                  type="number"
                  value={carbonArea}
                  onChange={(e) => setCarbonArea(e.target.value)}
                  placeholder="Enter area (e.g., 5)"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Vegetation Type
                </label>
                <select 
                  value={vegetationType}
                  onChange={(e) => setVegetationType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select type</option>
                  <option value="native-forest">Native forest (4 tons CO₂/ha/year)</option>
                  <option value="grassland">Grassland restoration (1.5 tons CO₂/ha/year)</option>
                  <option value="agroforestry">Agroforestry (3 tons CO₂/ha/year)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={calculateCarbon}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition"
            >
              Calculate Potential Credits
            </button>
          </div>

          {carbonResults && (
            <div className="bg-gradient-to-r from-green-900 to-emerald-900 p-8 rounded-xl mb-6">
              <h3 className="text-2xl font-bold text-white mb-6">Your Carbon Credit Potential</h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg">
                  <div className="text-sm text-gray-300 mb-2">Project Area</div>
                  <div className="text-3xl font-bold text-white mb-1">{carbonResults.area} ha</div>
                  <div className="text-sm text-green-400">
                    Rate: {carbonResults.sequestrationRate} tons CO₂/ha/year
                  </div>
                </div>

                <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg">
                  <div className="text-sm text-gray-300 mb-2">10-Year Revenue Potential</div>
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    ${carbonResults.tenYearValue}
                  </div>
                  <div className="text-sm text-gray-300">
                    At $25 per ton CO₂
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                <p className="text-sm text-gray-300">
                  <strong className="text-white">Note:</strong> These estimates are based on average sequestration rates. 
                  Actual carbon capture varies by climate, soil conditions, tree species, and management practices. 
                  Credits must be verified by accredited programs like Verra or Gold Standard.
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              What Are Carbon Credits?
            </h3>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              <strong className="text-white">Carbon credits</strong> are tradeable certificates representing the removal or reduction 
              of one ton of carbon dioxide (CO₂) from the atmosphere. When you restore degraded land, plant trees, or improve 
              soil health, your project captures carbon that would otherwise contribute to climate change.
            </p>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              Through verified carbon credit programs, landowners can earn income by selling these credits to companies 
              and organizations working to offset their emissions. Each credit proves that your land restoration efforts 
              have measurably reduced atmospheric CO₂.
            </p>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              <strong className="text-white">How it works:</strong> Your project is monitored and verified by third-party 
              organizations. Once certified, you receive carbon credits that can be sold on voluntary or compliance carbon markets, 
              creating a sustainable revenue stream while fighting climate change.
            </p>
            <a
              href="https://www.conservation.org/carbon-credits"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              <Info className="w-4 h-4" />
              Learn More About Carbon Credits
            </a>
          </div>
        </div>
      </div>
    );
  };

  const WeatherPage = () => {
    const [weatherLocation, setWeatherLocation] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Using Open-Meteo API - No API key required!
    const fetchWeather = async () => {
      if (!weatherLocation.trim()) {
        alert('Please enter a location');
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // First, get coordinates from location name using geocoding
        const geoResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(weatherLocation)}&count=1&language=en&format=json`
        );
        
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
          throw new Error('Location not found. Please try another location or be more specific.');
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // Fetch weather data using coordinates
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean&timezone=auto&forecast_days=7`
        );

        const weatherApiData = await weatherResponse.json();

        // Weather code to condition mapping
        const getConditionFromCode = (code) => {
          if (code === 0) return 'Clear';
          if (code <= 3) return 'Cloudy';
          if (code <= 48) return 'Fog';
          if (code <= 67) return 'Rain';
          if (code <= 77) return 'Snow';
          if (code <= 82) return 'Rain';
          if (code <= 86) return 'Snow';
          if (code >= 95) return 'Thunderstorm';
          return 'Clear';
        };

        // Process current weather
        const current = weatherApiData.current;
        const currentCondition = getConditionFromCode(current.weather_code);

        // Process daily forecast
        const daily = weatherApiData.daily;
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        const forecast = daily.time.map((date, index) => {
          const dateObj = new Date(date);
          const dayName = daysOfWeek[dateObj.getDay()];
          const condition = getConditionFromCode(daily.weather_code[index]);
          
          return {
            day: dayName,
            temp: Math.round(daily.temperature_2m_max[index]),
            condition: condition,
            rain: daily.precipitation_sum[index],
            humidity: Math.round(daily.relative_humidity_2m_mean[index])
          };
        });

        const processedWeather = {
          location: `${name}, ${country}`,
          current: {
            temp: Math.round(current.temperature_2m),
            condition: currentCondition,
            description: currentCondition.toLowerCase(),
            humidity: current.relative_humidity_2m,
            windSpeed: Math.round(current.wind_speed_10m),
            rainfall: current.precipitation
          },
          forecast: forecast
        };

        setWeatherData(processedWeather);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const getWeatherIcon = (condition) => {
      const conditionLower = condition.toLowerCase();
      if (conditionLower.includes('clear') || conditionLower.includes('sun')) return '☀️';
      if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return '🌧️';
      if (conditionLower.includes('cloud')) return '☁️';
      if (conditionLower.includes('snow')) return '❄️';
      if (conditionLower.includes('thunder')) return '⛈️';
      if (conditionLower.includes('fog') || conditionLower.includes('mist')) return '🌫️';
      return '🌤️';
    };

    const getIrrigationRecommendation = () => {
      if (!weatherData || !weatherData.forecast.length) return null;

      const totalRainfall = weatherData.forecast.reduce((sum, day) => sum + day.rain, 0);
      const avgTemp = weatherData.forecast.reduce((sum, day) => sum + day.temp, 0) / weatherData.forecast.length;
      const avgHumidity = weatherData.forecast.reduce((sum, day) => sum + day.humidity, 0) / weatherData.forecast.length;

      let recommendation = '';
      let priority = '';
      let waterAmount = '';

      if (totalRainfall > 50) {
        recommendation = 'Heavy rainfall expected. Reduce or pause irrigation to prevent waterlogging.';
        priority = 'low';
        waterAmount = 'Minimal to none';
      } else if (totalRainfall > 20) {
        recommendation = 'Moderate rainfall expected. Supplement with light irrigation only if needed.';
        priority = 'medium';
        waterAmount = '10-15mm per week';
      } else if (totalRainfall < 10 && avgTemp > 26) {
        recommendation = 'Hot and dry conditions. Increase irrigation frequency to prevent stress.';
        priority = 'high';
        waterAmount = '25-30mm per week';
      } else {
        recommendation = 'Normal irrigation schedule. Monitor soil moisture regularly.';
        priority = 'medium';
        waterAmount = '20-25mm per week';
      }

      return { recommendation, priority, waterAmount, totalRainfall: totalRainfall.toFixed(1), avgTemp: avgTemp.toFixed(1), avgHumidity: avgHumidity.toFixed(0) };
    };

    const irrigation = weatherData ? getIrrigationRecommendation() : null;

    return (
      <div className="bg-gray-900 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Weather Forecast</h1>
            <p className="text-gray-400">7-day forecast with agricultural recommendations</p>
          </div>

          <div className="bg-gray-800 p-8 rounded-xl mb-8">
            <div className="text-center mb-6">
              <Cloud className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Enter location to fetch real-time weather data</p>
              <p className="text-green-400 text-sm">✓ Powered by Open-Meteo </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={weatherLocation}
                  onChange={(e) => setWeatherLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
                  placeholder="Enter location (e.g., Nairobi, Kenya)"
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                />
                <button 
                  onClick={fetchWeather}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition"
                >
                  {loading ? 'Loading...' : 'Fetch'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-20 border-l-4 border-red-500 p-6 rounded-r-lg mb-8">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-400" size={24} />
                <div>
                  <p className="font-semibold text-red-300">Error</p>
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-gray-800 p-12 rounded-xl text-center">
              <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-white">Fetching weather data for {weatherLocation}...</p>
            </div>
          )}

          {weatherData && !loading && (
            <>
              <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-8 rounded-xl mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Current Weather - {weatherData.location}</h2>
                <div className="grid md:grid-cols-5 gap-6">
                  <div className="text-center">
                    <div className="text-5xl mb-2">{getWeatherIcon(weatherData.current.condition)}</div>
                    <div className="text-sm text-gray-300 capitalize">{weatherData.current.description}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{weatherData.current.temp}°C</div>
                    <div className="text-sm text-gray-300">Temperature</div>
                  </div>
                  <div className="text-center">
                    <Droplets className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{weatherData.current.humidity}%</div>
                    <div className="text-sm text-gray-300">Humidity</div>
                  </div>
                  <div className="text-center">
                    <Wind className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{weatherData.current.windSpeed} km/h</div>
                    <div className="text-sm text-gray-300">Wind Speed</div>
                  </div>
                  <div className="text-center">
                    <Cloud className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{weatherData.current.rainfall}mm</div>
                    <div className="text-sm text-gray-300">Rainfall</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-8 rounded-xl mb-8">
                <h3 className="text-2xl font-bold text-white mb-6">{weatherData.forecast.length}-Day Forecast</h3>
                <div className={`grid gap-3 ${weatherData.forecast.length === 7 ? 'grid-cols-7' : 'grid-cols-5'}`}>
                  {weatherData.forecast.map((day, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg text-center">
                      <div className="font-bold text-white mb-2">{day.day}</div>
                      <div className="text-3xl mb-2">{getWeatherIcon(day.condition)}</div>
                      <div className="text-xl font-bold text-white mb-1">{day.temp}°C</div>
                      <div className="text-sm text-gray-400 mb-2">{day.condition}</div>
                      <div className="flex items-center justify-center gap-1 text-xs text-blue-400">
                        <Droplets className="w-3 h-3" />
                        <span>{day.rain.toFixed(1)}mm</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {irrigation && (
                <div className={`p-8 rounded-xl border-l-4 ${
                  irrigation.priority === 'high' ? 'bg-red-900 bg-opacity-20 border-red-500' :
                  irrigation.priority === 'low' ? 'bg-blue-900 bg-opacity-20 border-blue-500' :
                  'bg-yellow-900 bg-opacity-20 border-yellow-500'
                }`}>
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Droplets className="w-6 h-6" />
                    Smart Irrigation Recommendations
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Total Rainfall ({weatherData.forecast.length} days)</div>
                      <div className="text-2xl font-bold text-white">{irrigation.totalRainfall}mm</div>
                    </div>
                    <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Avg Temperature</div>
                      <div className="text-2xl font-bold text-white">{irrigation.avgTemp}°C</div>
                    </div>
                    <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Recommended Water</div>
                      <div className="text-2xl font-bold text-white">{irrigation.waterAmount}</div>
                    </div>
                  </div>

                  <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg">
                    <p className="text-lg text-white font-semibold mb-2">
                      {irrigation.recommendation}
                    </p>
                    <p className="text-sm text-gray-300">
                      💡 <strong>Tip:</strong> Monitor soil moisture levels daily and adjust irrigation based on 
                      actual field conditions. Consider crop type and growth stage for optimal water management.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const KenyaInsightsPage = () => {
  const insights = generateKenyaInsights();

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Kenya Agricultural Insights</h1>
          <p className="text-gray-400">
            Region-specific insights for Kenyan counties and growing conditions
          </p>
        </div>

        {/* County Insights Section */}
        <div className="bg-gray-800 p-8 rounded-xl mb-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Select Your County
          </h3>

          <div className="mb-6">
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select county</option>
              
              <optgroup label="Central Region">
                <option value="nairobi">Nairobi</option>
                <option value="kiambu">Kiambu</option>
                <option value="muranga">Murang'a</option>
                <option value="nyeri">Nyeri</option>
                <option value="nyandarua">Nyandarua</option>
                <option value="kirinyaga">Kirinyaga</option>
              </optgroup>
              
              <optgroup label="Coast Region">
                <option value="mombasa">Mombasa</option>
                <option value="kwale">Kwale</option>
                <option value="kilifi">Kilifi</option>
                <option value="tana-river">Tana River</option>
                <option value="lamu">Lamu</option>
                <option value="taita-taveta">Taita Taveta</option>
              </optgroup>
              
              <optgroup label="Eastern Region">
                <option value="machakos">Machakos</option>
                <option value="makueni">Makueni</option>
                <option value="kitui">Kitui</option>
                <option value="embu">Embu</option>
                <option value="tharaka-nithi">Tharaka Nithi</option>
                <option value="meru">Meru</option>
                <option value="isiolo">Isiolo</option>
                <option value="marsabit">Marsabit</option>
              </optgroup>
              
              <optgroup label="North Eastern Region">
                <option value="garissa">Garissa</option>
                <option value="wajir">Wajir</option>
                <option value="mandera">Mandera</option>
              </optgroup>
              
              <optgroup label="Nyanza Region">
                <option value="kisumu">Kisumu</option>
                <option value="siaya">Siaya</option>
                <option value="homa-bay">Homa Bay</option>
                <option value="migori">Migori</option>
                <option value="kisii">Kisii</option>
                <option value="nyamira">Nyamira</option>
              </optgroup>
              
              <optgroup label="Rift Valley Region">
                <option value="nakuru">Nakuru</option>
                <option value="narok">Narok</option>
                <option value="kajiado">Kajiado</option>
                <option value="kericho">Kericho</option>
                <option value="bomet">Bomet</option>
                <option value="uasin-gishu">Uasin Gishu</option>
                <option value="elgeyo-marakwet">Elgeyo Marakwet</option>
                <option value="nandi">Nandi</option>
                <option value="baringo">Baringo</option>
                <option value="laikipia">Laikipia</option>
                <option value="samburu">Samburu</option>
                <option value="trans-nzoia">Trans Nzoia</option>
                <option value="west-pokot">West Pokot</option>
                <option value="turkana">Turkana</option>
              </optgroup>
              
              <optgroup label="Western Region">
                <option value="kakamega">Kakamega</option>
                <option value="vihiga">Vihiga</option>
                <option value="bungoma">Bungoma</option>
                <option value="busia">Busia</option>
              </optgroup>
            </select>
          </div>

          <button 
            onClick={generateCountyInsights}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
          >
            Get County Insights
          </button>
        </div>

        {/* County Insights Results */}
        {countyInsights && (
          <div className="space-y-6 mb-8">
            <div className="bg-gradient-to-r from-green-900 to-emerald-900 p-8 rounded-xl">
              <h2 className="text-3xl font-bold text-white mb-2 capitalize">{countyInsights.county} County</h2>
              <p className="text-green-200">Agricultural Profile & Insights</p>
            </div>

            {countyInsights.message ? (
              <div className="bg-gray-800 p-8 rounded-xl">
                <p className="text-gray-300">{countyInsights.message}</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-800 p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Cloud className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-bold text-white">Climate</h3>
                    </div>
                    <p className="text-gray-300">{countyInsights.climate}</p>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Droplets className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-bold text-white">Rainfall</h3>
                    </div>
                    <p className="text-gray-300">{countyInsights.rainfall}</p>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Sun className="w-5 h-5 text-orange-400" />
                      <h3 className="text-lg font-bold text-white">Temperature</h3>
                    </div>
                    <p className="text-gray-300">{countyInsights.temperature}</p>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <h3 className="text-lg font-bold text-white">Altitude</h3>
                    </div>
                    <p className="text-gray-300">{countyInsights.altitude}</p>
                  </div>
                </div>

                <div className="bg-gray-800 p-8 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Leaf className="w-6 h-6 text-green-400" />
                    Soil Types
                  </h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {countyInsights.soilTypes.map((soil, index) => (
                      <div key={index} className="bg-green-900 bg-opacity-30 border border-green-700 p-3 rounded-lg text-center text-green-200">
                        {soil}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 p-8 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Sprout className="w-6 h-6 text-green-400" />
                    Best Crops for This County
                  </h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {countyInsights.bestCrops.map((crop, index) => (
                      <div key={index} className="bg-gray-700 p-4 rounded-lg text-center text-white font-medium">
                        {crop}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 p-8 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                    Challenges
                  </h3>
                  <div className="space-y-2">
                    {countyInsights.challenges.map((challenge, index) => (
                      <div key={index} className="flex items-start gap-3 bg-yellow-900 bg-opacity-20 border border-yellow-700 p-3 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-200">{challenge}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-8 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-blue-300" />
                    Opportunities
                  </h3>
                  <div className="space-y-2">
                    {countyInsights.opportunities.map((opportunity, index) => (
                      <div key={index} className="flex items-start gap-3 bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-200">{opportunity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Crop Insights Section */}
        <div className="bg-gray-800 p-8 rounded-xl mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Generate Crop Insights</h3>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Crop Name</label>
              <input
                type="text"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                placeholder="e.g., Maize, Beans, Oranges, Green grams"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">Enter at least 3 characters</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Soil Type (optional)</label>
              <input
                type="text"
                placeholder="e.g., Clay loam, Sandy"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <button 
            onClick={() => {
              if (!selectedCrop || selectedCrop.trim().length < 3) {
                alert('Please enter at least 3 characters of the crop name');
                return;
              }
              setSelectedCrop(selectedCrop.trim());
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
          >
            Generate AI Insights
          </button>
        </div>

        {/* Crop Insights Results */}
        {insights && selectedCrop && selectedCrop.length >= 3 && (
          <div className="bg-gray-800 p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-white mb-6 capitalize">Crop Insights: {selectedCrop}</h3>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Planting Window</div>
                <div className="text-white">{insights.plantingWindow}</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Average Yield</div>
                <div className="text-white">{insights.avgYield}</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Water Requirement</div>
                <div className="text-white">{insights.waterRequirement}</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Market Price</div>
                <div className="text-white">{insights.marketPrice}</div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold text-white mb-3">Common Pests & Diseases</h4>
              <div className="bg-red-900 bg-opacity-20 border border-red-700 p-4 rounded-lg">
                <p className="text-gray-200">{insights.commonPests}</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-3">Best Practices</h4>
              <div className="space-y-2">
                {insights.bestPractices.map((practice, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-700 p-3 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-200">{practice}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

  const FinancialPage = () => {
  // Calculate totals
  const totalIncome = financialRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  
  const totalExpenses = financialRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  
  const netProfit = totalIncome - totalExpenses;

  const handleAddRecord = () => {
    if (!financialAmount || parseFloat(financialAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!financialCategory.trim()) {
      alert('Please enter a category');
      return;
    }

    const newRecord = {
      id: Date.now(),
      type: financialType,
      amount: parseFloat(financialAmount),
      category: financialCategory.trim(),
      description: financialDescription.trim(),
      date: new Date().toLocaleDateString('en-KE')
    };

    setFinancialRecords([newRecord, ...financialRecords]);
    
    // Reset form
    setFinancialAmount('');
    setFinancialCategory('');
    setFinancialDescription('');
    
    alert('Record added successfully!');
  };

  const handleDeleteRecord = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setFinancialRecords(financialRecords.filter(r => r.id !== id));
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Financial Tracker</h1>
          <p className="text-gray-400">Track costs and ROI for regeneration projects</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-green-500">
            <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
            <div className="text-sm text-gray-400 mb-1">Total Income</div>
            <div className="text-3xl font-bold text-green-400">
              KES {totalIncome.toLocaleString()}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-red-500">
            <AlertTriangle className="w-8 h-8 text-red-400 mb-3" />
            <div className="text-sm text-gray-400 mb-1">Total Expenses</div>
            <div className="text-3xl font-bold text-red-400">
              KES {totalExpenses.toLocaleString()}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-blue-500">
            <DollarSign className="w-8 h-8 text-blue-400 mb-3" />
            <div className="text-sm text-gray-400 mb-1">Net Profit</div>
            <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              KES {netProfit.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Add Record Form */}
        <div className="bg-gray-800 p-8 rounded-xl mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Add Financial Record</h3>

          <div className="space-y-4 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Type</label>
                <select 
                  value={financialType}
                  onChange={(e) => setFinancialType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Amount (KES)</label>
                <input
                  type="number"
                  value={financialAmount}
                  onChange={(e) => setFinancialAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
              <input
                type="text"
                value={financialCategory}
                onChange={(e) => setFinancialCategory(e.target.value)}
                placeholder="e.g., Seeds, Labor, Carbon Credits, Crop Sales"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
              <input
                type="text"
                value={financialDescription}
                onChange={(e) => setFinancialDescription(e.target.value)}
                placeholder="Optional notes"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <button 
            onClick={handleAddRecord}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition"
          >
            Add Record
          </button>
        </div>

        {/* Records List */}
        {financialRecords.length > 0 ? (
          <div className="bg-gray-800 p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-white mb-6">Transaction History</h3>
            
            <div className="space-y-3">
              {financialRecords.map((record) => (
                <div 
                  key={record.id} 
                  className={`p-4 rounded-lg border-l-4 ${
                    record.type === 'income' 
                      ? 'bg-green-900 bg-opacity-20 border-green-500' 
                      : 'bg-red-900 bg-opacity-20 border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          record.type === 'income' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                          {record.type.toUpperCase()}
                        </span>
                        <span className="text-gray-400 text-sm">{record.date}</span>
                      </div>
                      
                      <h4 className="text-lg font-bold text-white mb-1">{record.category}</h4>
                      
                      {record.description && (
                        <p className="text-sm text-gray-400">{record.description}</p>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className={`text-2xl font-bold ${
                        record.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {record.type === 'income' ? '+' : '-'}KES {record.amount.toLocaleString()}
                      </div>
                      
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="mt-2 text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 p-12 rounded-xl text-center">
            <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Records Yet</h3>
            <p className="text-gray-400">Add your first financial record above to start tracking</p>
          </div>
        )}

        {/* Summary Info */}
        {financialRecords.length > 0 && (
          <div className="mt-6 bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-6">
            <h4 className="text-lg font-bold text-white mb-3">Financial Summary</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Total Transactions:</span>
                <span className="text-white font-bold ml-2">{financialRecords.length}</span>
              </div>
              <div>
                <span className="text-gray-400">Income Entries:</span>
                <span className="text-green-400 font-bold ml-2">
                  {financialRecords.filter(r => r.type === 'income').length}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Expense Entries:</span>
                <span className="text-red-400 font-bold ml-2">
                  {financialRecords.filter(r => r.type === 'expense').length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

  const TeamPage = () => {
  const handleSendInvitation = () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!teamEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    if (!emailRegex.test(teamEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    // Check if already invited
    if (teamMembers.some(member => member.email === teamEmail)) {
      alert('This person has already been invited');
      return;
    }

    const newMember = {
      id: Date.now(),
      email: teamEmail.trim(),
      name: teamEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role: 'Member',
      status: 'Invited',
      invitedDate: new Date().toLocaleDateString('en-KE'),
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    };

    setTeamMembers([...teamMembers, newMember]);
    setTeamEmail('');
    alert(`✅ Invitation sent to ${newMember.email}!`);
  };

  const handleRemoveMember = (id) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(teamMembers.filter(member => member.id !== id));
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Team Collaboration</h1>
          <p className="text-gray-400">Invite team members to collaborate on land monitoring</p>
        </div>

        <div className="bg-gray-800 p-8 rounded-xl mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Invite Team Member</h3>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={teamEmail}
              onChange={(e) => setTeamEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendInvitation()}
              placeholder="colleague@example.com"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button 
            onClick={handleSendInvitation}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition"
          >
            <Users className="w-5 h-5" />
            Send Invitation
          </button>
        </div>

        <div className="bg-gray-800 p-8 rounded-xl">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Team Members ({teamMembers.length})
          </h3>

          {teamMembers.length > 0 ? (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div 
                  key={member.id}
                  className="bg-gray-700 p-5 rounded-lg flex items-center justify-between hover:bg-gray-650 transition"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-white">{member.name}</h4>
                      <p className="text-sm text-gray-400">{member.email}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          member.status === 'Active' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-yellow-600 text-white'
                        }`}>
                          {member.status}
                        </span>
                        <span className="text-xs text-gray-400">{member.role}</span>
                        <span className="text-xs text-gray-500">• Invited {member.invitedDate}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No team members yet. Invite someone to get started!</p>
            </div>
          )}
        </div>

        {teamMembers.length > 0 && (
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-400">{teamMembers.length}</div>
              <div className="text-sm text-gray-400 mt-1">Total Members</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-400">
                {teamMembers.filter(m => m.status === 'Active').length}
              </div>
              <div className="text-sm text-gray-400 mt-1">Active Members</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {teamMembers.filter(m => m.status === 'Invited').length}
              </div>
              <div className="text-sm text-gray-400 mt-1">Pending Invites</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

  const AboutPage = () => (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <img 
            src="/images/logo.png" 
            alt="EarthReGen Logo" 
            className="w-20 h-20 object-contain mx-auto mb-6 rounded-xl"
          />
          <h1 className="text-5xl font-bold text-white mb-4">About EarthReGen</h1>
          <p className="text-xl text-gray-400">Bringing life back to degraded lands through AI and innovation</p>
        </div>

        <div className="bg-gray-800 p-8 rounded-xl mb-8">
          <h2 className="text-3xl font-bold text-green-400 mb-4 flex items-center gap-3">
            <Leaf className="w-8 h-8" />
            The Problem We're Solving
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Every year, millions of acres lose their ability to support life. Soil erodes. Crops fail. Communities struggle. Meanwhile, the tools to detect and reverse this damage—satellites, AI, climate sensors—exist but remain locked behind expensive consultancies and complex software.

EarthReGen breaks down those barriers. We put satellite intelligence, instant soil analysis, and restoration blueprints in the hands of anyone managing land. No PhD required. No thousand-dollar subscription. Just real data, actionable insights, and a chance to turn degradation around before it's irreversible.
          </p>
        </div>

        <div className="bg-gray-800 p-8 rounded-xl mb-8">
          <h2 className="text-3xl font-bold text-green-400 mb-6">Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Real-time land degradation monitoring',
              'AI-powered soil health analysis',
              'Carbon sequestration tracking',
              'Interactive satellite mapping',
              'Weather-based recommendations',
              'Kenya-specific agricultural insights',
              'Financial tracking and ROI analysis',
              'Team collaboration tools'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-900 to-emerald-900 p-8 rounded-xl text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Built for Land ReGen Hackathon 2025</h2>
          <p className="text-green-100 mb-6">
            Created to address SDG 15: Life on Land through innovative AI-powered solutions
          </p>
          <div className="flex justify-center gap-4">
            <div className="bg-gray-800 bg-opacity-50 px-4 py-2 rounded-lg">
              <div className="text-green-400 font-bold">Supabase</div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 px-4 py-2 rounded-lg">
              <div className="text-green-400 font-bold">Claude AI</div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 px-4 py-2 rounded-lg">
              <div className="text-green-400 font-bold">React</div>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-500 py-8 mt-8 border-t border-gray-800">
          <p className="mb-2">© 2025 EarthReGen</p>
          <p className="text-sm">Building a sustainable future, one hectare at a time 🌍</p>
        </div>
      </div>
    </div>
  );

  

  const renderPage = () => {
  switch (currentPage) {
    case 'home': return <HomePage />;
    case 'dashboard': return <DashboardPage />;
    case 'soil-analyzer': return <SoilAnalyzerPage />;
    case 'assessment': return <AssessmentPage />;
    case 'map': return <MapPage />;
    case 'carbon': return <CarbonTrackerPage />;
    case 'weather': return <WeatherPage />;
    case 'kenya': return <KenyaInsightsPage />;
    case 'financial': return <FinancialPage />;
    case 'team': return <TeamPage />;
    case 'signin': return (
  <SignInPage 
    key="signin-page"
    authUsername={authUsername}
    setAuthUsername={setAuthUsername}
    authEmail={authEmail}
    setAuthEmail={setAuthEmail}
    authPassword={authPassword}
    setAuthPassword={setAuthPassword}
    authConfirmPassword={authConfirmPassword}
    setAuthConfirmPassword={setAuthConfirmPassword}
    isSignUp={isSignUp}
    setIsSignUp={setIsSignUp}
    setCurrentPage={setCurrentPage}
    handleSignIn={handleSignIn}
    handleSignUp={handleSignUp}
  />
);
    case 'about': return <AboutPage />;
    default: return <HomePage />;
  }
};

  return (
    <div className="min-h-screen bg-gray-900">
      <NavBar />
      {renderPage()}
    </div>
  );
}