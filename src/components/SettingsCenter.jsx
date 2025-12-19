import React from 'react';
import { X, Settings } from 'lucide-react';

const SettingsCenter = ({ isOpen, onClose, appSettings, setAppSettings }) => {
  if (!isOpen) return null;

  // 封裝開關按鈕 UI
  const Toggle = ({ value, onToggle }) => (
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full border-2 border-black transition-all relative ${value ? 'bg-green-600' : 'bg-gray-400'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white border border-black rounded-full transition-all ${value ? 'left-6' : 'left-0.5'}`} />
    </button>
  );

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#f4e4bc] w-full max-w-xs border-4 border-[#2c1810] shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
        
        {/* Header */}
        <div className="bg-[#2c1810] p-3 flex justify-between items-center border-b-4 border-black">
          <h2 className="text-[#ffd700] font-black italic tracking-widest flex items-center gap-2 text-xs">
            <Settings size={16} /> SYSTEM SETTINGS
          </h2>
          <button onClick={onClose} className="text-white hover:rotate-90 transition-transform">
            <X size={20} />
          </button>
        </div>

        {/* 設定內容 */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <h4 className="font-bold text-[#2c1810] text-sm text-left">顯示補給建議</h4>
              <p className="text-[10px] text-[#8b4513] text-left">開啟後將在行程卡顯示分潤連結</p>
            </div>
            <Toggle 
              value={appSettings?.showSupplies} 
              onToggle={() => setAppSettings({ ...appSettings, showSupplies: !appSettings.showSupplies })} 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#2c1810]">
          <button 
            onClick={onClose}
            className="w-full bg-[#f4e4bc] text-[#2c1810] py-2 font-black border-b-4 border-black active:border-b-0 active:translate-y-1 transition-all"
          >
            完成設定
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsCenter;