import { Link2, MousePointerClick, TrendingUp, Activity } from 'lucide-react';

function StatsCards({ stats }) {
  const cards = [
    {
      title: 'Total URLs',
      value: stats.totalUrls || 0,
      icon: Link2,
      gradient: 'from-brand-500 to-purple-600',
      bgGlow: 'bg-brand-500/10',
      iconColor: 'text-brand-400',
    },
    {
      title: 'Total Clicks',
      value: stats.totalClicks || 0,
      icon: MousePointerClick,
      gradient: 'from-indigo-500 to-blue-600',
      bgGlow: 'bg-indigo-500/10',
      iconColor: 'text-indigo-400',
    },
    {
      title: 'Clicks Today',
      value: stats.clicksToday || 0,
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-600',
      bgGlow: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Active URLs',
      value: stats.activeUrls || 0,
      icon: Activity,
      gradient: 'from-amber-500 to-orange-600',
      bgGlow: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="glass-card-hover p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bgGlow}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold mb-1">{card.value.toLocaleString()}</p>
            <p className="text-sm text-gray-400">{card.title}</p>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;
