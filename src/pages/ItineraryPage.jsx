import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../supabaseClient';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  MapPin,
  Utensils,
  Train,
  Camera,
  Bed,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  DollarSign,
  Briefcase,
  Sun,
  X,
  Share,
  Cloud,
  CloudOff,
  AlertCircle,
  Sword,
  Shield,
  Scroll,
  Gem,
  Navigation,
  User,
  Map as MapIcon,
  Eye,
  LocateFixed,
  ChevronDown,
  ChevronUp,
  Compass,
  Backpack,
  CheckSquare,
  Square,
  Check,
  Settings,
  FileDown,
  FileText,
  Trophy,
  Footprints,
  Bus,
  Car,
  Bike,
  Coins,
  MoreVertical,
  TrendingDown,
  LogOut,
  Gift, // 🎁 新增禮物圖示
  ExternalLink,
} from 'lucide-react';

import {
  LOCATION_DB,
  getCoords,
  formatDbItem,
  TYPE_CONFIG,
  TRANSPORT_MODES,
} from '../utils';

// ==========================================
// 0. 內嵌樣式
// ==========================================
// ==========================================
// 0. 內嵌樣式
// ==========================================
const INJECTED_STYLES = `
  .leaflet-container { width: 100%; height: 100%; z-index: 1; }
  
  /* RPG 地圖背景風格 */
  .rpg-map-bg {
    background-color: #d4c49c;
    background-image: 
      linear-gradient(#8b4513 1px, transparent 1px),
      linear-gradient(90deg, #8b4513 1px, transparent 1px),
      url('https://www.transparenttextures.com/patterns/aged-paper.png');
    background-size: 40px 40px, 40px 40px, auto;
    background-blend-mode: overlay;
    box-shadow: inset 0 0 100px rgba(44, 24, 16, 0.5);
  }

  /* 🟢 iOS 日期欄位強制靠左修正 (核彈級解法) */
  input[type="date"] {
    text-align: left;
    -webkit-appearance: none;
    display: block;
  }
  input[type="date"]::-webkit-date-and-time-value {
    text-align: left;
    margin-inline-start: 0;
  }

  .user-pulse-wrapper {
    background: transparent !important;
    border: none !important;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .user-pulse-dot {
    width: 16px;
    height: 16px;
    background-color: #007bff;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
    animation: pulse-ring 2s infinite;
  }
  @keyframes pulse-ring {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(0, 123, 255, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); }
  }

  /* 🟢 新增：輕微跳動動畫，用於未領取的道具 */
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }
  .animate-bounce-slow {
    animation: bounce-slow 2s infinite;
  }
  
  .pixel-pin-icon { background: transparent; border: none; }
  .pin-wrapper { position: relative; width: 20px; height: 40px; transition: transform 0.2s; }
  .pin-active { transform: scale(1.2) translateY(-5px); z-index: 100; }
  .pin-head { width: 20px; height: 20px; background: #ef4444; border: 2px solid #2c1810; box-shadow: inset -2px -2px 0 rgba(0,0,0,0.2); border-radius: 50%; position: relative; z-index: 2; }
  .pin-needle { width: 4px; height: 20px; background: #9ca3af; border: 1px solid #2c1810; margin: -2px auto 0; position: relative; z-index: 1; }
  .pin-shadow { width: 10px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; margin: -2px auto 0; }
  
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
  .animate-slide-up { animation: slide-up 0.3s ease-out; }
  
  @keyframes slide-down-reveal { from { opacity: 0; transform: translateY(-10px); max-height: 0; } to { opacity: 1; transform: translateY(0); max-height: 200px; } }
  .animate-slide-down { animation: slide-down-reveal 0.3s forwards ease-out; overflow: hidden; }
`;

// ==========================================
// 1. 設定與資料
// ==========================================

const firebaseConfig = {
  apiKey: 'AIzaSyAmfMiQXO3tZau4mpRtv4GZzbkqdiqefNY',
  authDomain: 'dodotravel.firebaseapp.com',
  projectId: 'dodotravel',
  storageBucket: 'dodotravel.firebasestorage.app',
  messagingSenderId: '817851981370',
  appId: '1:817851981370:web:79f92780bc1e723eec9f03',
  measurementId: 'G-Y1JWWC1VH',
};

let db = null;
try {
  if (window.firebase) {
    if (!window.firebase.apps.length)
      window.firebase.initializeApp(firebaseConfig);
    db = window.firebase.firestore();
  }
} catch (e) {
  console.error('Firebase init warning (Local Mode):', e);
}

const TRIP_ID = 'shared_trip_2025_kansai_v5_final';

const INITIAL_TRIP_META = {
  title: '關西大冒險',
  startDate: '2025-12-24',
  dayCount: 7,
  totalBudget: 100000,
  coverImage:
    'https://images.unsplash.com/photo-1559928036-7c907a972c38?q=80&w=1000&auto=format&fit=crop',
};

const DEFAULT_ACTIVITIES = [];
const DEFAULT_BACKPACK = [];
const INITIAL_USER = { level: 1, xp: 0, nextLevelXp: 100 };
const INITIAL_DATA = {
  meta: INITIAL_TRIP_META,
  activities: DEFAULT_ACTIVITIES,
  backpack: DEFAULT_BACKPACK,
  user: INITIAL_USER,
};

const STYLES = {
  // 🟢 修正重點：加回 appearance-none，這對手機版強制靠左非常重要！
  input:
    'w-full h-10 bg-[#fffcf5] border-2 border-[#8b4513] px-3 text-sm text-[#2c1810] font-bold focus:outline-none box-border block text-left leading-[36px] appearance-none',
  
  label: 'text-[10px] font-bold text-[#8b4513] block mb-1',
  modalOverlay:
    'fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4',
  modalContent:
    'bg-[#f4e4bc] w-full sm:max-w-md border-4 border-black p-4 shadow-2xl animate-slide-up relative max-h-[90vh] overflow-y-auto',
  
  btnPrimary:
    'w-full bg-[#8b4513] hover:bg-[#a0522d] text-[#f4e4bc] font-bold py-2 border-4 border-[#2c1810] mt-4 shadow-[2px_2px_0_0_#2c1810] active:shadow-none active:translate-y-1 tracking-widest',
  
  btnIcon:
    'bg-[#2c1810] text-[#f4e4bc] p-1.5 rounded-sm border border-[#5c4835] active:scale-95 flex items-center justify-center',
};

