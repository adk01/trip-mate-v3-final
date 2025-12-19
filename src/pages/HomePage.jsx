import React, { useState } from 'react';
import { Play, PlusCircle, BookOpen, User, Star, Settings } from 'lucide-react';
import ProfileModal from '../components/ProfileModal';

const HomePage = ({ onStart, onOpenSettings }) => {
  const [showProfile, setShowProfile] = useState(false);

  const userData = {
    name: '傳說中的冒險者',
    level: 1,
    title: '初出茅廬的旅人',
    stats: { exp: 35, strength: 85, intelligence: 70, luck: 99 },
    achievements: ['第一步', '古蹟愛好者'],
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#1a0f0a]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Noto+Serif+TC:wght@400;700;900&display=swap');
        .font-eng { font-family: 'Cinzel Decorative', cursive; }
        .font-chi { font-family: 'Noto Serif TC', serif; }
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        .animate-map { animation: slow-zoom 40s ease-in-out infinite; }
      `}</style>

      {/* 背景圖 */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-map"
        style={{
          backgroundImage: 'url("/assets/rpg-map-v2.jpg")',
          filter: 'brightness(0.6) sepia(0.2)',
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* 左上角齒輪 (縮小：w-10 -> w-9) */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenSettings();
          }}
          className="w-9 h-9 bg-[#4a3528]/80 border-2 border-[#f4e4bc]/60 rounded-full flex items-center justify-center text-[#f4e4bc] hover:rotate-90 transition-all active:scale-90 shadow-lg"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* 整體內容區塊 (縮小上方 margin) */}
      <div className="relative z-10 flex flex-col items-center mt-4">
        {/* 使用者頭像 (縮小：w-20 -> w-16) */}
        <div
          className="relative group cursor-pointer mb-5"
          onClick={() => setShowProfile(true)}
        >
          <div className="absolute -inset-2 border border-[#f4e4bc]/20 rounded-full opacity-50" />

          <div className="w-16 h-16 rounded-full border-[3px] border-[#f4e4bc] bg-[#2c1810] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(244,228,188,0.3)] group-hover:scale-110 transition-transform">
            <User size={32} className="text-[#f4e4bc] mt-2" />
            <div className="absolute bottom-0 w-full bg-black/70 py-0.5 flex justify-center">
              <span className="font-eng text-[9px] text-yellow-500 font-bold leading-none">
                Lv.{userData.level}
              </span>
            </div>
          </div>
        </div>

        {/* 標題區 (縮小：text-6xl -> text-5xl) */}
        <div className="text-center mb-6 select-none">
          <h1 className="font-eng text-5xl font-black text-[#f4e4bc] tracking-widest drop-shadow-[0_4px_0_rgba(139,69,19,1)]">
            TRIP MATE
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2 opacity-60">
            <Star size={10} className="text-yellow-500 fill-yellow-500" />
            <p className="font-eng text-[10px] text-[#f4e4bc] tracking-[0.2em] uppercase">
              Legendary Journey
            </p>
            <Star size={10} className="text-yellow-500 fill-yellow-500" />
          </div>
        </div>

        {/* 選單按鈕區 (縮小：max-w-360 -> max-w-[260px], gap-3.5 -> gap-3) */}
        <div className="flex flex-col gap-3 w-full max-w-[260px]">
          {[
            {
              icon: <Play size={14} fill="currentColor" />,
              label: '繼續冒險',
              term: 'CONTINUE',
              action: onStart,
              color: 'bg-[#8b4513]',
            },
            {
              icon: <PlusCircle size={14} />,
              label: '開啟新冒險',
              term: 'NEW QUEST',
              action: null,
              color: 'bg-[#4a3528]',
            },
            {
              icon: <BookOpen size={14} />,
              label: '英雄日誌',
              term: 'JOURNAL',
              action: null,
              color: 'bg-[#4a3528]',
            },
          ].map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.action}
              className={`group relative ${btn.color} border-2 border-[#f4e4bc]/80 p-3 flex items-center justify-between hover:brightness-125 transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-[0_4px_0_rgba(30,15,10,1)] active:shadow-none`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[#f4e4bc]">{btn.icon}</span>
                {/* 縮小字體：text-lg -> text-base */}
                <span className="font-chi text-[#f4e4bc] text-base font-bold tracking-wider whitespace-nowrap">
                  {btn.label}
                </span>
              </div>
              <span className="font-eng text-[#f4e4bc]/40 text-[9px] font-bold ml-2">
                {btn.term}
              </span>
            </button>
          ))}
        </div>
      </div>

      {showProfile && (
        <ProfileModal
          userData={userData}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* 裝飾邊角 (縮小：w-32 -> w-24) */}
      <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-[#f4e4bc]/10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-[#f4e4bc]/10 pointer-events-none" />
    </div>
  );
};

export default HomePage;
