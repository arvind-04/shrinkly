import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import StatsCards from '../components/dashboard/StatsCards';
import ShortenForm from '../components/dashboard/ShortenForm';
import UrlTable from '../components/dashboard/UrlTable';
import LoadingSpinner from '../components/common/LoadingSpinner';

function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [stats, setStats] = useState({
    totalUrls: 0,
    totalClicks: 0,
    clicksToday: 0,
    activeUrls: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [urlsRes, statsRes] = await Promise.all([
        api.get('/api/urls'),
        api.get('/api/analytics/dashboard'),
      ]);
      setUrls(urlsRes.data.urls || urlsRes.data || []);
      setStats(statsRes.data || {
        totalUrls: 0,
        totalClicks: 0,
        clicksToday: 0,
        activeUrls: 0,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      // Set fallback data from URLs if stats endpoint fails
      if (urls.length === 0) {
        try {
          const urlsRes = await api.get('/api/urls');
          const urlData = urlsRes.data.urls || urlsRes.data || [];
          setUrls(urlData);
          setStats({
            totalUrls: urlData.length,
            totalClicks: urlData.reduce((sum, u) => sum + (u.clicks || 0), 0),
            clicksToday: 0,
            activeUrls: urlData.filter((u) => u.isActive !== false).length,
          });
        } catch (innerErr) {
          toast.error('Failed to load dashboard data');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUrlCreated = (newUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalUrls: prev.totalUrls + 1,
      activeUrls: prev.activeUrls + 1,
    }));
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/urls/${id}`);
      setUrls((prev) => prev.filter((u) => u.id !== id));
      setStats((prev) => ({
        ...prev,
        totalUrls: prev.totalUrls - 1,
        activeUrls: prev.activeUrls - 1,
      }));
      toast.success('URL deleted successfully');
    } catch (err) {
      toast.error('Failed to delete URL');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">Manage your shortened URLs and track performance.</p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Shorten Form */}
        <div className="mt-8">
          <ShortenForm onUrlCreated={handleUrlCreated} />
        </div>

        {/* URL Table */}
        <div className="mt-8">
          <UrlTable urls={urls} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
