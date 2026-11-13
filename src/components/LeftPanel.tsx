import { Search } from 'lucide-react';
import { ComponentType, PCComponent } from '../types';
import React, { useState, useEffect } from 'react';
import { fetchDbComponents } from '../services/api';
import { getShortName } from '../utils/specMapper';

interface LeftPanelProps {
  onDragStart: (e: React.DragEvent, component: PCComponent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const CATEGORIES: ComponentType[] = ['MOTHERBOARD', 'CPU', 'RAM', 'SSD', 'GPU', 'PSU', 'CABINET'];

export function LeftPanel({ onDragStart, onDragEnd }: LeftPanelProps) {
  const [activeFilter, setActiveFilter] = useState<ComponentType>('MOTHERBOARD');
  const [searchQuery, setSearchQuery] = useState('');
  const [componentsData, setComponentsData] = useState<PCComponent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComponents = () => {
    fetchDbComponents()
      .then(data => {
        setComponentsData(data);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadComponents();
  }, []);

  const searchWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
  
  const filteredComponents = componentsData.filter(
    (c) => {
      if (c.type !== activeFilter) return false;
      if (searchWords.length === 0) return true;
      
      const nameStr = (c.name || '').toLowerCase();
      const brandStr = (c.brand || '').toLowerCase();
      
      // Match if EVERY word in the search query is found in the name OR the brand
      return searchWords.every(word => nameStr.includes(word) || brandStr.includes(word));
    }
  );

  return (
    <aside className="w-1/4 flex flex-col bg-panel border border-cabinet-border/10 h-full rounded-3xl overflow-hidden shadow-lg">
      <div className="p-6 border-b border-cabinet-border/10">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center bg-layer-1 border border-cabinet-border/10 focus-within:border-category-selected transition-colors px-4 py-3 rounded-full">
            <Search className="text-text-primary w-4 h-4 mr-3" />
            <input
              className="bg-transparent border-none focus:outline-none text-sm text-text-highlight w-full placeholder:text-text-primary/50 uppercase tracking-widest font-medium"
              placeholder="Search components"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar border-b border-cabinet-border/10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`whitespace-nowrap px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-full ${
              activeFilter === cat
                ? 'bg-category-selected text-text-highlight shadow-[0_0_10px_rgba(110,135,235,0.4)]'
                : 'bg-layer-1 text-text-primary hover:text-text-highlight hover:bg-layer-2'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {loading ? (
          <div className="text-center text-text-primary text-xs uppercase tracking-widest mt-10">
            Loading database...
          </div>
        ) : (
          <>
            {filteredComponents.map((c) => (
              <div
                key={c.id}
                draggable
                onDragStart={(e) => onDragStart(e, c)}
                onDragEnd={onDragEnd}
                className="bg-[#18181A] border border-white/5 p-5 rounded-2xl cursor-grab active:cursor-grabbing hover:bg-[#202022] hover:border-white/10 transition-colors duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-[#C1C3BE] uppercase tracking-[0.15em] pr-2 truncate">
                    {c.brand.replace(/^visit the /i, '').replace(/^brand:\s*/i, '').replace(/\s*store$/i, '')}
                  </span>
                  <span className="text-xs font-mono font-medium text-[#D4D4D4] shrink-0">
                    ₹{c.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <h3 className="text-sm font-medium tracking-tight text-white mb-2 line-clamp-2 leading-snug">
                  {getShortName(c.name)}
                </h3>
                {c.summary && (
                  <div className="text-[10px] font-medium text-[#8F9BAC] uppercase tracking-wider truncate">
                    {c.summary}
                  </div>
                )}
              </div>
            ))}
            {filteredComponents.length === 0 && (
              <div className="text-center text-text-primary text-xs uppercase tracking-widest mt-10">
                No components found.
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
