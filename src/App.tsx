import React, { useState } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { Cabinet } from './components/Cabinet';
import { RightPanel } from './components/RightPanel';
import { CheckoutPage } from './components/CheckoutPage';
import { BuildState, ComponentType, PCComponent } from './types';

const INITIAL_BUILD: BuildState = {
  CABINET: null,
  MOTHERBOARD: null,
  CPU: null,
  GPU: null,
  SSD: null,
  PSU: null,
  RAM: [null, null, null, null],
};

export default function App() {
  const [build, setBuild] = useState<BuildState>(INITIAL_BUILD);
  const [activeDragType, setActiveDragType] = useState<ComponentType | null>(null);
  const [isCheckout, setIsCheckout] = useState(false);

  const handleDragStart = (e: React.DragEvent, component: PCComponent) => {
    e.dataTransfer.setData('component', JSON.stringify(component));
    setActiveDragType(component.type);
  };

  const handleDragEnd = () => {
    setActiveDragType(null);
  };

  const handleDrop = (component: PCComponent, index?: number) => {
    setBuild((prev) => {
      const newState = { ...prev };
      if (component.type === 'RAM' && typeof index === 'number') {
        const newRam = [...prev.RAM];
        newRam[index] = component;
        newState.RAM = newRam;
      } else if (component.type !== 'RAM') {
        newState[component.type] = component;
      }
      return newState;
    });
  };

  const handleRemove = (type: ComponentType, index?: number) => {
    setBuild((prev) => {
      const newState = { ...prev };
      if (type === 'RAM' && typeof index === 'number') {
        const newRam = [...prev.RAM];
        newRam[index] = null;
        newState.RAM = newRam;
      } else if (type !== 'RAM') {
        newState[type] = null;
      }
      return newState;
    });
  };

  const handleReset = () => {
    setBuild(INITIAL_BUILD);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-base text-text-primary font-sans p-4 gap-4">
      {isCheckout ? (
        <CheckoutPage build={build} onBack={() => setIsCheckout(false)} />
      ) : (
        <>
          <LeftPanel onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
          <Cabinet 
            build={build} 
            onDrop={handleDrop} 
            onRemove={handleRemove} 
            activeDragType={activeDragType} 
          />
          <RightPanel build={build} onReset={handleReset} onCheckout={() => setIsCheckout(true)} />
        </>
      )}
    </div>
  );
}
