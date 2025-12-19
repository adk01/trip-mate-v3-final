import React, { useState } from 'react';
import { User, X, Shield, Star, Zap, Ticket } from 'lucide-react';

const ProfileModal = ({ userData, onClose }) => {
  const [promoCode, setPromoCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  if (!userData) return null;

  const handleRedeem = () => {
    if (!promoCode.trim()) return;
    setIsRedeeming(true);
    setTimeout(() => {
      alert(`📜 咒語「${promoCode}」詠唱完畢！(功能開發中)`);
      setPromoCode('');
      setIsRedeeming(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto bg-[#2c1810] border-4 border-[#f4e4bc] p-6 shadow-2xl animate-in fade-in zoom-in duration-300 no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-[120] bg-[#8b4513] border-2 border-[#f4e4bc] p-1 rounded-full text-[#f4e4bc] hover:rotate-90 transition-all shadow-lg active:scale-90"
        >
          <X size={20} />
        </button>

        {/* 1. 頭像與稱號 */}
        <div className="text-center mb-6 pt-2">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <div className="absolute inset-0 border-2 border-dashed border-yellow-500/30 rounded-full animate-spin-slow" />
            <div className="relative w-full h-full rounded-full border-4 border-[#f4e4bc] bg-[#4a3528] flex items-center justify-center overflow-hidden">
              <User size={50} className="text-[#f4e4bc] mt-2" />
            </div>
            {/* Lv 標籤保留裝飾字，因為字數少且需要風格 */}
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-[#2c1810] px-1.5 py-0.5 rounded border-2 border-[#2c1810] text-[10px] font-black uppercase shadow-lg font-eng">
              Lv.{userData.level}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#f4e4bc] mb-1 tracking-tight font-chi">
            {userData.name}
          </h2>
          <div className="inline-block bg-[#f4e4bc] px-3 py-0.5 rounded-full shadow-inner">
            <p className="text-[#8b4513] text-[10px] font-bold tracking-[0.1em] font-chi">
              {userData.title}
            </p>
          </div>
        </div>

        {/* 2. 等級進度條 */}
        <div className="mb-6 space-y-2 px-2">
          {/* 修改：改用 font-chi (思源宋體) 提升 "Experience" 的辨識度 */}
          <div className="flex justify-between items-center text-[10px] text-yellow-500 font-bold uppercase tracking-wider font-chi">
            <span className="flex items-center gap-1">
              <Zap size={12} /> Exp 經驗值
            </span>
            <span className="font-eng italic text-xs">
              {Math.min(userData.stats.exp, 100)}%
            </span>
          </div>
          <div className="w-full h-3 bg-black/60 rounded-full border-2 border-[#f4e4bc]/20 overflow-hidden p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-700 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(userData.stats.exp, 100)}%` }}
            />
          </div>
        </div>

        {/* 3. 優惠碼輸入框 */}
        <div className="mb-8 px-2">
          {/* 修改：標籤文字改用易讀字體 */}
          <p className="text-[#8b4513] text-[10px] font-bold uppercase tracking-[0.1em] mb-2 font-chi">
            Redeem Secret Scroll 兌換卷軸
          </p>
          <div className="relative group">
            <div className="absolute inset-0 bg-yellow-500/5 rounded blur-sm group-focus-within:bg-yellow-500/10 transition-all" />
            <div className="relative flex items-center bg-black/40 border-2 border-[#f4e4bc]/30 p-1 group-focus-within:border-[#ffd700]/50 transition-all">
              <div className="pl-2 text-[#f4e4bc]/30">
                <Ticket size={16} />
              </div>
              {/* 修改：輸入框內容改用易讀字體，避免輸入時看不清楚 */}
              <input
                type="text"
                placeholder="輸入優惠代碼..."
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
                className="w-full bg-transparent p-2 text-[#f4e4bc] placeholder-[#f4e4bc]/30 font-chi text-sm outline-none tracking-widest uppercase"
              />
              <button
                onClick={handleRedeem}
                disabled={!promoCode || isRedeeming}
                className={`pr-2 font-bold text-[10px] uppercase tracking-tighter transition-colors font-eng ${
                  promoCode
                    ? 'text-yellow-500 hover:text-yellow-400 cursor-pointer'
                    : 'text-gray-600 cursor-not-allowed'
                }`}
              >
                {isRedeeming ? '...' : 'Redeem'}
              </button>
            </div>
          </div>
        </div>

        {/* 4. 底部：統計數據 (加入中文) */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#f4e4bc]/10">
          <div
            onClick={() =>
              alert(`🏆 已解鎖成就：\n${userData.achievements.join('\n')}`)
            }
            className="bg-black/30 p-2 rounded-sm border border-white/5 text-center group hover:border-[#f4e4bc]/30 transition-colors cursor-pointer active:scale-95"
          >
            <Shield
              size={14}
              className="mx-auto text-[#8b4513] group-hover:text-[#f4e4bc] transition-colors mb-1"
            />
            {/* 修改：改用 font-chi 並加入中文，字號微調 */}
            <p className="text-[#8b4513] text-[10px] font-bold uppercase font-chi tracking-widest">
              Achievements 成就
            </p>
            {/* 數字保留 font-eng，因為是裝飾性大數字 */}
            <p className="text-[#f4e4bc] text-xl font-bold italic font-eng mt-1">
              {userData.achievements.length}
            </p>
          </div>

          <div
            onClick={() =>
              alert('🔮 今日運勢占卜：\n你今天的旅行運氣爆棚，去買張樂透吧！')
            }
            className="bg-black/30 p-2 rounded-sm border border-white/5 text-center group hover:border-[#f4e4bc]/30 transition-colors cursor-pointer active:scale-95"
          >
            <Star
              size={14}
              className="mx-auto text-yellow-600 group-hover:text-yellow-400 transition-colors mb-1"
            />
            {/* 修改：改用 font-chi 並加入中文，字號微調 */}
            <p className="text-[#8b4513] text-[10px] font-bold uppercase font-chi tracking-widest">
              Fortune 運勢
            </p>
            {/* 數字保留 font-eng */}
            <p className="text-yellow-500 text-xl font-bold italic font-eng mt-1">
              {userData.stats.luck}
            </p>
          </div>
        </div>

        <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </div>
  );
};

export default ProfileModal;
