import { Search, RefreshCw } from 'lucide-react';
import { ComponentType, PCComponent } from '../types';
import React, { useState, useEffect } from 'react';
import { fetchDbComponents, refreshCategory } from '../services/api';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadComponents = () => {
    fetchDbComponents()
      .then(data => {
        setComponentsData(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadComponents();
  }, []);

  const handleRefreshCategory = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const mappedCategory = activeFilter === 'MOTHERBOARD' ? 'Motherboard' 
        : activeFilter === 'CABINET' ? 'Cabinet' 
        : activeFilter === 'SSD' ? 'Unknown' // not valid for now
        : activeFilter;
      const result = await refreshCategory(mappedCategory);
      setToastMessage(`✓ Updated ${result.inserted + result.total} products in ${result.category}`);
      loadComponents();
    } catch (error: any) {
      setToastMessage(`✗ Refresh failed: ${error.message}`);
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const filteredComponents = componentsData.filter(
    (c) =>
      c.type === activeFilter &&
      ((c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.brand || '').toLowerCase().includes(searchQuery.toLowerCase()))
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
          <button
            onClick={handleRefreshCategory}
            disabled={isRefreshing}
            className={`p-3 bg-layer-1 border border-cabinet-border/10 rounded-full text-text-primary hover:text-text-highlight hover:bg-layer-2 transition-colors flex-shrink-0 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Refresh current category from Amazon"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
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
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-[#f0f0f0] uppercase tracking-[0.1em]">
                    {c.brand.replace(/^visit the /i, '').replace(/^brand:\s*/i, '').replace(/\s*store$/i, '')}
                  </span>
                  <span className="text-[13px] font-mono font-medium text-[#f0f0f0]">
                    ₹{c.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <h3 className="text-base font-medium text-white mb-2 line-clamp-2">
                  {getShortName(c.name)}
                </h3>
                {c.displaySpecs && c.displaySpecs.length > 0 && (
                  <div className="text-[#a0a0a0] text-[13px] truncate">
                    {c.displaySpecs.slice(0, 4).map(s => s.value).join(' / ')}
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#18181A] text-white px-6 py-4 rounded-xl shadow-2xl border border-white/10 text-sm font-medium tracking-wide z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {toastMessage}
        </div>
      )}
    </aside>
  );
}
