import { BuildState } from '../types';
import { ArrowLeft, Cpu, ExternalLink } from 'lucide-react';
import { getShortName } from '../utils/specMapper';

interface CheckoutPageProps {
  build: BuildState;
  onBack: () => void;
}

export function CheckoutPage({ build, onBack }: CheckoutPageProps) {
  const activeItems = [
    build.CABINET,
    build.MOTHERBOARD,
    build.CPU,
    build.GPU,
    build.SSD,
    build.PSU,
    ...build.RAM.filter(Boolean)
  ].filter(Boolean);

  const getStoreConfig = (url?: string) => {
    if (!url) return null;
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('amazon') || lowerUrl.includes('amzn')) {
      return { 
        name: 'Amazon', 
        bg: 'bg-[#232F3E]', 
        text: 'text-white', 
        border: 'border-[#FF9900]/50', 
        hover: 'hover:bg-[#FF9900] hover:text-[#232F3E] hover:border-[#FF9900]' 
      };
    }
    
    if (lowerUrl.includes('flipkart')) {
      return { 
        name: 'Flipkart', 
        bg: 'bg-[#2874F0]', 
        text: 'text-white', 
        border: 'border-[#FFE11B]/50', 
        hover: 'hover:bg-[#FFE11B] hover:text-[#000000] hover:border-[#FFE11B]' 
      };
    }
    
    return { 
      name: 'Buy Now', 
      bg: 'bg-layer-2', 
      text: 'text-text-highlight', 
      border: 'border-cabinet-border/30', 
      hover: 'hover:bg-category-selected hover:text-white' 
    };
  };

  return (
    <div className="w-full h-full flex flex-col bg-panel border border-cabinet-border/10 rounded-3xl overflow-hidden shadow-lg p-8 max-w-5xl mx-auto relative">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-3 bg-layer-1 hover:bg-layer-2 rounded-full border border-cabinet-border/10 text-text-primary hover:text-text-highlight transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-highlight uppercase">Build Manifest</h1>
          <p className="text-[10px] text-text-primary uppercase tracking-[0.2em] mt-1">Get your components</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 space-y-4 no-scrollbar">
        {activeItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-primary/50 space-y-4">
            <Cpu className="w-16 h-16 opacity-20" />
            <p className="uppercase tracking-[0.2em] text-xs">No components in manifest</p>
          </div>
        ) : (
          activeItems.map((item, idx) => {
            const store = getStoreConfig(item?.buy_link);
            return (
              <div key={`${item?.id}-${idx}`} className="flex items-center bg-layer-1 border border-cabinet-border/10 p-5 rounded-2xl gap-6 hover:border-cabinet-border/30 transition-colors">
                <div className="w-24 h-24 bg-layer-2 border border-cabinet-border/10 rounded-xl flex flex-col items-center justify-center p-2 shrink-0">
                   {item?.image_url ? (
                     <img src={item.image_url} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-screen" />
                   ) : (
                      <span className="text-[10px] font-bold text-cabinet-border/40 uppercase tracking-widest">{item?.type}</span>
                   )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-category-selected uppercase tracking-[0.15em]">
                      {item?.brand}
                    </span>
                    {store ? (
                      <a 
                        href={item?.buy_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all duration-300 font-bold text-[10px] uppercase tracking-wider shadow-sm ml-4 shrink-0 ${store.bg} ${store.text} ${store.border} ${store.hover}`}
                      >
                        {store.name}
                        <ExternalLink className="w-3.5 h-3.5 mb-0.5" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-text-primary/30 uppercase tracking-widest italic border border-cabinet-border/10 px-4 py-2 rounded-lg ml-4 shrink-0">
                        No Link Available
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-medium tracking-tight text-text-highlight mb-2 truncate">
                    {getShortName(item?.name || '')}
                  </h3>
                  {item?.summary && (
                    <div className="text-[11px] font-medium text-[#8F9BAC] uppercase tracking-widest leading-relaxed truncate">
                      {item.summary}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
