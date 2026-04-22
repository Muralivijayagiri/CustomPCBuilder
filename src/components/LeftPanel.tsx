import { Search } from 'lucide-react';
import { ComponentType, PCComponent } from '../types';
import { useState } from 'react';
import { componentsData } from '../data';

interface LeftPanelProps {
  onDragStart: (e: React.DragEvent, component: PCComponent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const CATEGORIES: ComponentType[] = ['MOTHERBOARD', 'CPU', 'RAM', 'SSD', 'GPU', 'PSU', 'CABINET'];

export function LeftPanel({ onDragStart, onDragEnd }: LeftPanelProps) {
  const [activeFilter, setActiveFilter] = useState<ComponentType>('MOTHERBOARD');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredComponents = componentsData.filter(
    (c) =>
      c.type === activeFilter &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <aside className="w-1/4 flex flex-col bg-panel border border-cabinet-border/10 h-full rounded-3xl overflow-hidden shadow-lg">
      <div className="p-6 border-b border-cabinet-border/10">
        <div className="flex items-center bg-layer-1 border border-cabinet-border/10 focus-within:border-category-selected transition-colors px-4 py-3 rounded-full">
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
        {filteredComponents.map((c) => (
          <div
            key={c.id}
            draggable
            onDragStart={(e) => onDragStart(e, c)}
            onDragEnd={onDragEnd}
            className="bg-[#18181A] border border-white/10 p-5 rounded-2xl cursor-grab active:cursor-grabbing hover:bg-[#282A29] hover:border-[#ACB5D2]/30 hover:shadow-[0_2px_8px_rgba(172,181,210,0.05)] transition-colors duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-[#C1C3BE] uppercase tracking-[0.15em]">
                {c.brand}
              </span>
              <span className="text-xs font-mono text-[#C1C3BE]">
                ₹{c.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <h3 className="text-sm font-medium tracking-tight text-[#D4D4D4] mb-1">
              {c.name}
            </h3>
            <p className="text-[10px] text-[#C1C3BE] uppercase tracking-wider">
              {c.specs}
            </p>
          </div>
        ))}
        {filteredComponents.length === 0 && (
          <div className="text-center text-text-primary text-xs uppercase tracking-widest mt-10">
            No components found.
          </div>
        )}
      </div>
    </aside>
  );
}
