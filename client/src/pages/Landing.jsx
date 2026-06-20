import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link2, BarChart3, Zap, Shield, Globe, ArrowRight, Copy, Check } from 'lucide-react';
import clsx from 'clsx';

function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      toast('Please login to shorten URLs', { icon: '\u{1F512}' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/urls', { originalUrl: url });
      setShortenedUrl(res.data.shortUrl);
      toast.success('URL shortened successfully!');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to shorten URL';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortenedUrl);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Track clicks, locations, devices, and referrers with real-time analytics dashboards.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant redirects with global edge caching. Your links load in milliseconds.',
    },
    {
      icon: Shield,
      title: 'Custom Aliases',
      description: 'Create branded, memorable short links with custom aliases that reflect your brand.',
    },
    {
      icon: Globe,
      title: 'Rate Limiting',
      description: 'Built-in protection against abuse with intelligent rate limiting and spam detection.',
    },
  ];

  const stats = [
    { value: '10M+', label: 'Links Created' },
    { value: '500M+', label: 'Clicks Tracked' },
    { value: '99.9%', label: 'Uptime' },
    { value: '150+', label: 'Countries' },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-bg animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Shorten Your URLs,{' '}
              <span className="gradient-text">Amplify Your Reach</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Transform long, unwieldy URLs into clean, trackable short links.
              Get powerful analytics and insights for every click.
            </p>

            {/* URL Shortener Form */}
            <form onSubmit={handleShorten} className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste your long URL here..."
                    className="input-field pl-12 h-14"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary h-14 flex items-center justify-center space-x-2 whitespace-nowrap"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Shorten</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Shortened URL Result */}
            {shortenedUrl && (
              <div className="max-w-2xl mx-auto glass-card p-4 flex items-center justify-between gap-4">
                <p className="text-brand-300 font-mono text-sm sm:text-base truncate">
                  {shortenedUrl}
                </p>
                <button
                  onClick={handleCopy}
                  className={clsx(
                    'flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    copied ? 'bg-green-500/20 text-green-400' : 'bg-brand-500/20 text-brand-300 hover:bg-brand-500/30'
                  )}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}

            {!isAuthenticated && (
              <p className="text-sm text-gray-500 mt-4">
                <Link to="/register" className="text-brand-400 hover:text-brand-300 transition-colors">
                  Create a free account
                </Link>{' '}
                to start shortening URLs and tracking analytics.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Manage Links</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Powerful tools and insights to help you understand your audience and optimize your link strategy.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="glass-card-hover p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center mb-4 border border-brand-500/20">
                    <Icon className="w-6 h-6 text-brand-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-indigo-600/10" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Join thousands of marketers, developers, and businesses who trust Shrinkly for their link management needs.
              </p>
              <Link to="/register" className="btn-primary inline-flex items-center space-x-2">
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Shrinkly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
