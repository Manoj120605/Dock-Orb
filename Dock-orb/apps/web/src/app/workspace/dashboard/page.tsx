"use client";

import { BarChart3, TrendingDown, DollarSign, Database, BrainCircuit, Activity } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { title: 'Total API Cost (30d)', value: '$12.45', change: '-45%', icon: DollarSign, trend: 'good' },
    { title: 'Cost Saved by Cache', value: '$8.20', change: '+12%', icon: TrendingDown, trend: 'good' },
    { title: 'Total Tokens Processed', value: '1.2M', change: '+5%', icon: BrainCircuit, trend: 'neutral' },
    { title: 'Capsules Indexed', value: '42', change: '+3', icon: Database, trend: 'neutral' },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor API usage, costs, and optimization metrics.</p>
        </div>
        <select className="bg-card border border-border/60 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
          <option>This Month</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              <div className="p-2 bg-primary/10 rounded-lg">
                <stat.icon size={18} className="text-primary" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <div className={`text-xs font-medium px-2 py-1 rounded-md ${
                stat.trend === 'good' ? 'text-green-500 bg-green-500/10' : 'text-blue-500 bg-blue-500/10'
              }`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-panel p-6 rounded-xl h-80 flex flex-col">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            Cost by Provider
          </h3>
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border/60 rounded-lg">
            [Chart Area: Cost Distribution]
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl h-80 flex flex-col">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <Activity size={18} className="text-primary" />
            Model Usage (Tokens)
          </h3>
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border/60 rounded-lg">
            [Chart Area: Token Volume]
          </div>
        </div>
      </div>
    </div>
  );
}
