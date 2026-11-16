import { Cpu } from 'lucide-react';
import { useEffect, useState } from 'react';

const STATUS_MESSAGES = [
  'Checking our parts database…',
  'Finding the best parts for your budget…',
  'Making every rupee count…',
  'Matching the right CPU and GPU…',
  'Checking if all parts fit together…',
  'Getting maximum speed for your money…',
  'Picking the best components for you…',
  'Putting your final PC list together…',
];

const STATUS_INTERVAL_MS = 2500;

/**
 * Playful "work in progress" copy. These are not real reasoning steps, just
 * status messages shown while the assistant request is in flight.
 */
export function ChatLoadingIndicator() {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStatusIndex((current) => (current + 1) % STATUS_MESSAGES.length);
    }, STATUS_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[3rem] items-center gap-3" role="status">
      <span className="sr-only">Preparing your PC recommendation…</span>

      {/* Mini chip with activity LEDs */}
      <div
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cabinet-border/20 bg-layer-2 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]"
        aria-hidden="true"
      >
        <Cpu className="h-4 w-4 text-category-selected/90" />
        <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-price-total animate-pulse" />
        <span className="absolute -bottom-1 -left-1 h-1 w-1 rounded-full bg-category-selected/70 animate-pulse [animation-delay:400ms]" />
      </div>

      {/* Fixed height keeps the bubble from resizing as messages rotate */}
      <div className="flex h-12 min-w-0 flex-col justify-center gap-1.5" aria-hidden="true">
        <span key={statusIndex} className="chat-status-enter text-[11px] leading-relaxed text-text-primary">
          {STATUS_MESSAGES[statusIndex]}
        </span>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-1 w-1 rounded-full bg-category-selected/60 animate-pulse"
              style={{ animationDelay: `${dot * 180}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
