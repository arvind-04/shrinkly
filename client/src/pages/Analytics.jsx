import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ClicksChart from '../components/analytics/ClicksChart';
import GeoChart from '../components/analytics/GeoChart';
import DeviceChart from '../components/analytics/DeviceChart';
import BrowserChart from '../components/analytics/BrowserChart';
import ReferrerList from '../components/analytics/ReferrerList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BarChart3, Globe, Monitor, Compass } from 'lucide-react';

function Analytics() {
  const { id } = useParams();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      if (id) {
        const res = await api.get(`/api/urls/${id}/stats`);
        setAnalyticsData(res.data);
      } else {
        const [dashboard, clicks, countries, devices, browsers, referrers] = await Promise.all([
          api.get('/api/analytics/dashboard'),
          api.get('/api/analytics/clicks?period=30d'),
          api.get('/api/analytics/countries'),
          api.get('/api/analytics/devices'),
          api.get('/api/analytics/browsers'),
          api.get('/api/analytics/referrers'),
        ]);

        setAnalyticsData({
          totalClicks: dashboard.data.totalClicks || 0,
          clicksOverTime: (clicks.data.data || []).map(item => ({
            date: item.date ? item.date.split('T')[0] : item.date,
            clicks: item.count,
          })),
          countries: (countries.data.data || []).map(item => ({
            name: item.country || 'Unknown',
            value: item.count,
          })),
          devices: (devices.data.data || []).map(item => ({
            name: item.device || 'Unknown',
            value: item.count,
          })),
          browsers: (browsers.data.data || []).map(item => ({
            name: item.browser || 'Unknown',
            value: item.count,
          })),
          referrers: (referrers.data.data || []).map(item => ({
            source: item.referrer || 'direct',
            clicks: item.count,
          })),
          urlInfo: null,
        });
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Analytics Data</h2>
          <p className="text-gray-400">Analytics will appear once your URLs start getting clicks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-brand-400" />
            <span>Analytics {id ? '- URL Details' : '- Overview'}</span>
          </h1>
          {analyticsData.urlInfo && (
            <p className="text-gray-400">
              Showing analytics for: <span className="text-brand-300 font-mono">{analyticsData.urlInfo.shortCode}</span>
            </p>
          )}
          <p className="text-gray-400 mt-1">
            Total clicks: <span className="text-white font-semibold">{(analyticsData.totalClicks || 0).toLocaleString()}</span>
          </p>
        </div>

        {/* Clicks Over Time Chart */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-brand-400" />
            <span>Clicks Over Time</span>
          </h2>
          <ClicksChart data={analyticsData.clicksOverTime || []} />
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Countries */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-brand-400" />
              <span>Top Countries</span>
            </h2>
            <GeoChart data={analyticsData.countries || []} />
          </div>

          {/* Devices */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-brand-400" />
              <span>Devices</span>
            </h2>
            <DeviceChart data={analyticsData.devices || []} />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Browsers */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Compass className="w-5 h-5 text-brand-400" />
              <span>Browsers</span>
            </h2>
            <BrowserChart data={analyticsData.browsers || []} />
          </div>

          {/* Referrers */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-brand-400" />
              <span>Top Referrers</span>
            </h2>
            <ReferrerList data={analyticsData.referrers || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

function generateDemoClicksData() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      clicks: Math.floor(Math.random() * 500) + 50,
    });
  }
  return data;
}

export default Analytics;
