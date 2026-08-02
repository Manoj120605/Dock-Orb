"use client";

import { Zap, Code, Shield, Wrench, Search, Download } from "lucide-react";

export default function SkillsPage() {
  const skills = [
    { id: '1', name: 'NestJS Expert', domain: 'Software', author: 'Capsule AI', installed: true, icon: Code, tags: ['backend', 'typescript'] },
    { id: '2', name: 'React UI Master', domain: 'Software', author: 'Capsule AI', installed: true, icon: Code, tags: ['frontend', 'react'] },
    { id: '3', name: 'Threat Modeler', domain: 'Security', author: 'Capsule AI', installed: true, icon: Shield, tags: ['cybersecurity', 'stride'] },
    { id: '4', name: 'SolidWorks Assistant', domain: 'Mechanical', author: 'Capsule AI', installed: false, icon: Wrench, tags: ['cad', '3d'] },
    { id: '5', name: 'FEA Analyst', domain: 'Mechanical', author: 'Capsule AI', installed: false, icon: Wrench, tags: ['simulation', 'ansys'] },
  ];

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Skills Marketplace</h1>
          <p className="text-muted-foreground">Extend your AI's capabilities with domain-specific skills.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search skills..." 
            className="w-full bg-card border border-border/60 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg">All</button>
          <button className="px-4 py-2 text-sm font-medium bg-card border border-border/60 hover:bg-accent rounded-lg transition-colors">Software</button>
          <button className="px-4 py-2 text-sm font-medium bg-card border border-border/60 hover:bg-accent rounded-lg transition-colors">Mechanical</button>
          <button className="px-4 py-2 text-sm font-medium bg-card border border-border/60 hover:bg-accent rounded-lg transition-colors">Security</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pb-8">
        {skills.map((skill) => (
          <div key={skill.id} className="glass-panel p-5 rounded-xl flex flex-col group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-accent text-primary">
                <skill.icon size={24} />
              </div>
              
              {skill.installed ? (
                <div className="flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                  <Zap size={10} /> Installed
                </div>
              ) : (
                <button className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-card border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary px-2 py-1 rounded-full transition-all">
                  <Download size={10} /> Install
                </button>
              )}
            </div>
            
            <h3 className="font-semibold text-lg text-foreground mb-1">{skill.name}</h3>
            <p className="text-xs text-muted-foreground mb-4">By {skill.author} • {skill.domain}</p>
            
            <div className="mt-auto pt-4 border-t border-border/40 flex flex-wrap gap-2">
              {skill.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-background border border-border/60 rounded text-[10px] font-medium text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
