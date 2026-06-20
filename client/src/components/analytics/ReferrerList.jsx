import { ExternalLink } from 'lucide-react';

function ReferrerList({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No referrer data available
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.clicks - a.clicks);
  const maxClicks = sortedData[0]?.clicks || 1;

  return (
    <div className="space-y-3">
      {sortedData.map((referrer, index) => (
        <div key={referrer.source} className="group">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-500 w-5">{index + 1}.</span>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex items-center space-x-1">
                <span>{referrer.source}</span>
                {referrer.source !== 'direct' && (
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-400">{referrer.clicks.toLocaleString()}</span>
          </div>
          <div className="ml-7 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${(referrer.clicks / maxClicks) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReferrerList;
