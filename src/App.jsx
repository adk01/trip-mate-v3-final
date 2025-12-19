import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ItineraryPage from './pages/ItineraryPage';
import HomePage from './pages/HomePage'; 
import { Compass } from 'lucide-react';
import SettingsCenter from './components/SettingsCenter'; 

// ==============================================
// 1. 第一階段：載入畫面 (SplashScreen)
// ==============================================
const SplashScreen = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(onFinish, 800);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  if (fading) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4a3528] via-[#2c1810] to-[#1a0f0a] transition-opacity duration-800 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{backgroundImage: 'radial-gradient(#f4e4bc 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-[#f4e4bc] rounded-full blur-xl opacity-20 animate-pulse"></div>
        <div className="relative w-28 h-28 bg-[#f4e4bc] rounded-3xl border-4 border-[#8b4513] flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-bounce">
          <Compass size={60} className="text-[#8b4513]" strokeWidth={2} />
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-[#f4e4bc] tracking-[0.2em] mb-3 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" style={{ fontFamily: 'monospace' }}>
        TRIP MATE
      </h1>
      <div className="flex items-center gap-3 mb-10">
        <div className="h-[1px] w-8 bg-[#8b4513]/50"></div>
        <p className="text-[#d4c49c] text-sm tracking-widest font-bold">你的旅遊小幫手</p>
        <div className="h-[1px] w-8 bg-[#8b4513]/50"></div>
      </div>
      <div className="w-48 h-1.5 bg-[#1a0f0a] rounded-full overflow-hidden border border-[#8b4513]/30 shadow-inner">
        <div className="h-full bg-gradient-to-r from-[#8b4513] via-[#f4e4bc] to-[#8b4513] animate-[shimmer_2s_infinite]" style={{width: '100%', backgroundSize: '200% 100%'}}></div>
      </div>
      <p className="mt-2 text-[#8b4513] text-[10px] animate-pulse">LOADING RESOURCES...</p>
    </div>
  );
};

// ==============================================
// 2. 主程式入口 (App)
// ==============================================
function App() {
  const [gameState, setGameState] = useState(() => {
    return sessionStorage.getItem('hasLoaded') ? 'MENU' : 'SPLASH';
  });

// 🟢 1. 初始化設定：優先從瀏覽器記憶體 (localStorage) 讀取
const [appSettings, setAppSettings] = useState(() => {
  const saved = localStorage.getItem('dodo_settings');
  return saved ? JSON.parse(saved) : { showSupplies: true, enableXpPopups: true };
});

// 🟢 2. 監聽設定變化：只要 appSettings 變動，就自動存入記憶體
useEffect(() => {
  localStorage.setItem('dodo_settings', JSON.stringify(appSettings));
}, [appSettings]);

// 🟢 3. 原有的 gameState 狀態 (保留不變)
const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (gameState === 'MENU') {
      sessionStorage.setItem('hasLoaded', 'true');
      window.history.replaceState({ state: 'menu' }, '', window.location.pathname);
    }
    
    if (gameState === 'GAME') {
      window.history.pushState({ state: 'game' }, '', window.location.pathname);
    }

    const handlePopState = () => {
      if (gameState === 'GAME') {
        setGameState('MENU');
        window.history.pushState({ state: 'menu' }, '', window.location.pathname);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [gameState]);

  return (
    <Router>
      {gameState === 'SPLASH' && (
        <SplashScreen onFinish={() => setGameState('MENU')} />
      )}

      {/* 🟢 2. 修改：傳入 onOpenSettings 功能給 HomePage */}
      {gameState === 'MENU' && (
        <HomePage 
          onStart={() => setGameState('GAME')} 
          onOpenSettings={() => setIsSettingsOpen(true)} 
        />
      )}

      {/* 🟢 3. 修改：將 appSettings 傳入行程頁面，這樣開關才有用 */}
      {gameState === 'GAME' && (
  <div className="animate-fade-in">
    <Routes>
      {/* 🟢 修改重點：在這裡把 appSettings 傳進去 */}
      <Route 
        path="/" 
        element={
          <ItineraryPage 
            appSettings={appSettings} 
            onOpenSettings={() => setIsSettingsOpen(true)} 
          />
        } 
      />
      <Route 
        path="/plan" 
        element={
          <ItineraryPage 
            appSettings={appSettings} 
            onOpenSettings={() => setIsSettingsOpen(true)} 
          />
        } 
      />
    </Routes>
  </div>
)}

      {/* 🟢 4. 新增：掛載 SettingsCenter 面板本體 */}
      <SettingsCenter 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        appSettings={appSettings}
        setAppSettings={setAppSettings}
        // 為了避免報錯，我們先傳入空的旅程資料
        tripMeta={{ title: "" }}
        updateTripMeta={() => {}}
      />
      
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </Router>
  );
}

export default App;