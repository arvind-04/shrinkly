import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Copy, Check, Trash2, ExternalLink, BarChart3, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

function UrlTable({ urls, onDelete }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const truncateUrl = (url, maxLength = 50) => {
    if (!url) return '';
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  if (urls.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-brand-500/10 rounded-full flex items-center justify-center">
          <Link2 className="w-8 h-8 text-brand-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No URLs yet</h3>
        <p className="text-gray-400">Create your first short URL using the form above.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-lg font-semibold">Your URLs</h2>
        <p className="text-sm text-gray-400 mt-1">{urls.length} total links</p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Short URL</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Original URL</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {urls.map((url) => (
              <tr key={url.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <a
                    href={url.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 font-mono text-sm flex items-center space-x-1"
                  >
                    <span>{url.shortCode || url.shortUrl?.split('/').pop()}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-300" title={url.originalUrl}>
                    {truncateUrl(url.originalUrl)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium">{(url.clicks || 0).toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-400">
                    {url.createdAt ? format(new Date(url.createdAt), 'MMM d, yyyy') : '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      to={`/dashboard/analytics/${url.id}`}
                      className="p-2 text-gray-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all"
                      title="View analytics"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleCopy(url.shortUrl, url.id)}
                      className={clsx(
                        'p-2 rounded-lg transition-all',
                        copiedId === url.id
                          ? 'text-green-400 bg-green-500/10'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      )}
                      title="Copy short URL"
                    >
                      {copiedId === url.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => onDelete(url.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete URL"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-white/5">
        {urls.map((url) => (
          <div key={url.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <a
                href={url.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 hover:text-brand-300 font-mono text-sm flex items-center space-x-1"
              >
                <span>{url.shortCode || url.shortUrl?.split('/').pop()}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-xs text-gray-500">
                {url.createdAt ? format(new Date(url.createdAt), 'MMM d') : '-'}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate">{url.originalUrl}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{(url.clicks || 0).toLocaleString()} clicks</span>
              <div className="flex items-center space-x-1">
                <Link
                  to={`/dashboard/analytics/${url.id}`}
                  className="p-2 text-gray-400 hover:text-brand-400 rounded-lg transition-all"
                >
                  <BarChart3 className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleCopy(url.shortUrl, url.id)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg transition-all"
                >
                  {copiedId === url.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onDelete(url.id)}
                  className="p-2 text-gray-400 hover:text-red-400 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UrlTable;
