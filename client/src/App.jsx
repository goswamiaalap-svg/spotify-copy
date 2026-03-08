import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Mobile App wrapper
import MobileApp from './components/MobileApp';
import PremiumDesktopLayout from './components/premium/DesktopLayout';

function AppInner() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // ── MOBILE: completely different layout ──
  if (isMobile) {
    return <MobileApp />;
  }

  // ── DESKTOP: PREMIUM NEW UI ──
  return <PremiumDesktopLayout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
