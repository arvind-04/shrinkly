import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Link2, Wand2 } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

function ShortenForm({ onUrlCreated }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const payload = { originalUrl: originalUrl.trim() };
      if (customAlias.trim()) {
        payload.customAlias = customAlias.trim();
      }
      const res = await api.post('/api/urls', payload);
      onUrlCreated(res.data.url || res.data);
      setOriginalUrl('');
      setCustomAlias('');
      toast.success('URL shortened successfully!');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to shorten URL';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <Wand2 className="w-5 h-5 text-brand-400" />
        <span>Shorten a URL</span>
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="Enter your long URL..."
              required
              className="input-field pl-11"
            />
          </div>
          <div className="lg:w-48">
            <input
              type="text"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              placeholder="Custom alias (optional)"
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Shorten</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ShortenForm;
