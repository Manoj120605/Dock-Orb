"use client";

import { Database, Plus, Search, Folder, User, CheckCircle2, Zap } from "lucide-react";

export default function CapsulesPage() {
  const capsules = [
    { id: '1', name: 'Capsule Platform', type: 'PROJECT', updatedAt: '2 mins ago', size: '1.2 MB', active: true },
    { id: '2', name: 'Frontend Refactoring', type: 'TASK', updatedAt: '1 hour ago', size: '342 KB', active: true },
    { id: '3', name: 'GSGMK Preferences', type: 'USER', updatedAt: '1 day ago', size: '12 KB', active: true },
    { id: '4', name: 'Mechanical CAD Export', type: 'PROJECT', updatedAt: '3 days ago', size: '4.5 MB', active: false },
    { id: '5', name: 'Architecture Review', type: 'CONVERSATION', updatedAt: '1 week ago', size: '89 KB', active: false },
  ];

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Capsules</h1>
          <p className="text-muted-foreground">Manage your structured project memories.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <Plus size={16} />
          Create Capsule
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search capsules..." 
            className="w-full bg-card border border-border/60 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <select className="bg-card border border-border/60 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50">
          <option>All Types</option>
          <option>Project</option>
          <option>User</option>
          <option>Task</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-8">
        {capsules.map((capsule) => (
          <div key={capsule.id} className="glass-panel p-5 rounded-xl flex flex-col hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg ${
                capsule.type === 'PROJECT' ? 'bg-blue-500/10 text-blue-500' :
                capsule.type === 'USER' ? 'bg-purple-500/10 text-purple-500' :
                capsule.type === 'TASK' ? 'bg-orange-500/10 text-orange-500' :
                'bg-gray-500/10 text-gray-500'
              }`}>
                {capsule.type === 'PROJECT' && <Folder size={20} />}
                {capsule.type === 'USER' && <User size={20} />}
                {capsule.type === 'TASK' && <CheckCircle2 size={20} />}
                {capsule.type === 'CONVERSATION' && <Database size={20} />}
              </div>
              
              {capsule.active && (
                <div className="flex items-center gap-1 text-[10px] font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                  <Zap size={10} /> Active
                </div>
              )}
            </div>
            
            <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{capsule.name}</h3>
            <p className="text-xs text-muted-foreground capitalize mb-4">{capsule.type.toLowerCase()} Capsule</p>
            
            <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span>{capsule.updatedAt}</span>
              <span>{capsule.size}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