const BudgetStatsModal = ({ isOpen, onClose, activities, totalBudget }) => {
  if (!isOpen) return null;

  const stats = activities.reduce(
    (acc, item) => {
      const type = item.type || 'other';
      const cost = Number(item.cost) || 0;
      acc[type] = (acc[type] || 0) + cost;
      acc.total = (acc.total || 0) + cost;
      return acc;
    },
    { total: 0 }
  );

  const sortedStats = Object.keys(TYPE_CONFIG)
    .filter((type) => stats[type] > 0)
    .sort((a, b) => stats[b] - stats[a]);

  return (
    <div className={STYLES.modalOverlay} onClick={onClose}>
      <div className={STYLES.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#2c1810] p-3 border-b-4 border-[#f4e4bc] flex justify-between items-center">
          <h2 className="text-[#f4e4bc] font-bold flex items-center gap-2">
            <DollarSign size={20} /> 消費分析
          </h2>
          <button onClick={onClose} className="text-[#f4e4bc]">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-center p-4 bg-[#fffcf5] border-2 border-[#8b4513] rounded">
            <div className="text-xs text-[#8b4513] font-bold mb-1">
              目前總支出
            </div>
            <div
              className={`text-3xl font-bold ${
                stats.total > totalBudget ? 'text-red-600' : 'text-[#2c1810]'
              }`}
            >
              $ {stats.total.toLocaleString()}
            </div>
            {stats.total > totalBudget && (
              <div className="text-xs text-red-500 font-bold mt-1">
                ⚠️ 已超支！
              </div>
            )}
          </div>

          <div className="space-y-3">
            {sortedStats.map((type) => {
              const amount = stats[type];
              const percent = Math.min(
                Math.round((amount / stats.total) * 100),
                100
              );
              const config = TYPE_CONFIG[type];
              const Icon = config.icon;

              return (
                <div key={type} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded border border-black flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: config.color }}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs font-bold text-[#2c1810] mb-1">
                      <span>{config.label}</span>
                      <span>{amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-[#e6d6ac] rounded-full overflow-hidden border border-[#8b4513]/30">
                      <div
                        className="h-full"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: config.color,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const LeafletMap = ({
  activities,
  activeIndex,
  isToday,
  onMarkerClick,
  onAddActivity,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const userMarkerRef = useRef(null);
  const [userPos, setUserPos] = useState(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    try {
      const map = L.map(mapRef.current, { zoomControl: false }).setView(
        [34.6937, 135.5023],
        9
      );
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map);
      mapInstanceRef.current = map;

      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
          (err) => console.error('GPS Error:', err),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      }
    } catch (e) {
      console.error('Map Init Failed:', e);
    }
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userPos) return;

    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);

    const icon = L.divIcon({
      className: 'user-pulse-wrapper',
      html: '<div class="user-pulse-dot"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    userMarkerRef.current = L.marker(userPos, { icon }).addTo(map);
  }, [userPos]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    if (polylineRef.current) map.removeLayer(polylineRef.current);

    const latlngs = [];
    const bounds = L.latLngBounds();

    activities.forEach((act, idx) => {
      const coords = getCoords(act.location);
      if (coords) {
        latlngs.push(coords);
        bounds.extend(coords);
        const isActive = isToday && idx === activeIndex;

        const icon = L.divIcon({
          className: 'pixel-pin-icon',
          html: `
            <div class="pin-wrapper ${isActive ? 'pin-active' : ''}">
              <div class="pin-head"></div>
              <div class="pin-needle"></div>
              <div class="pin-shadow"></div>
            </div>
          `,
          iconSize: [20, 40],
          iconAnchor: [10, 38],
        });

        const m = L.marker(coords, { icon }).addTo(map);
        m.on('click', () => onMarkerClick(act.id));
        markersRef.current.push(m);
      }
    });

    if (latlngs.length > 0) {
      polylineRef.current = L.polyline(latlngs, {
        color: '#8b4513',
        weight: 3,
        dashArray: '5, 10',
      }).addTo(map);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [activities, activeIndex, isToday]);

  const flyToUser = () => {
    if (mapInstanceRef.current && userPos) {
      mapInstanceRef.current.flyTo(userPos, 16, { duration: 1.5 });
    } else {
      alert('正在抓取定位中...請稍候');
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full z-0" />
      <button
        onClick={flyToUser}
        className="absolute bottom-4 left-4 z-[400] bg-white p-2 rounded-full border-2 border-black shadow-lg active:scale-95"
      >
        <LocateFixed size={24} className="text-blue-600" />
      </button>
      <button
        onClick={onAddActivity}
        className="absolute bottom-6 right-5 z-[400] w-11 h-11 bg-blue-600 text-white rounded-full flex items-center justify-center border-4 border-black shadow-[0_4px_10px_rgba(0,0,0,0.3)] active:scale-95 transition-all hover:bg-blue-500 hover:scale-105"
      >
        <Plus size={28} strokeWidth={3} />
      </button>
    </div>
  );
};

const Header = ({
  trip,
  totalCost,
  isSyncing,
  onOpenBackpack,
  user,
  onOpenSettings,
  onOpenImport,
  onOpenStats,
  onGoHome,
}) => {
  const remainingBudget = (trip.totalBudget || 0) - totalCost;

  return (
    <div className="relative z-20 transition-all duration-300">
      <div className="absolute inset-0 bg-[#2c1810]" />
      <div
        className="absolute inset-0 bg-black/20 z-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23000000' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E\")",
        }}
      />
      <img
        src={trip.coverImage}
        alt="Cover"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        style={{ imageRendering: 'pixelated' }}
      />

      <div className="relative z-20 p-2 md:p-3 border-b-4 border-black">
        <div className="flex justify-between items-center gap-2">
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <button
                onClick={onGoHome}
                className="bg-red-800 text-white p-1 rounded-sm border border-red-950 shadow active:scale-95 mr-1"
              >
                <LogOut size={14} />
              </button>

              <h1 className="text-sm md:text-lg font-bold text-[#f4e4bc] drop-shadow-md truncate tracking-wider">
                {trip.title}
              </h1>
              <button
                onClick={onOpenBackpack}
                className="bg-[#8b4513] hover:bg-[#a0522d] text-[#f4e4bc] text-[10px] px-2 py-0.5 rounded-sm border border-[#5c4835] flex items-center gap-1 active:scale-95 transition-transform shrink-0 shadow-sm"
              >
                <Backpack size={10} /> 背包
              </button>
            </div>

            <div className="flex items-center gap-2 w-full max-w-[120px] md:max-w-[160px]">
              <span className="text-[#f4e4bc] text-[10px] font-bold shrink-0">
                Lv.{user.level}
              </span>
              <div className="h-1.5 flex-1 bg-black border border-[#5c4835] rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${(user.xp / user.nextLevelXp) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0 gap-1">
            <div
              onClick={onOpenStats}
              className="cursor-pointer bg-black/30 px-2 py-1 rounded border border-[#f4e4bc]/30 hover:bg-black/50 active:scale-95 transition-all text-right"
            >
              <div className="text-xs md:text-sm font-bold text-yellow-400 flex items-center justify-end gap-1 leading-none drop-shadow-sm mb-0.5">
                <Coins size={12} /> 剩: {remainingBudget.toLocaleString()}
              </div>
              <div className="text-[10px] md:text-xs font-bold text-red-300 flex items-center justify-end gap-1 leading-none">
                <TrendingDown size={10} /> 花: {totalCost.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <button
                onClick={onOpenImport}
                className="w-7 h-7 bg-[#2c1810]/80 border border-[#d4c49c]/50 rounded flex items-center justify-center text-[#d4c49c] active:bg-[#3d2b20] active:scale-95 transition-all"
              >
                <FileDown size={14} />
              </button>
              <button
                onClick={onOpenSettings}
                className="w-7 h-7 bg-[#2c1810]/80 border border-[#d4c49c]/50 rounded flex items-center justify-center text-[#d4c49c] active:bg-[#3d2b20] active:scale-95 transition-all"
              >
                <Settings size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CollapsibleDaySelector = ({ days, selectedDayId, onSelectDay }) => {
  return (
    <div className="bg-[#2c1810] border-b-4 border-black shadow-lg z-30 transition-all duration-300">
      <div className="flex overflow-x-auto no-scrollbar py-1 px-1 gap-1">
        {days.map((day, index) => {
          const isSelected = day.id === selectedDayId;
          return (
            <button
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              className={`flex flex-col items-center justify-center px-2 py-1 border-2 transition-all duration-100 min-w-[60px] shrink-0 rounded-sm ${
                isSelected
                  ? 'bg-[#8b4513] border-[#f4e4bc] text-[#f4e4bc] translate-y-0'
                  : 'bg-[#4a3728] border-[#2c1810] text-gray-400 hover:bg-[#5c4835]'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wide">
                DAY {index + 1}
              </span>
              <span className="text-xs font-bold leading-tight">
                {day.date}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const SUPPLY_MAP = {
  stay: {
    label: '預訂據點',
    icon: '🏨',
    link: 'https://www.agoda.com/',
    color: 'bg-blue-600',
    reward: '50 EXP',
  },
  hotel: {
    label: '預訂據點',
    icon: '🏨',
    link: 'https://www.agoda.com/',
    color: 'bg-blue-600',
    reward: '50 EXP',
  },
  inn: {
    label: '預訂據點',
    icon: '🏨',
    link: 'https://www.agoda.com/',
    color: 'bg-blue-600',
    reward: '50 EXP',
  },
  住: {
    label: '預訂據點',
    icon: '🏨',
    link: 'https://www.agoda.com/',
    color: 'bg-blue-600',
    reward: '50 EXP',
  },
  宿: {
    label: '預訂據點',
    icon: '🏨',
    link: 'https://www.agoda.com/',
    color: 'bg-blue-600',
    reward: '50 EXP',
  },
  門票: {
    label: '獲取通行證',
    icon: '🎟️',
    link: 'https://www.klook.com/',
    color: 'bg-orange-500',
    reward: '30 EXP',
  },
  票: {
    label: '獲取通行證',
    icon: '🎟️',
    link: 'https://www.klook.com/',
    color: 'bg-orange-500',
    reward: '30 EXP',
  },
  券: {
    label: '獲取通行證',
    icon: '🎟️',
    link: 'https://www.klook.com/',
    color: 'bg-orange-500',
    reward: '30 EXP',
  },
  樂園: {
    label: '獲取通行證',
    icon: '🎟️',
    link: 'https://www.klook.com/',
    color: 'bg-orange-500',
    reward: '30 EXP',
  },
  影城: {
    label: '獲取快速通關',
    icon: '⚡',
    link: 'https://www.klook.com/',
    color: 'bg-purple-600',
    reward: '100 EXP',
  },
  迪士尼: {
    label: '獲取快速通關',
    icon: '🏰',
    link: 'https://www.klook.com/',
    color: 'bg-red-500',
    reward: '100 EXP',
  },
  車: {
    label: '購買移動卷軸',
    icon: '🚄',
    link: 'https://www.jrpass.com/',
    color: 'bg-green-600',
    reward: '40 EXP',
  },
  交通: {
    label: '購買移動卷軸',
    icon: '🚄',
    link: 'https://www.jrpass.com/',
    color: 'bg-green-600',
    reward: '40 EXP',
  },
  機場: {
    label: '召喚傳送陣',
    icon: '✈️',
    link: 'https://www.klook.com/',
    color: 'bg-sky-500',
    reward: '60 EXP',
  },
  sim: {
    label: '裝備通訊物資',
    icon: '📶',
    link: 'https://www.klook.com/',
    color: 'bg-emerald-500',
    reward: '20 EXP',
  },
  網: {
    label: '裝備通訊物資',
    icon: '📶',
    link: 'https://www.klook.com/',
    color: 'bg-emerald-500',
    reward: '20 EXP',
  },
};

// 🟢 ActivityCard 大改版：整合裝備槽邏輯
const ActivityCard = ({
  item,
  onEdit,
  isActive,
  onClick,
  onToggleComplete,
  appSettings,
}) => {
  // 內部狀態管理
  const [isSupplyOpen, setIsSupplyOpen] = useState(false);
  const [isEquipped, setIsEquipped] = useState(false);

  const typeConfig = TYPE_CONFIG[item.type] || TYPE_CONFIG.sightseeing;
  const TypeIcon = typeConfig.icon;

  const matchedKey = Object.keys(SUPPLY_MAP).find((key) =>
    item.title?.toLowerCase().includes(key)
  );
  const supply = matchedKey ? SUPPLY_MAP[matchedKey] : null;

  // 如果這張卡片完成了，自動隱藏 Supply 介面 (但保留圖示狀態)
  useEffect(() => {
    if (item.completed) {
      setIsSupplyOpen(false);
    }
  }, [item.completed]);

  const openMaps = (e) => {
    e.stopPropagation();
    const coords = getCoords(item.location);
    const url = coords
      ? `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          item.location || item.title
        )}`;
    window.open(url, '_blank');
  };

  const handleSupplyClick = (e) => {
    e.stopPropagation(); // 阻止卡片展開編輯
    setIsSupplyOpen(!isSupplyOpen);
  };

  const handlePurchase = (e) => {
    // 點擊連結不阻止預設行為(跳轉)，但要更新狀態
    e.stopPropagation();
    setIsEquipped(true);
    setIsSupplyOpen(false); // 購買後自動收起
  };

  return (
    <div
      id={`card-${item.id}`}
      onClick={onClick}
      className={`relative px-3 py-3 border-4 cursor-pointer transition-all flex flex-col gap-2 ${
        isActive
          ? 'bg-[#f4e4bc] border-[#ffd700] scale-[1.02] z-10 shadow-xl'
          : item.completed
          ? 'bg-gray-400 border-gray-600 opacity-60'
          : 'bg-[#e6d6ac] border-[#8b4513] opacity-95'
      }`}
    >
      {/* --- 卡片標題與按鈕區 --- */}
      <div className="flex items-center gap-3">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(item);
          }}
          className={`w-6 h-6 border-2 border-black flex items-center justify-center bg-white shrink-0 active:scale-90 transition-all ${
            item.completed ? 'bg-yellow-400' : ''
          }`}
        >
          {item.completed && (
            <Check size={16} className="text-black stroke-[3]" />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="bg-[#2c1810] text-[#f4e4bc] text-[10px] px-1.5 py-0.5 font-bold shrink-0">
              {item.time}
            </span>
            <h3
              className={`font-bold text-[#2c1810] text-sm truncate ${
                item.completed ? 'line-through opacity-50' : ''
              }`}
            >
              {item.title}
            </h3>
          </div>
        </div>

        {/* 右側按鈕群組 */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 🟢 新增：裝備槽 (Supply Slot) */}
          {appSettings?.showSupplies && supply && !item.completed && (
            <button
              onClick={handleSupplyClick}
              className={`w-8 h-8 rounded-sm border-2 border-black flex items-center justify-center relative transition-all shadow-sm active:scale-95 ${
                isEquipped
                  ? 'bg-green-600 text-white'
                  : isSupplyOpen
                  ? 'bg-[#f4e4bc] translate-y-[2px] shadow-none'
                  : 'bg-yellow-400 text-black animate-bounce-slow'
              }`}
            >
              {/* 如果已裝備，顯示勾勾；否則顯示道具 Icon */}
              {isEquipped ? (
                <Check size={18} strokeWidth={4} />
              ) : (
                <span className="text-sm">{supply.icon}</span>
              )}

              {/* 未裝備時的紅點提示 */}
              {!isEquipped && !isSupplyOpen && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black" />
              )}
            </button>
          )}

          <div
            className="w-8 h-8 flex items-center justify-center border-2 border-black rounded shadow-sm text-white"
            style={{ backgroundColor: typeConfig.color }}
          >
            <TypeIcon size={16} />
          </div>
          <button
            onClick={openMaps}
            className="bg-blue-600 text-white w-8 h-8 rounded-sm border-2 border-black active:scale-95 flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
          >
            <span className="text-[10px] font-bold italic">GO</span>
          </button>
        </div>
      </div>

      {/* 🟢 條件渲染：只有當 Slot 被點開時，才顯示下方的 Supply 詳細卡片 */}
      {isSupplyOpen &&
        appSettings?.showSupplies &&
        supply &&
        !item.completed && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-1 pt-2 border-t-2 border-[#8b4513]/20 flex flex-col animate-slide-down origin-top"
          >
            <div className="mt-0 p-2 bg-[#4a3528]/30 rounded-sm border border-[#f4e4bc]/10 relative">
              {/* 標題與 EXP */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#f4e4bc] font-black uppercase tracking-tighter opacity-70">
                    ✨ Suggested Supply
                  </span>
                </div>
                <span className="text-[9px] text-yellow-500 font-black drop-shadow-sm bg-black/40 px-2 py-0.5 rounded-full">
                  +{supply.reward} EXP
                </span>
              </div>

              {/* 按鈕 */}
              <a
                href={supply.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handlePurchase} // 點擊後變身
                className={`flex items-center justify-center gap-3 ${supply.color} text-white py-2.5 rounded-sm border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-xs font-black uppercase tracking-widest`}
              >
                <span>{supply.icon}</span>
                <span>{supply.label}</span>
                <ExternalLink size={12} className="opacity-50" />
              </a>
            </div>
          </div>
        )}

      {isActive && (
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-red-600 text-white text-[10px] py-2 px-1 border-2 border-black font-bold z-20 [writing-mode:vertical-lr] rotate-180">
          CURRENT QUEST
        </div>
      )}
    </div>
  );
};

const TransitConnector = ({ transMode, transTime }) => {
  const M = TRANSPORT_MODES[transMode] || TRANSPORT_MODES.train;
  return (
    <div className="flex items-center ml-4 pl-3 border-l-4 border-dashed border-[#8b4513]/40 h-8 relative">
      <div className="absolute left-[-10px] w-5 h-5 bg-[#d4c49c] border-2 border-[#8b4513] rounded-full flex items-center justify-center z-10 text-[#5c4835]">
        <M.icon size={10} />
      </div>
      <div className="ml-4 flex items-center gap-2 bg-[#d4c49c]/50 px-2 rounded text-[10px] text-[#5c4835]">
        <span>{M.label}</span>
        {transTime && <span>{transTime}分</span>}
      </div>
    </div>
  );
};

const BackpackModal = ({
  isOpen,
  onClose,
  items,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onEditItem,
}) => {
  const [newItemText, setNewItemText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const handleAdd = () => {
    if (newItemText.trim()) {
      onAddItem(newItemText);
      setNewItemText('');
    }
  };
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditText(item.text);
  };
  const saveEdit = (id) => {
    if (editText.trim()) {
      onEditItem(id, editText);
      setEditingId(null);
    }
  };
  if (!isOpen) return null;
  const completedCount = items.filter((i) => i.checked).length;
  const progress =
    items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;
  return (
    <div className={STYLES.modalOverlay}>
      <div className={STYLES.modalContent}>
        <div className="bg-[#2c1810] p-3 border-b-4 border-[#f4e4bc] flex justify-between items-center">
          <h2 className="text-[#f4e4bc] font-bold flex items-center gap-2">
            <Backpack size={20} /> 冒險背包
          </h2>
          <button onClick={onClose} className="text-[#f4e4bc] hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="新增裝備..."
              className={STYLES.input}
            />
            <button
              onClick={handleAdd}
              className="bg-[#2c1810] text-[#f4e4bc] border-2 border-[#f4e4bc] px-3 py-1 text-xs font-bold hover:bg-[#4a3528]"
            >
              新增
            </button>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-[#f4e4bc] text-xs mb-1">
              <span>準備進度</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-3 bg-[#2c1810] border border-[#f4e4bc] rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-2 border-2 transition-all ${
                  item.checked
                    ? 'bg-[#2c1810] border-[#5c4835] opacity-60'
                    : 'bg-[#f4e4bc] border-[#2c1810]'
                }`}
              >
                {editingId === item.id ? (
                  <div className="flex flex-1 gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 bg-[#fffcf5] border border-[#8b4513] px-1 text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="text-green-600"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      onClick={() => onToggleItem(item.id)}
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
                      {item.checked ? (
                        <CheckSquare size={20} className="text-green-500" />
                      ) : (
                        <Square size={20} className="text-[#2c1810]" />
                      )}
                      <span
                        className={`font-bold text-sm ${
                          item.checked
                            ? 'text-gray-500 line-through'
                            : 'text-[#2c1810]'
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                    <button
                      onClick={() => startEdit(item)}
                      className="text-[#8b4513] hover:text-blue-600"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="text-[#8b4513] hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TripSettingsModal = ({ isOpen, onClose, meta, onUpdateMeta }) => {
  // 🛡️ 安全防護：如果 meta 是空的，就使用預設值，避免畫面崩潰
  const safeMeta = meta || { 
    title: '', 
    startDate: new Date().toISOString().split('T')[0], 
    dayCount: 1, 
    totalBudget: 0, 
    coverImage: '' 
  };

  const [formData, setFormData] = useState(safeMeta);

  // 當 Modal 開啟或資料變更時，更新表單資料
  useEffect(() => {
    if (isOpen) {
      setFormData(meta || safeMeta);
    }
  }, [isOpen, meta]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdateMeta(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={STYLES.modalOverlay} onClick={onClose}>
      <div className={STYLES.modalContent} onClick={e => e.stopPropagation()}>
        {/* 標題區 */}
        <div className="bg-[#2c1810] p-3 border-b-4 border-[#f4e4bc] flex justify-between items-center mb-4">
          <h2 className="text-[#f4e4bc] font-bold flex items-center gap-2">
            <Settings size={20} /> 冒險設定
          </h2>
          <button onClick={onClose} className="text-[#f4e4bc] active:scale-90 transition-transform">
            <X size={24} />
          </button>
        </div>

        {/* 表單內容區 */}
        <div className="space-y-4">
          <div>
            <label className={STYLES.label}>旅程標題 (Quest Title)</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={STYLES.input}
            />
          </div>

          {/* 日期與天數 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="w-full">
              <label className={STYLES.label}>出發日期 (Start Date)</label>
              <div className="relative w-full">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={STYLES.input}
                  style={{ WebkitAppearance: 'none' }} 
                />
              </div>
            </div>
            <div className="w-full">
              <label className={STYLES.label}>天數 (Duration)</label>
              <input
                type="number"
                name="dayCount"
                value={formData.dayCount}
                onChange={handleChange}
                className={STYLES.input}
              />
            </div>
          </div>

          {/* 預算 */}
          <div>
            <label className={STYLES.label}>總預算 (Total Gold)</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                name="totalBudget"
                value={formData.totalBudget}
                onChange={handleChange}
                className={`${STYLES.input} pl-6`}
              />
            </div>
          </div>
          <button onClick={handleSave} className={STYLES.btnPrimary}>
            儲存設定 (SAVE)
          </button>
        </div>
      </div>
    </div>
  );
};

const ImportModal = ({ isOpen, onClose, onImport, dayId }) => {
  const [text, setText] = useState('');
  const handleImport = () => {
    if (!text.trim()) return;
    onImport(text, dayId);
    setText('');
    onClose();
  };
  if (!isOpen) return null;
  return (
    // 🟢 修改重點：加入 !items-start !pt-20 讓它往上跑
    <div className={`${STYLES.modalOverlay} !items-start !pt-20 sm:!items-center sm:!pt-0`}>
      <div className={STYLES.modalContent}>
        <h2 className="text-lg font-bold text-[#2c1810] mb-2 flex items-center gap-2">
          <FileText size={20} /> 快速匯入
        </h2>
        <div className="text-xs text-[#8b4513] mb-3 bg-[#e6d6ac] p-2 rounded border border-[#8b4513]">
          <p className="font-bold mb-1">支援欄位式貼上！範例：</p>
          <code className="block whitespace-pre">
            時間：10:00
            <br />
            名稱：抵達機場
            <br />
            地點：桃園
            <br />
            類型：傳送
          </code>
        </div>
        <textarea
          id="importText"
          rows="8"
          // 這裡高度也調整成 h-48 了
          className={STYLES.input + ' resize-none font-mono h-48'}
          placeholder="貼上你的行程..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 border-4 border-black shadow-[2px_2px_0_0_black] active:shadow-none active:translate-y-1"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 border-4 border-black shadow-[2px_2px_0_0_black] active:shadow-none active:translate-y-1"
          >
            匯入
          </button>
        </div>
      </div>
    </div>
  );
};

const Modal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSave,
  isEditing,
  onDelete,
}) => {
  if (!isOpen) return null;
  return (
    <div className={STYLES.modalOverlay}>
      <div className={STYLES.modalContent}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-red-500 text-white border-2 border-black p-1"
        >
          <X size={16} />
        </button>
        <h2 className="text-lg font-bold text-[#2c1810] mb-4 flex items-center gap-2">
          {isEditing ? '編輯任務' : '接受新任務'}
        </h2>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label className={STYLES.label + ' text-center'}>時間</label>
              <div className="flex-1 flex items-center justify-center">
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className={`${STYLES.input} h-9 text-center appearance-none flex items-center justify-center`}
                  style={{ textAlign: 'center', lineHeight: 'normal' }}
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className={STYLES.label}>類型</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className={STYLES.input}
              >
                {Object.keys(TYPE_CONFIG).map((k) => (
                  <option key={k} value={k}>
                    {TYPE_CONFIG[k].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={STYLES.label}>任務名稱</label>
            <input
              type="text"
              placeholder="例如：討伐史萊姆"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={STYLES.input}
            />
          </div>
          <div>
            <label className={STYLES.label}>地點</label>
            <input
              type="text"
              placeholder="輸入地點或座標"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className={STYLES.input}
            />
          </div>
          <div>
            <label className={STYLES.label}>花費 (Gold)</label>
            <input
              type="number"
              placeholder="0"
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: e.target.value })
              }
              className={STYLES.input}
            />
          </div>
          <div className="bg-[#e6d6ac]/50 p-2 border border-[#8b4513] border-dashed rounded">
            <label className={STYLES.label}>
              <Navigation size={10} className="inline mr-1" />
              前往此處的交通
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <select
                  value={formData.transMode}
                  onChange={(e) =>
                    setFormData({ ...formData, transMode: e.target.value })
                  }
                  className={STYLES.input}
                >
                  {Object.keys(TRANSPORT_MODES).map((k) => (
                    <option key={k} value={k}>
                      {TRANSPORT_MODES[k].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  placeholder="分"
                  value={formData.transTime}
                  onChange={(e) =>
                    setFormData({ ...formData, transTime: e.target.value })
                  }
                  className={STYLES.input}
                />
              </div>
            </div>
          </div>
          <div>
            <label className={STYLES.label}>筆記</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className={STYLES.input + ' resize-none'}
            />
          </div>
          <button onClick={onSave} className={STYLES.btnPrimary}>
            SAVE
          </button>
          {isEditing && (
            <button
              onClick={onDelete}
              className="w-full text-red-600 font-bold text-xs mt-2 text-center hover:underline"
            >
              刪除任務
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. 主應用程式 (Main App)
// ==========================================

export default function ItineraryPage({ appSettings, onOpenSettings }) {
  const [meta, setMeta] = useState(INITIAL_DATA.meta);
  const [activities, setActivities] = useState(INITIAL_DATA.activities);
  const [backpack, setBackpack] = useState(INITIAL_DATA.backpack);
  const [user, setUser] = useState(INITIAL_DATA.user);
  const [dayId, setDayId] = useState(1);
  const [modals, setModals] = useState({
    edit: false,
    backpack: false,
    settings: false,
    import: false,
    stats: false,
  });

  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const isSyncing = useMemo(() => db !== null, []);

  const days = useMemo(() => {
    const list = [];
    const start = new Date(meta.startDate);
    const weeks = ['日', '一', '二', '三', '四', '五', '六'];
    for (let i = 0; i < meta.dayCount; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      list.push({
        id: i + 1,
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        week: weeks[d.getDay()],
        full: d.toISOString().split('T')[0],
      });
    }
    return list;
  }, [meta]);
  useEffect(() => {
    // 1. 定義抓取資料的函式 (這部分保持你原本的邏輯不變)
    const fetchData = async () => {
      // 抓行程
      const { data: acts } = await supabase
        .from('itinerary')
        .select('*')
        .order('day', { ascending: true })
        .order('time', { ascending: true });

      if (acts) {
        const formatted = acts.map((item) => ({
          id: item.id,
          dayId: item.day,
          time: item.time.slice(0, 5),
          title: item.activity,
          location: item.location,
          cost: item.cost,
          type: item.type || 'sightseeing',
          notes: item.notes || '',
          completed: item.completed || false,
          transMode: item.trans_mode || 'train',
          transTime: item.trans_time || '',
        }));
        setActivities(formatted);
      }

      // 抓背包
      const { data: packs } = await supabase
        .from('backpack')
        .select('*')
        .order('id');
      if (packs) setBackpack(packs);

      // 抓個人資料 (XP/Level)
      const { data: profile } = await supabase
        .from('profile')
        .select('*')
        .single();
      if (profile) {
        setUser({
          level: profile.level,
          xp: profile.xp,
          nextLevelXp: 100,
        });
      }
    };

    // 2. 頁面載入時，先執行一次抓取
    fetchData();

    // 3. ✨ 新增這段：建立即時監聽 (Realtime Subscription) ✨
    const channel = supabase
      .channel('app-db-changes') // 頻道名稱隨意，不重複即可
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'itinerary' }, // 監聽行程表
        (payload) => {
          console.log('行程表有變動，更新中...', payload);
          fetchData(); // 重新抓取資料
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'backpack' }, // 監聽背包表
        (payload) => {
          console.log('背包有變動，更新中...', payload);
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profile' }, // 監聽個人資料表
        (payload) => {
          console.log('經驗值有變動，更新中...', payload);
          fetchData();
        }
      )
      .subscribe();

    // 4. 離開頁面時取消訂閱 (避免重複監聽佔用資源)
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

// ✅ 1. 新增行程
const handleAddActivity = async (newActivity) => {
  // 這裡我們把前端的欄位轉成資料庫的欄位
  const { error } = await supabase.from('itinerary').insert([
    {
      day: newActivity.dayId,
      time: newActivity.time,
      activity: newActivity.title, // 你的資料庫欄位叫 activity
      location: newActivity.location,
      cost: newActivity.cost,
      type: newActivity.type || 'sightseeing',
      notes: newActivity.notes || '',
      trans_mode: newActivity.transMode || 'train',
      trans_time: newActivity.transTime || '',
      completed: false,
    },
  ]);
  if (error) console.error('新增失敗:', error);
};

// ✅ 2. 修改行程 (例如打勾完成、改時間)
const handleUpdateActivity = async (id, updates) => {
  // 建立一個要更新的物件
  const dbUpdates = {};
  // 根據傳進來的更新內容，對應到資料庫欄位
  if (updates.title) dbUpdates.activity = updates.title;
  if (updates.dayId) dbUpdates.day = updates.dayId;
  if (updates.transMode) dbUpdates.trans_mode = updates.transMode;
  if (updates.transTime) dbUpdates.trans_time = updates.transTime;
  if (updates.time) dbUpdates.time = updates.time;
  if (updates.location) dbUpdates.location = updates.location;
  if (updates.cost) dbUpdates.cost = updates.cost;
  if (updates.type) dbUpdates.type = updates.type;
  if (updates.notes) dbUpdates.notes = updates.notes;
  // 特別處理布林值 (true/false)
  if (updates.completed !== undefined) dbUpdates.completed = updates.completed;

  const { error } = await supabase
    .from('itinerary')
    .update(dbUpdates)
    .eq('id', id); // 鎖定要修改的那一筆 ID

  if (error) console.error('更新失敗:', error);
};

// ✅ 3. 刪除行程
const handleDeleteActivity = async (id) => {
  const { error } = await supabase.from('itinerary').delete().eq('id', id);
  if (error) console.error('刪除失敗:', error);
};
// ✅ 4. 更新背包 (Backpack)
const handleUpdateBackpack = async (newItem) => {
  // 假設 newItem 是一個完整的物品物件
  const { error } = await supabase.from('backpack').insert([newItem]);
  if (error) console.error('背包更新失敗:', error);
};

// ✅ 5. 刪除背包物品
const handleDeleteBackpack = async (id) => {
  const { error } = await supabase.from('backpack').delete().eq('id', id);
  if (error) console.error('刪除背包失敗:', error);
};

// ✅ 6. 更新個人資料 (例如升級或加經驗值)
const handleUpdateProfile = async (newXp, newLevel) => {
  // 假設每個人只有一筆 profile，我們用 update
  // 這裡假設你有個 user ID 或是針對當前用戶更新
  // 如果你的 profile 表沒有 RLS 限制只能改自己，可能需要 .eq('id', userId)
  
  // 這裡示範最簡單的：更新第一筆 (依據你的邏輯調整)
  const { error } = await supabase
    .from('profile')
    .update({ xp: newXp, level: newLevel })
    .eq('id', 1); // ⚠️ 注意：這裡要確認你的 profile ID 是多少

  if (error) console.error('更新個人資料失敗:', error);
};
  const curActs = useMemo(
    () =>
      activities
        .filter((a) => a.dayId === dayId)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [activities, dayId]
  );
  const cost = useMemo(
    () => activities.reduce((s, i) => s + (Number(i.cost) || 0), 0),
    [activities]
  );
  const activeIdx = useMemo(() => {
    const now = new Date();
    const today = days.find((d) => d.id === dayId);
    if (!today || today.full !== now.toISOString().split('T')[0]) return -1;
    const tStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    let idx = -1;
    curActs.forEach((a, i) => {
      if (a.time <= tStr) idx = i;
    });
    return idx;
  }, [curActs, dayId, days]);

  const toggleModal = (name, val = true) =>
    setModals((p) => ({ ...p, [name]: val }));
  const openEdit = (item) => {
    setEditItem(item);
    setFormData(
      item || {
        time: '09:00',
        title: '',
        location: '',
        type: 'sightseeing',
        cost: '',
        notes: '',
        transMode: 'train',
        transTime: '',
      }
    );
    toggleModal('edit');
  };

  const saveActivity = async () => {
    if (!formData.title) return alert('請輸入標題');

    const dbData = {
      day: dayId,
      time: formData.time + ':00',
      activity: formData.title,
      location: formData.location || '',
      cost: Number(formData.cost) || 0,
      type: formData.type || 'sightseeing',
      notes: formData.notes || '',
      trans_mode: formData.transMode || 'train',
      trans_time: Number(formData.transTime) || 0,
      completed: false,
    };

    try {
      let savedItem = null;
      if (editItem) {
        const { data, error } = await supabase
          .from('itinerary')
          .update(dbData)
          .eq('id', editItem.id)
          .select();
        if (error) throw error;
        savedItem = data[0];
        setActivities((prev) =>
          prev.map((a) => (a.id === savedItem.id ? formatDbItem(savedItem) : a))
        );
        alert('✅ 修改成功！');
      } else {
        const { data, error } = await supabase
          .from('itinerary')
          .insert([dbData])
          .select();
        if (error) throw error;
        savedItem = data[0];
        setActivities((prev) => [...prev, formatDbItem(savedItem)]);
        alert('🎉 新增成功！');
      }
      toggleModal('edit', false);
    } catch (error) {
      console.error('儲存失敗:', error);
      alert('儲存失敗 ' + error.message);
    }
  };

  const deleteActivity = async () => {
    if (!editItem || !window.confirm('確定要刪除這個任務嗎？')) return;
    try {
      const newActs = activities.filter((a) => a.id !== editItem.id);
      setActivities(newActs);
      const { error } = await supabase
        .from('itinerary')
        .delete()
        .eq('id', editItem.id);
      if (error) throw error;
      toggleModal('edit', false);
    } catch (error) {
      console.error('刪除失敗:', error);
      alert('刪除失敗');
    }
  };

  const toggleComplete = async (item) => {
    const isDone = !item.completed;
    const updatedActivities = activities.map((a) =>
      a.id === item.id ? { ...a, completed: isDone } : a
    );
    setActivities(updatedActivities);
    supabase
      .from('itinerary')
      .update({ completed: isDone })
      .eq('id', item.id)
      .then();

    let u = { ...user };
    if (isDone) {
      u.xp += 10;
      if (u.xp >= u.nextLevelXp) {
        u.level++;
        u.xp -= u.nextLevelXp;
        alert('Level Up! 🎉');
      }
    } else {
      u.xp = Math.max(0, u.xp - 10);
    }
    setUser(u);
    await supabase
      .from('profile')
      .update({ level: u.level, xp: u.xp })
      .eq('id', 1);
  };

  const handleToggleBackpackItem = async (id) => {
    const item = backpack.find((i) => i.id === id);
    const newChecked = !item.checked;
    setBackpack(
      backpack.map((i) => (i.id === id ? { ...i, checked: newChecked } : i))
    );
    await supabase
      .from('backpack')
      .update({ checked: newChecked })
      .eq('id', id);
  };

  const handleAddBackpackItem = async (text) => {
    const { data } = await supabase
      .from('backpack')
      .insert([{ text, checked: false }])
      .select();
    if (data) setBackpack([...backpack, data[0]]);
  };

  const handleDeleteBackpackItem = async (id) => {
    if (!window.confirm('確定要丟掉這個裝備嗎？')) return;
    setBackpack(backpack.filter((i) => i.id !== id));
    await supabase.from('backpack').delete().eq('id', id);
  };

  const handleEditBackpackItem = async (id, newText) => {
    setBackpack(
      backpack.map((i) => (i.id === id ? { ...i, text: newText } : i))
    );
    await supabase.from('backpack').update({ text: newText }).eq('id', id);
  };

  const handleSmartImport = (text, targetDayId) => {
    const lines = text.replace(/：/g, ':').split('\n');
    const newItems = [];
    let currentItem = {};
    let currentDay = targetDayId; // 預設為目前選中的天數

    const typeMap = {
      移動: 'transport',
      傳送: 'transport',
      交通: 'transport',
      吃飯: 'food',
      用餐: 'food',
      餐廳: 'food',
      料理: 'food',
      住宿: 'checkin',
      飯店: 'checkin',
      存檔: 'checkin',
      景點: 'sightseeing',
      參觀: 'sightseeing',
      探險: 'sightseeing',
      補給: 'shopping',
      購物: 'shopping',
      其他: 'other',
      支線: 'other',
    };

    const flushItem = () => {
      if (currentItem.title || currentItem.time) {
        newItems.push({
          // 強制轉整數 ID (這行你已經修好了)
          id: Math.floor(Date.now() + Math.random() * 10000), 
          dayId: currentDay,
          type: 'sightseeing',
          cost: 0,
          completed: false,
          location: '',
          notes: '',
          
          // 🟢【Root Cause 修復】在這裡補上預設值！
          // 這樣資料庫裡的每一筆資料都會是健康的，UI 就不會崩潰。
          transMode: 'train', // 預設交通方式為電車
          transTime: 30,      // 預設交通時間 (可選)

          ...currentItem,
        });
        currentItem = {};
      }
    };

    lines.forEach((line) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;
      
      // 🟢 修復重點：偵測到 Day X 時，更新 currentDay
      const dayMatch = cleanLine.match(/^(?:Day|D|第)\s*(\d+)/i);
      if (dayMatch) {
        flushItem(); // 先儲存上一筆資料
        currentDay = parseInt(dayMatch[1]); // ✅ 解除註解：更新天數 ID
        return;
      }

      if (cleanLine.startsWith('時間:')) {
        flushItem();
        let rawTime = cleanLine.replace('時間:', '').trim();
        const timeMatch = rawTime.match(/(\d{1,2}:\d{2})/);
        if (timeMatch) {
          currentItem.time = timeMatch[0].padStart(5, '0');
        } else {
          currentItem.time = '09:00';
          currentItem.notes =
            (currentItem.notes || '') + `[時間備註: ${rawTime}] `;
        }
      } else if (cleanLine.startsWith('類型:')) {
        const rawType = cleanLine.replace('類型:', '').trim();
        currentItem.type = typeMap[rawType] || 'sightseeing';
      } else if (cleanLine.startsWith('名稱:')) {
        currentItem.title = cleanLine.replace('名稱:', '').trim();
      } else if (cleanLine.startsWith('地點:')) {
        currentItem.location = cleanLine.replace('地點:', '').trim();
      } else if (cleanLine.startsWith('筆記:')) {
        const note = cleanLine.replace('筆記:', '').trim();
        currentItem.notes = (currentItem.notes || '') + note;
      } else {
        if (currentItem.time)
          currentItem.notes =
            (currentItem.notes ? currentItem.notes + '\n' : '') + cleanLine;
      }
    });
    
    flushItem(); // 儲存最後一筆

    if (newItems.length > 0) {
      save({ activities: [...activities, ...newItems] });
      toggleModal('import', false);
      alert(`成功匯入 ${newItems.length} 筆任務！`);
    } else {
      alert('匯入失敗');
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col font-sans text-gray-900 bg-[#2c1810] overflow-hidden">
      <style>{INJECTED_STYLES}</style>

      <div className="w-full max-w-md mx-auto flex flex-col h-full rpg-map-bg shadow-2xl relative">
        <Header
          trip={meta}
          totalCost={cost}
          isSyncing={isSyncing}
          user={user}
          onOpenBackpack={() => toggleModal('backpack')}
          onOpenSettings={() => toggleModal('settings')}
          onOpenImport={() => toggleModal('import')}
          onOpenStats={() => toggleModal('stats')}
          onGoHome={() => window.location.reload()}
        />
        <CollapsibleDaySelector
          days={days}
          selectedDayId={dayId}
          onSelectDay={setDayId}
        />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="h-[50%] bg-gray-200 border-b-4 border-[#8b4513] relative z-0">
            <LeafletMap
              activities={curActs}
              activeIndex={activeIdx}
              isToday={activeIdx !== -1}
              onMarkerClick={(id) =>
                document
                  .getElementById(`card-${id}`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
              onAddActivity={() => openEdit(null)}
            />
          </div>
          <div className="flex-1 bg-[#d4c49c]/90 overflow-y-auto p-2 border-t-4 border-[#2c1810] no-scrollbar pb-safe">
            {curActs.length === 0 && (
              <div className="text-center py-8 opacity-60 font-bold text-[#2c1810]">
                尚無冒險紀錄...
              </div>
            )}
            {curActs.map((item, idx) => (
              <React.Fragment key={item.id}>
                {idx > 0 &&
                  (item.transMode ? (
                    <TransitConnector
                      transMode={item.transMode}
                      transTime={item.transTime}
                    />
                  ) : (
                    <div className="h-3"></div>
                  ))}
                <ActivityCard
                  item={item}
                  appSettings={appSettings}
                  isActive={idx === activeIdx}
                  onClick={() => openEdit(item)}
                  onEdit={() => openEdit(item)}
                  onToggleComplete={() => toggleComplete(item)}
                />
              </React.Fragment>
            ))}
            <div className="h-16" />
          </div>
        </div>

        <Modal
          isOpen={modals.edit}
          onClose={() => toggleModal('edit', false)}
          formData={formData}
          setFormData={setFormData}
          onSave={saveActivity}
          isEditing={!!editItem}
          onDelete={deleteActivity}
        />
        <BackpackModal
          isOpen={modals.backpack}
          onClose={() => toggleModal('backpack', false)}
          items={backpack}
          onToggleItem={handleToggleBackpackItem}
          onAddItem={handleAddBackpackItem}
          onDeleteItem={handleDeleteBackpackItem}
          onEditItem={handleEditBackpackItem}
        />
        <TripSettingsModal
          isOpen={modals.settings}
          onClose={() => toggleModal('settings', false)}
          meta={meta}  // ⭕️ 改成 meta，跟組件定義一致
          onUpdateMeta={(newMeta) => save({ meta: newMeta })} // ⭕️ 改成 onUpdateMeta
        />
        <BudgetStatsModal
          isOpen={modals.stats}
          onClose={() => toggleModal('stats', false)}
          activities={activities}
          totalBudget={meta.totalBudget}
        />
        <ImportModal
          isOpen={modals.import}
          onClose={() => toggleModal('import', false)}
          dayId={dayId}
          onImport={handleSmartImport}
        />
      </div>
    </div>
  );
}
