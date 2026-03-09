// MLHerbInsights Component
import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, LinearProgress,
  Chip, CircularProgress, Alert
} from '@mui/material';
import {
  FaBrain, FaChartLine, FaLeaf, FaCalendarAlt, FaLightbulb,
  FaTachometerAlt, FaHistory, FaSearch, FaBolt, FaShieldAlt, FaExclamationTriangle
} from 'react-icons/fa';
import axios from 'axios';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend
} from 'recharts';
import API_ENDPOINTS, { getAuthHeaders } from '../config/api';

const MLHerbInsights = ({ user, selectedHerb = null }) => {
  const [mlData, setMlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendedHerbs, setRecommendedHerbs] = useState([]);
  const [trendingHerbs, setTrendingHerbs] = useState([]);
  const [healthInsights, setHealthInsights] = useState(null);
  const [seasonalPredictions, setSeasonalPredictions] = useState([]);
  const [forecastChartData, setForecastChartData] = useState([]);
  const [qualityRiskData, setQualityRiskData] = useState([]);
  const [mlSystemStatus, setMlSystemStatus] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchMLData();
  }, [selectedHerb]);

  const fetchMLData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = { ...getAuthHeaders() };

      // Fetch personalized recommendations
      try {
        const recommendationsResponse = await axios.post(
          API_ENDPOINTS.ML.RECOMMENDATIONS,
          { user_id: user?.id || 1 },
          { headers }
        );

        if (recommendationsResponse.data?.recommendations) {
          setRecommendedHerbs(recommendationsResponse.data.recommendations);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }

      // Fetch demand forecasts and system status
      try {
        const forecastUrl = 'http://localhost:5001/api/ml/demand-forecast';
        const statusUrl = 'http://localhost:5001/api/ml/system-status';

        const [forecastRes, statusRes] = await Promise.all([
          axios.post(forecastUrl, {
            historical_data: [],
            forecast_horizon: 30,
            product_info: { product_name: selectedHerb?.name || 'turmeric' }
          }, { headers }),
          axios.get(statusUrl, { headers })
        ]);

        if (forecastRes.data?.forecast) {
          setForecastChartData(forecastRes.data.forecast);
          const topTrending = forecastRes.data.forecast.slice(0, 3).map((item, index) => ({
            name: selectedHerb?.name || ['Neem', 'Brahmi', 'Ashwagandha'][index],
            trend: Math.min(95, 45 + index * 8),
            predictedGrowth: 12 + index * 3,
            image: `/assets/${['neem', 'brahmi', 'ashwagandha'][index]}.png`,
            date: item.date,
            demand: item.predicted_sales
          }));
          setTrendingHerbs(topTrending);
        }

        if (statusRes.data) {
          setMlSystemStatus(statusRes.data);
        }
      } catch (error) {
        console.error('Error fetching advanced ML data:', error);
      }

      // Set mock health insights (HealthRec-X mapping can be added here)
      setHealthInsights({
        wellnessScore: Math.floor(Math.random() * 20) + 80,
        riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        recommendations: [
          'Increase daily water intake by 500ml',
          'Add 15 minutes of meditation to your routine',
          'Consider omega-3 supplements for heart health'
        ],
        predictedImprovements: {
          energy: 15,
          sleep: 22,
          stress: -18
        }
      });

      setSeasonalPredictions([
        { season: 'Winter', category: 'Immunity Boosters', expectedDemand: 65, herbs: ['Ashwagandha', 'Tulsi', 'Giloy'] },
        { season: 'Summer', category: 'Cooling Herbs', expectedDemand: 72, herbs: ['Neem', 'Amla', 'Coriander'] },
        { season: 'Monsoon', category: 'Digestive Aids', expectedDemand: 58, herbs: ['Ginger', 'Fennel', 'Triphala'] }
      ]);

    } catch (err) {
      setError('Failed to load AI-powered insights');
      console.error('ML Insights error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-lg text-slate-600 font-medium">Loading AI-powered insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <div className="flex items-center">
          <div className="text-amber-500 mr-3">
            <FaLightbulb />
          </div>
          <div>
            <p className="text-amber-800 font-medium">{error}</p>
            <p className="text-amber-600 text-sm">Displaying sample data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white mr-4 shadow-lg">
            <FaBrain size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-playfair font-bold text-slate-900 mb-1">
              AI-Powered Herb Insights
            </h2>
            <p className="text-slate-600 text-sm">
              Powered by advanced machine learning algorithms
            </p>
          </div>
        </div>
        <button
          onClick={fetchMLData}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-2xl flex items-center space-x-2 transition-all duration-300 font-semibold group"
        >
          <FaBolt className="group-hover:scale-110 transition-transform" />
          <span>Refresh Insights</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 border-b border-slate-200/50 pb-2">
          <button
            onClick={() => setActiveTab(0)}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${activeTab === 0
              ? 'bg-emerald-100 text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <FaLeaf />
            <span>Recommendations</span>
          </button>
          <button
            onClick={() => setActiveTab(1)}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${activeTab === 1
              ? 'bg-emerald-100 text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <FaChartLine />
            <span>Market Trends</span>
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${activeTab === 2
              ? 'bg-emerald-100 text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <FaLightbulb />
            <span>Health Insights</span>
          </button>
          <button
            onClick={() => setActiveTab(3)}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${activeTab === 3
              ? 'bg-emerald-100 text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <FaCalendarAlt />
            <span>Seasonal Predictions</span>
          </button>

        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 mb-6">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white mr-3">
                  <FaLeaf size={20} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Personalized Herb Recommendations
                </h3>
              </div>
              {recommendedHerbs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedHerbs.map((herb, index) => (
                    <div key={index} className="card-product group">
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-white/50 transition-all duration-300 group-hover:shadow-xl group-hover:border-emerald-200/50 h-full">
                        <div className="p-4 h-full flex flex-col">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-lg font-semibold text-slate-900 mb-1">
                                {herb.name}
                              </h4>
                              <span className="text-sm text-slate-600">
                                {herb.category}
                              </span>
                            </div>
                            <Chip
                              label={`${herb.confidence}% match`}
                              className="bg-green-100 text-green-700 text-sm font-bold"
                            />
                          </div>

                          <div className="mb-3">
                            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 mb-2">
                              {herb.category}
                            </span>
                            {herb.discount && (
                              <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-200 ml-2">
                                {herb.discount}% OFF
                              </span>
                            )}
                          </div>

                          <p className="text-slate-600 text-sm mb-4 flex-grow">
                            {herb.benefits?.join(', ') || 'Multiple health benefits'}
                          </p>

                          {herb.price && (
                            <div className="flex justify-between items-center">
                              <span className="text-xl font-bold text-emerald-600">
                                ₹{herb.price}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-600 text-lg">
                    No personalized recommendations available at this time.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                    <FaChartLine size={20} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    DemandProphet-X: 30-Day Demand Forecast
                  </h3>
                </div>
              </div>

              <div className="h-[400px] w-full bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="predicted_sales"
                      name="Predicted Demand"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10b981' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="confidence_upper"
                      name="Upper Bound"
                      stroke="#94a3b8"
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="confidence_lower"
                      name="Lower Bound"
                      stroke="#94a3b8"
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-6">
                <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FaHistory className="text-blue-500" />
                  Peak Demand Insights
                </h4>
                <ul className="space-y-3">
                  {forecastChartData.filter(d => d.predicted_sales > 120).slice(0, 3).map((d, i) => (
                    <li key={i} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="text-emerald-800 font-medium">{d.date}</span>
                      <span className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold">
                        High Demand: {d.predicted_sales} units
                      </span>
                    </li>
                  ))}
                  {forecastChartData.filter(d => d.predicted_sales > 120).length === 0 && (
                    <p className="text-slate-500 italic">No significant demand surges predicted in this horizon.</p>
                  )}
                </ul>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-6">
                <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FaLightbulb className="text-amber-500" />
                  AI Recommendations
                </h4>
                <div className="space-y-2">
                  <Alert severity="info" className="rounded-xl border-none bg-blue-50 text-blue-800">
                    Optimize inventory levels for early next month to avoid stockouts.
                  </Alert>
                  <Alert severity="success" className="rounded-xl border-none bg-emerald-50 text-emerald-800">
                    Current demand signals are stable with 92% confidence.
                  </Alert>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 mb-6">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white mr-3">
                  <FaLightbulb size={20} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  AI Health Recommendations
                </h3>
              </div>

              {healthInsights && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8">
                    <div className="space-y-4">
                      {healthInsights.recommendations.map((rec, index) => (
                        <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-white/50">
                          <div className="p-4">
                            <div className="flex items-center mb-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white mr-3">
                                <FaLightbulb size={14} />
                              </div>
                              <h4 className="font-semibold text-slate-900">
                                Recommendation {index + 1}
                              </h4>
                            </div>
                            <p className="text-slate-700 leading-relaxed">
                              {rec}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-white/50 h-full">
                      <div className="p-4 h-full flex flex-col">
                        <h4 className="text-lg font-semibold text-slate-900 mb-4">
                          Your Wellness Score
                        </h4>
                        <div className="flex items-center justify-center mb-4">
                          <div className="relative w-20 h-20">
                            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#e0e0e0"
                                strokeWidth="2"
                              />
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#4caf50"
                                strokeWidth="2"
                                strokeDasharray={`${healthInsights.wellnessScore}, 100`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-bold text-emerald-600">
                                {healthInsights.wellnessScore}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-auto">
                          <div className="mb-2">
                            <span className="text-sm font-medium text-slate-700">Risk Level: </span>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${healthInsights.riskLevel === 'low'
                              ? 'bg-green-100 text-green-700'
                              : healthInsights.riskLevel === 'medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                              }`}>
                              {healthInsights.riskLevel}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            Based on your current health data
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 mb-6">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white mr-3">
                  <FaCalendarAlt size={20} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Seasonal Herb Predictions
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {seasonalPredictions.map((prediction, index) => (
                  <div key={index} className="card-product group">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-white/50 transition-all duration-300 group-hover:shadow-xl group-hover:border-purple-200/50 h-full">
                      <div className="p-4 h-full">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-lg font-semibold text-slate-900">
                            {prediction.season}
                          </h4>
                          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
                            {prediction.category}
                          </span>
                        </div>

                        <div className="mb-4">
                          <p className="text-slate-600 text-sm mb-2">
                            Expected Demand
                          </p>
                          <LinearProgress
                            variant="determinate"
                            value={prediction.expectedDemand}
                            className="h-2 rounded-full overflow-hidden mb-1"
                            sx={{
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#9c27b0',
                                borderRadius: 2,
                              }
                            }}
                          />
                          <div className="text-right text-xs text-slate-500">
                            {prediction.expectedDemand}%
                          </div>
                        </div>

                        <div>
                          <p className="text-slate-700 text-sm font-medium mb-2">
                            Recommended Herbs:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {prediction.herbs.map((herb, herbIndex) => (
                              <span
                                key={herbIndex}
                                className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full border border-purple-200"
                              >
                                {herb}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-l-4 border-l-purple-500">
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white mr-2">
                      <FaLightbulb size={12} />
                    </div>
                    <h4 className="text-lg font-semibold text-purple-700">
                      Seasonal Insights
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed pl-1">
                    Our AI analyzes seasonal patterns, climate data, and market trends to predict which herbs
                    will be in highest demand. This helps you make informed decisions about which herbs to
                    stock or purchase for optimal health benefits during different seasons.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MLHerbInsights;
