import React, { useState, useEffect } from 'react';
import { AdminStorageManager } from '../utils/adminStorage';
import {
  ArrowLeft,
  Share2,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  ListOrdered,
  Download,
  Printer,
  Copy,
  Check,
  Edit3,
  SlidersHorizontal,
  X,
  Zap,
  Building,
  Plus,
  Trash2,
  RefreshCw,
  ArrowUpDown,
  Move,
  Info,
  Layers,
  Cpu,
  Radio,
  PlusCircle,
  FileStack,
  Save,
} from 'lucide-react';
import { RenovationProject } from '../types';
import { calculateProjectCost } from '../utils/calculator';

interface PlanSummaryBOMProps {
  project: RenovationProject;
  onPrevStep: () => void;
  onGoToSetup: () => void;
  onSaveAsTemplate?: () => void;
  onSavePlan?: () => void;
  pageMode?: 'main' | 'editList';
  onPageModeChange?: (mode: 'main' | 'editList', deviceCount?: number) => void;
}

// Device Item Interface for editable BOM list (Image 3)
export interface BOMDeviceItem {
  id: string;
  brand: string;
  category: string;
  model: string;
  description: string;
  unit: string;
  qty: number;
  unitPrice: number;
  imageUrl: string;
  roomName?: string;
}

export const PlanSummaryBOM: React.FC<PlanSummaryBOMProps> = ({
  project,
  onPrevStep,
  onGoToSetup,
  onSaveAsTemplate,
  onSavePlan,
  pageMode: propPageMode,
  onPageModeChange,
}) => {
  // Navigation mode: 'main' (方案详情) | 'editList' (编辑清单)
  const [internalPageMode, setInternalPageMode] = useState<'main' | 'editList'>('main');

  const pageMode = propPageMode !== undefined ? propPageMode : internalPageMode;

  const setPageMode = (mode: 'main' | 'editList') => {
    setInternalPageMode(mode);
    const count = deviceItems.reduce((acc, item) => acc + item.qty, 0);
    onPageModeChange?.(mode, count);
  };

  // Main page view tab: 'device' (按设备查看) | 'room' (按房间查看)
  const [viewTab, setViewTab] = useState<'device' | 'room'>('device');
  const [copied, setCopied] = useState(false);

  // Modals state
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // Profit / Price modification state
  const [taxRate, setTaxRate] = useState<number>(0); // 0%
  const [profitMargin, setProfitMargin] = useState<number>(25); // 25% profit margin
  const [customDiscount, setCustomDiscount] = useState<number>(100); // 100%

  const costSummary = calculateProjectCost(project);

  // Dynamic BOM device list state (Editable for Image 3, initialized from Admin Storage)
  const [deviceItems, setDeviceItems] = useState<BOMDeviceItem[]>(() => {
    const adminDevices = AdminStorageManager.getRoomDefaultDevices();
    const categoryRoomNameMap: Record<string, string> = {
      weak_box: '弱电箱 / 核心机房',
      living: '客厅',
      bedroom: '主卧',
      dining: '餐厅',
      kitchen: '厨房',
      bathroom: '卫生间',
      study: '书房',
      entrance: '玄关',
      balcony: '阳台',
      other: '公共区域',
    };

    const mapped: BOMDeviceItem[] = adminDevices.map((d) => ({
      id: d.id,
      brand: d.brand,
      category: d.category,
      model: d.model,
      description: d.description,
      unit: d.unit,
      qty: d.qty,
      unitPrice: d.unitPrice,
      imageUrl: d.imageUrl,
      roomName: categoryRoomNameMap[d.roomCategory] || '公共区域',
    }));

    // Add accessories
    mapped.push(
      {
        id: 'acc-1',
        brand: '配件辅材',
        category: '辅材包',
        model: '工程六类低烟无卤屏蔽网线',
        description: '全屋高纯无氧铜屏蔽双绞线工程包',
        unit: '箱',
        qty: 1,
        unitPrice: 0,
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&auto=format&fit=crop&q=60',
        roomName: '公共区域',
      },
      {
        id: 'acc-2',
        brand: '配件辅材',
        category: '辅材包',
        model: '冷压金镀厚级8P8C屏蔽水晶头',
        description: '工程冷压级水晶头及管线保护扣包',
        unit: '份',
        qty: 1,
        unitPrice: 0,
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=150&auto=format&fit=crop&q=60',
        roomName: '公共区域',
      }
    );

    return mapped;
  });


  useEffect(() => {
    const totalCount = deviceItems.reduce((acc, item) => acc + item.qty, 0);
    onPageModeChange?.(pageMode, totalCount);
  }, [pageMode, deviceItems]);

  const handleRoomChange = (itemId: string, newRoom: string) => {
    setDeviceItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, roomName: newRoom } : item))
    );
  };

  // Catalog Product Search & Filter state for Image 3
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogTab, setCatalogTab] = useState('睿易');
  const [catalogFilterTag, setCatalogFilterTag] = useState('吸顶AP');
  const [catalogCategory, setCatalogCategory] = useState('无线');
  const [stagedCart, setStagedCart] = useState<Record<string, number>>({});

  const catalogProducts = [
    {
      id: 'cat-ap-262g',
      category: '无线',
      subTag: '吸顶AP',
      brand: '锐捷',
      model: 'RG-EAP262(G) V2',
      specs: '支持 Wi-Fi 6 | 最大接入速率 1775Mbps | 推荐接入终端数 64 台 | 支持 2.4G/5G 双频',
      badges: ['热销', '1类保卡', '保修1年'],
      price: 699,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&auto=format&fit=crop&q=60',
    },
    {
      id: 'cat-ap-262e',
      category: '无线',
      subTag: '吸顶AP',
      brand: '锐捷',
      model: 'RG-EAP262(E)',
      specs: '2976M 双频千兆吸顶AP，1个千兆LAN口上联，内置天线，支持 2.4GHz/5GHz 双频，160M 频宽',
      badges: ['热销', '2类保卡', '保修1年'],
      price: 789,
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=150&auto=format&fit=crop&q=60',
    },
    {
      id: 'cat-ap-162e',
      category: '无线',
      subTag: '面板AP',
      brand: '锐捷',
      model: 'RG-EAP162(E)',
      specs: '8.5 毫米超薄设计 | 支持 Wi-Fi 6 | 最大接入速率 2976Mbps | 推荐接入终端 64 台',
      badges: ['热销', '1类保卡', '保修1年'],
      price: 736,
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=60',
    },
    {
      id: 'cat-ap-212ac',
      category: '无线',
      subTag: '面板AP',
      brand: '锐捷',
      model: 'RG-EAP212(AC)',
      specs: '1200M 双频千兆面板AP，标准86型卡扣安装，支持智能漫游',
      badges: ['1类保卡', '保修1年'],
      price: 450,
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=150&auto=format&fit=crop&q=60',
    },
    {
      id: 'cat-gw-210g',
      category: '网关',
      subTag: 'AC',
      brand: '锐捷',
      model: 'RG-EG210G-P-H',
      specs: '光猫供电 10口全千兆 PoE路由器 EG210G-P-H，固化10个千兆电口 (含8个PoE)',
      badges: ['热销', '1类保卡', '保修1年'],
      price: 1600,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&auto=format&fit=crop&q=60',
    },
    {
      id: 'cat-sw-3100',
      category: '交换',
      subTag: 'AC',
      brand: '锐捷',
      model: 'RG-NBS3100-24GT4SFP',
      specs: '24口千兆二层网管交换机，4个千兆SFP光口，48Gbps背板带宽',
      badges: ['1类保卡', '保修1年'],
      price: 2800,
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150&auto=format&fit=crop&q=60',
    },
  ];

  const handleStageProduct = (product: typeof catalogProducts[0]) => {
    setStagedCart((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1,
    }));
  };

  const handleConfirmAddProducts = () => {
    const newItemsToAdd: BOMDeviceItem[] = [];
    Object.entries(stagedCart).forEach(([prodId, qty]) => {
      const count = Number(qty);
      if (count <= 0) return;
      const p = catalogProducts.find((cat) => cat.id === prodId);
      if (p) {
        newItemsToAdd.push({
          id: `dev-added-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          brand: p.brand,
          category: p.subTag || p.category,
          model: p.model,
          description: p.specs,
          unit: '台',
          qty: count,
          unitPrice: p.price,
          imageUrl: p.imageUrl,
          roomName: '客厅',
        });
      }
    });

    if (newItemsToAdd.length > 0) {
      setDeviceItems((prev) => [...prev, ...newItemsToAdd]);
    }
    setStagedCart({});
    setIsAddProductModalOpen(false);
  };

  const totalStagedCount = (Object.values(stagedCart) as number[]).reduce((a, b) => a + Number(b), 0);

  const filteredCatalogProducts = catalogProducts.filter((p) => {
    if (catalogSearchQuery.trim()) {
      return (
        p.model.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
        p.specs.toLowerCase().includes(catalogSearchQuery.toLowerCase())
      );
    }
    if (catalogCategory && p.category !== catalogCategory) {
      return false;
    }
    if (catalogFilterTag && catalogFilterTag !== '全部' && p.subTag !== catalogFilterTag) {
      return p.subTag === catalogFilterTag || p.category === catalogCategory;
    }
    return true;
  });

  // Calculations based on dynamic items
  const baseTotalCost = deviceItems.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const discountedTotal = Math.round((baseTotalCost * customDiscount) / 100);
  const taxAmount = Math.round((discountedTotal * taxRate) / 100);
  const finalTotalCost = discountedTotal + taxAmount;
  const totalDeviceCount = deviceItems.reduce((sum, item) => sum + item.qty, 0);
  const profitAmount = Math.round(discountedTotal * (profitMargin / 100));

  // Active rooms for breakdown
  const activeRooms = project.rooms.length > 0 ? project.rooms : [
    { id: 'living', name: '客厅', scheme: {} },
    { id: 'dining', name: '餐厅', scheme: {} },
    { id: 'master', name: '主卧', scheme: {} },
    { id: 'second', name: '次卧', scheme: {} },
    { id: 'study', name: '书房', scheme: {} },
  ];

  // Stepper handlers for Edit List (Image 3)
  const handleQtyChange = (id: string, delta: number) => {
    setDeviceItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    setDeviceItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReplaceItem = (id: string) => {
    const newName = prompt('请输入替换后的设备型号/名称:', 'Aqara 智能网关/开关');
    if (newName) {
      setDeviceItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, model: newName } : item))
      );
    }
  };

  const handleEditItem = (id: string) => {
    const item = deviceItems.find((i) => i.id === id);
    if (!item) return;
    const newPrice = prompt('调整单价 (元):', String(item.unitPrice));
    if (newPrice !== null && !isNaN(Number(newPrice))) {
      setDeviceItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, unitPrice: Number(newPrice) } : i))
      );
    }
  };

  const handleAddProduct = () => {
    const newItem: BOMDeviceItem = {
      id: `dev-${Date.now()}`,
      brand: '锐捷',
      category: '智能面板',
      model: 'RG-AP820-L(V3) 智能场景面板开关',
      description: '全高色域双触摸交互面板，支持全屋多情景联动控制',
      unit: '台',
      qty: 1,
      unitPrice: 880,
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=150&auto=format&fit=crop&q=60',
    };
    setDeviceItems((prev) => [...prev, newItem]);
    setIsAddProductModalOpen(false);
  };

  const handleCopyText = () => {
    let text = `【AI全屋智能设计方案与产品报价清单】\n`;
    text += `项目楼盘/小区: ${project.communityName || '全屋智能项目'}\n`;
    text += `设备总件数: ${totalDeviceCount} 件\n`;
    text += `方案总结费用: ¥${finalTotalCost.toLocaleString()} 元\n\n`;
    text += `【产品清单明细】:\n`;

    deviceItems.forEach((item, idx) => {
      text += `${idx + 1}. [${item.brand}·${item.category}] ${item.model} x ${item.qty}${item.unit} | 单价: ¥${item.unitPrice}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.communityName || '全屋智能'}_方案详情.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // =========================================================================
  // PAGE MODE 2: 编辑清单 (Image 3 EXACT UI)
  // =========================================================================
  if (pageMode === 'editList') {
    // Prepare grouped devices based on viewTab
    const groupedDeviceItems: { groupName: string; items: BOMDeviceItem[] }[] = [];

    if (viewTab === 'device') {
      const categoriesMap: Record<string, BOMDeviceItem[]> = {};
      deviceItems.forEach((item) => {
        let catKey = item.category || '其他设备';
        if (catKey.includes('AP') || catKey.includes('无线')) catKey = '无线 AP 网络设备';
        else if (catKey.includes('网关') || catKey.includes('路由')) catKey = '网络路由器与网关';
        else if (catKey.includes('交换')) catKey = '核心与接入交换机';
        else if (catKey.includes('辅材') || catKey.includes('配件')) catKey = '配件与辅材包';

        if (!categoriesMap[catKey]) categoriesMap[catKey] = [];
        categoriesMap[catKey].push(item);
      });

      Object.entries(categoriesMap).forEach(([catName, items]) => {
        groupedDeviceItems.push({ groupName: catName, items });
      });
    } else {
      // viewTab === 'room'
      const roomMap: Record<string, BOMDeviceItem[]> = {};
      deviceItems.forEach((item) => {
        const rmKey = item.roomName || '弱电箱 / 默认楼层';
        if (!roomMap[rmKey]) roomMap[rmKey] = [];
        roomMap[rmKey].push(item);
      });

      Object.entries(roomMap).forEach(([rmName, items]) => {
        groupedDeviceItems.push({ groupName: rmName, items });
      });
    }

    return (
      <div className="relative max-w-md md:max-w-2xl mx-auto space-y-3 pb-28 animate-fadeIn bg-slate-50 min-h-full p-2 sm:p-4 text-slate-900 print:bg-white">
        {/* Sub-tabs: 按设备查看 | 按房间查看 */}
        <div className="grid grid-cols-2 bg-white rounded-xl p-1 border border-slate-200 shadow-2xs">
          <button
            onClick={() => setViewTab('device')}
            className={`py-2 text-xs font-bold transition-all relative cursor-pointer ${
              viewTab === 'device' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            按设备查看
            {viewTab === 'device' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => setViewTab('room')}
            className={`py-2 text-xs font-bold transition-all relative cursor-pointer ${
              viewTab === 'room' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            按房间查看
            {viewTab === 'room' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Quick Summary Chips */}
        <div className="flex items-center justify-between text-xs py-1 px-1">
          <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
            {['客厅', '主卧', '次卧', '弱电箱 / 默认楼层'].map((rm) => {
              const count = deviceItems.reduce(
                (acc, item) =>
                  (item.roomName || '弱电箱 / 默认楼层').includes(rm.split(' ')[0]) ? acc + item.qty : acc,
                0
              );
              return (
                <span
                  key={rm}
                  className="bg-blue-50/80 text-blue-600 font-bold px-2 py-0.5 rounded-lg border border-blue-100/80 flex items-center gap-1 shrink-0 text-[10px]"
                >
                  <span>{rm.split(' ')[0]} :</span>
                  <span className="font-mono">{count}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Grouped Product Cards List */}
        <div className="space-y-4">
          {groupedDeviceItems.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-2">
              {/* Group Header Title */}
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-100/80 rounded-xl text-xs font-extrabold text-slate-800 border border-slate-200/60">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>{group.groupName}</span>
                </div>
                <span className="bg-white text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shadow-2xs">
                  {group.items.reduce((acc, i) => acc + i.qty, 0)} {group.items[0]?.unit || '台'}
                </span>
              </div>

              {/* Items in this group */}
              <div className="space-y-2.5">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-3 border border-slate-100 shadow-2xs space-y-2 hover:border-slate-200 transition-all"
                  >
                    {/* Top Row: Tags + Room Selector + Action Buttons */}
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                          {item.brand}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          {item.category}
                        </span>

                        {/* Room Location Tag */}
                        <div className="flex items-center space-x-0.5 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-100">
                          <span>📍</span>
                          <select
                            value={item.roomName || '弱电箱 / 默认楼层'}
                            onChange={(e) => handleRoomChange(item.id, e.target.value)}
                            className="bg-transparent text-[10px] font-bold text-amber-800 outline-none cursor-pointer"
                          >
                            <option value="客厅">客厅</option>
                            <option value="主卧">主卧</option>
                            <option value="次卧">次卧</option>
                            <option value="书房">书房</option>
                            <option value="弱电箱 / 默认楼层">弱电箱 / 默认楼层</option>
                            <option value="公共区域">公共区域</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="flex items-center space-x-0.5 hover:text-rose-600 transition-colors cursor-pointer"
                          title="删除设备"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleReplaceItem(item.id)}
                          className="flex items-center space-x-0.5 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span className="text-[11px]">换</span>
                        </button>
                        <button
                          onClick={() => handleEditItem(item.id)}
                          className="text-blue-600 font-bold text-[11px] hover:underline"
                        >
                          编辑
                        </button>
                      </div>
                    </div>

                    {/* Main Content: Image + Details + Price & Quantity */}
                    <div className="flex items-start space-x-3">
                      <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 shrink-0 p-1 flex items-center justify-center overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.model}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>

                      <div className="flex-1 space-y-0.5 pr-1">
                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                          {item.model}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                          {item.description}
                        </p>
                        <div className="font-mono font-extrabold text-slate-900 text-xs pt-0.5">
                          ¥{item.unitPrice.toLocaleString()}
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center space-x-1 shrink-0 self-end">
                        <button
                          onClick={() => handleQtyChange(item.id, -1)}
                          className="w-5.5 h-5.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition-colors cursor-pointer text-xs"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-xs text-slate-900 px-1">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleQtyChange(item.id, 1)}
                          className="w-5.5 h-5.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition-colors cursor-pointer text-xs"
                        >
                          +
                        </button>
                        <span className="text-xs text-slate-500 font-medium">{item.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Floating Bar */}
        <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border border-slate-200 p-3 shadow-lg print:hidden rounded-2xl mt-4">
          <div className="max-w-md md:max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <div className="flex items-center space-x-3">
                <span>税点: <strong className="text-slate-900 font-mono">{taxRate}%</strong></span>
                <span>总数: <strong className="text-slate-900 font-mono">{totalDeviceCount}</strong></span>
              </div>
              <div>
                <span>总价: </span>
                <span className="text-base font-extrabold text-slate-900 font-mono ml-1">
                  ¥{finalTotalCost.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() =>
                  setDeviceItems((prev) => [...prev].sort((a, b) => b.unitPrice - a.unitPrice))
                }
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-full flex items-center justify-center space-x-1 transition-colors cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
                <span>排序</span>
              </button>

              <button
                onClick={() => setIsAddProductModalOpen(true)}
                className="py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs rounded-full flex items-center justify-center space-x-1 transition-colors cursor-pointer border border-blue-200"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>加产品</span>
              </button>

              <button
                onClick={() => setIsProfitModalOpen(true)}
                className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full flex items-center justify-center space-x-1 transition-colors cursor-pointer shadow-xs"
              >
                <span>改价格算利润</span>
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Modal: 追加产品 */}
        {isAddProductModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md md:max-w-xl h-[84vh] sm:h-[630px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 relative my-0 sm:my-auto">
              {/* Drawer Header */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-extrabold text-slate-900">追加产品</h3>
                <button
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-3 py-1.5 shrink-0 bg-white">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={catalogSearchQuery}
                    onChange={(e) => setCatalogSearchQuery(e.target.value)}
                    placeholder="搜索产品"
                    className="w-full bg-slate-100/80 rounded-full pl-8 pr-4 py-1.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 border border-transparent focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Brand Tabs: 睿易 | 自定义 | 共享 */}
              <div className="px-4 pt-1 flex items-center space-x-6 border-b border-slate-100 text-xs font-bold text-slate-600 shrink-0">
                {['睿易', '自定义', '共享'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCatalogTab(tab)}
                    className={`pb-1.5 transition-all relative cursor-pointer ${
                      catalogTab === tab ? 'text-blue-600 font-extrabold' : 'hover:text-slate-900'
                    }`}
                  >
                    {tab}
                    {catalogTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>

              {/* Category Filter Tag Chips: 面板AP, 吸顶AP, 室外AP, AC */}
              <div className="px-3 py-1.5 flex items-center space-x-1.5 overflow-x-auto scrollbar-none shrink-0 border-b border-slate-100">
                {['面板AP', '吸顶AP', '室外AP', 'AC'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setCatalogFilterTag(tag)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                      catalogFilterTag === tag
                        ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Filter Sorting Options */}
              <div className="px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-100 shrink-0 bg-white">
                <span className="font-bold text-blue-600 cursor-pointer">综合</span>
                <span className="flex items-center gap-0.5 cursor-pointer hover:text-slate-800">价格 ⇕</span>
                <span className="flex items-center gap-0.5 cursor-pointer hover:text-slate-800">整机无线速率 ⇕</span>
                <span className="flex items-center gap-0.5 cursor-pointer hover:text-slate-800">2.4G ⇕</span>
                <span className="flex items-center gap-0.5 cursor-pointer hover:text-slate-800">筛选 🌪</span>
              </div>

              {/* Drawer Content: Left Sidebar + Right Products Grid */}
              <div className="flex-1 min-h-0 flex overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-20 bg-slate-100/70 overflow-y-auto shrink-0 text-[11px] text-slate-600 font-medium">
                  {[
                    '网关',
                    '安全',
                    '交换',
                    '无线',
                    '小易',
                    '易光',
                    '网桥',
                    '家用路由',
                    '语音网关',
                    '服务',
                  ].map((cat) => {
                    const isActive = catalogCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCatalogCategory(cat)}
                        className={`w-full py-3 px-1.5 text-center block transition-all relative cursor-pointer ${
                          isActive
                            ? 'bg-white text-blue-600 font-bold'
                            : 'hover:bg-slate-200/50 hover:text-slate-900'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r"></span>
                        )}
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Products List */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 bg-white min-h-0">
                  {filteredCatalogProducts.map((p) => {
                    const addedCount = stagedCart[p.id] || 0;
                    return (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 shadow-2xs flex items-start space-x-2.5 relative"
                      >
                        {/* Thumbnail Image */}
                        <div className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 relative overflow-hidden">
                          <span className="absolute top-0 left-0 bg-blue-500 text-white text-[8px] font-bold px-1 rounded-br">
                            易
                          </span>
                          <img src={p.imageUrl} alt={p.model} className="w-full h-full object-contain" />
                          {addedCount > 0 && (
                            <span className="absolute bottom-0.5 left-0.5 bg-slate-900/80 text-white text-[8px] font-bold px-1 py-0.2 rounded-full">
                              {addedCount}
                            </span>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 space-y-0.5 pr-6">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{p.model}</h4>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                            {p.specs}
                          </p>
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {p.badges.map((b, idx) => (
                              <span
                                key={idx}
                                className={`text-[8px] px-1 py-0.2 rounded font-medium ${
                                  b === '热销'
                                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                    : b.includes('保卡')
                                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                                }`}
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs font-extrabold text-slate-900 font-mono pt-0.5">
                            ¥ {p.price}
                          </div>
                        </div>

                        {/* Blue Plus Button */}
                        <button
                          onClick={() => handleStageProduct(p)}
                          className="absolute bottom-2.5 right-2.5 w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Action Bar: 追加 (N) */}
              <div className="p-2.5 border-t border-slate-100 bg-white shrink-0">
                <button
                  onClick={handleConfirmAddProducts}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs sm:text-sm rounded-full transition-all shadow-md cursor-pointer flex items-center justify-center"
                >
                  <span>追加 ({totalStagedCount})</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: 改价格算利润 */}
        {isProfitModalOpen && (
          <div className="fixed inset-0 max-w-[412px] md:max-w-xl mx-auto z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-scaleUp border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  <span>改价格算利润工具</span>
                </h3>
                <button
                  onClick={() => setIsProfitModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">
                    开票税点 (%):
                  </label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value={0}>0% (不含税 / 普通发票)</option>
                    <option value={3}>3% (小规模纳税人)</option>
                    <option value={6}>6% (建筑服务)</option>
                    <option value={13}>13% (增值税专票)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 font-semibold block mb-1">
                    期望毛利润率 (%):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-semibold block mb-1">
                    整单折扣 (%) :
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={customDiscount}
                    onChange={(e) => setCustomDiscount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-blue-900">
                    <span>折后设备总额:</span>
                    <span className="font-bold">¥{discountedTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-blue-900">
                    <span>预估税额 ({taxRate}%):</span>
                    <span>¥{taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold border-t border-blue-200 pt-1">
                    <span>预估毛利润:</span>
                    <span>¥{profitAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsProfitModalOpen(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                保存并更新价格
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // PAGE MODE 1: MAIN REPORT (方案详情)
  // =========================================================================
  return (
    <div className="max-w-md md:max-w-2xl mx-auto space-y-4 pb-28 animate-fadeIn print:bg-white print:pb-0">
      {/* 1. Top Navigation Header REMOVED completely as requested in Req 1 */}

      {/* 2. Top Project Card */}
      <div
        className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between hover:border-blue-200 transition-all cursor-pointer mt-1"
        onClick={onGoToSetup}
      >
        <div className="space-y-1">
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
            {project.communityName ? '全屋智能定制' : '企业办公'}
          </span>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {project.communityName || '未命名智能装修项目'}
          </h2>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>

      {/* 3. Product List Header & Top Action Buttons */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">产品清单</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsProfitModalOpen(true)}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            改价格算利润
          </button>
          <button
            onClick={() => setPageMode('editList')}
            className="px-3.5 py-1.5 rounded-full bg-white border border-blue-500 hover:bg-blue-50 text-blue-600 text-xs font-semibold transition-colors cursor-pointer"
          >
            编辑清单
          </button>
        </div>
      </div>

      {/* 4. Product List Card with Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden space-y-0">
        {/* Tabs Bar */}
        <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-t-2xl gap-1">
          <button
            onClick={() => setViewTab('device')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewTab === 'device'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            按设备查看
          </button>
          <button
            onClick={() => setViewTab('room')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewTab === 'room'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            按房间查看
          </button>
        </div>

        {/* View mode 1: 按设备查看 */}
        {viewTab === 'device' && (
          <div className="divide-y divide-slate-100">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-2.5 bg-slate-50/50 text-[11px] font-semibold text-slate-400">
              <div className="col-span-7 flex items-center space-x-1">
                <span>产品信息</span>
                <Filter className="w-3 h-3 text-slate-400" />
              </div>
              <div className="col-span-2 text-center">数量</div>
              <div className="col-span-3 text-right">单价</div>
            </div>

            {/* Table Rows */}
            {deviceItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 px-4 py-3 items-center hover:bg-slate-50/60 transition-colors text-xs"
              >
                <div className="col-span-7 pr-2 space-y-1">
                  <div className="flex items-center flex-wrap gap-1">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                      {item.brand}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-500 shrink-0">
                      {item.category}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 leading-snug break-words">{item.model}</p>
                </div>
                <div className="col-span-2 text-center text-slate-700 font-medium">
                  {item.qty}
                  {item.unit}
                </div>
                <div className="col-span-3 text-right font-mono font-bold text-slate-900">
                  ¥{item.unitPrice.toLocaleString()}
                </div>
              </div>
            ))}

            {/* Note: Warranty blue banner (Image 2) REMOVED completely per Req 4 */}

            {/* Bottom Footer Row */}
            <div className="p-4 bg-white flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
              <div className="flex items-center space-x-3">
                <span>
                  税点: <strong className="text-slate-800 font-mono">{taxRate}%</strong>
                </span>
                <span>
                  总数: <strong className="text-slate-800 font-mono">{totalDeviceCount}</strong>
                </span>
              </div>
              <div>
                <span>总价: </span>
                <span className="text-base font-extrabold text-slate-900 font-mono ml-1">
                  ¥{finalTotalCost.toLocaleString()}.00
                </span>
              </div>
            </div>
          </div>
        )}

        {/* View mode 2: 按房间查看 */}
        {viewTab === 'room' && (
          <div className="p-4 space-y-3">
            {costSummary.roomBreakdowns.map((room) => (
              <div
                key={room.roomId}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2"
              >
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>{room.roomName}</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    预估小计: ¥{room.totalCost}
                  </span>
                </div>
                <ul className="space-y-1 text-slate-600 pl-1">
                  {room.details.map((d, i) => (
                    <li key={i} className="flex items-center justify-between text-[11px]">
                      <span>• {d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="p-3 bg-white flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span>全屋房间总数: {costSummary.roomBreakdowns.length} 间</span>
              <div>
                <span>方案总价: </span>
                <span className="text-base font-extrabold text-slate-900 font-mono ml-1">
                  ¥{finalTotalCost.toLocaleString()}.00
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Floating Action Bar */}
      <div className="sticky bottom-0 z-30 pt-1 -mx-3 -mb-3 sm:-mx-3.5 sm:-mb-3.5 px-3 sm:px-3.5 pb-2 bg-gradient-to-t from-slate-100 via-slate-100/90 to-transparent print:hidden">
        <div className="bg-white rounded-2xl p-2.5 px-3.5 shadow-lg border border-slate-200/90 flex items-center justify-between gap-2.5">
          {/* Left Buttons: 目录 & 存为模板 & 保存方案 */}
          <div className="flex items-center space-x-3 sm:space-x-4 pl-1">
            <button
              onClick={() => setIsCatalogOpen(true)}
              className="flex flex-col items-center justify-center text-slate-700 hover:text-blue-600 active:scale-95 transition-all cursor-pointer"
            >
              <ListOrdered className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold">目录</span>
            </button>

            {onSaveAsTemplate && (
              <button
                onClick={onSaveAsTemplate}
                className="flex flex-col items-center justify-center text-slate-700 hover:text-amber-600 active:scale-95 transition-all cursor-pointer"
              >
                <FileStack className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-bold">存为模板</span>
              </button>
            )}

            {onSavePlan && (
              <button
                onClick={onSavePlan}
                className="flex flex-col items-center justify-center text-slate-700 hover:text-blue-600 active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-bold">保存方案</span>
              </button>
            )}
          </div>

          {/* Primary Action Pill Button: 导出方案 */}
          <button
            onClick={() => setIsExportMenuOpen(true)}
            className="flex-1 max-w-[190px] py-2.5 px-4 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <span>导出方案</span>
          </button>
        </div>
      </div>

      {/* --- MODAL 1: 改价格算利润 Modal --- */}
      {isProfitModalOpen && (
        <div className="fixed inset-0 max-w-[412px] md:max-w-xl mx-auto z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-scaleUp border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>改价格算利润工具</span>
              </h3>
              <button
                onClick={() => setIsProfitModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">开票税点 (%):</label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:border-blue-500"
                >
                  <option value={0}>0% (不含税 / 增值税普通发票)</option>
                  <option value={3}>3% (小规模纳税人)</option>
                  <option value={6}>6% (建筑服务税率)</option>
                  <option value={13}>13% (增值税专用发票)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">
                  期望工程毛利润率 (%):
                </label>
                <input
                  type="number"
                  min="0"
                  max="80"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">方案折扣率 (%):</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-blue-900">
                  <span>折后整单总额:</span>
                  <span className="font-bold">¥{discountedTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-blue-900">
                  <span>发票税额 ({taxRate}%):</span>
                  <span>¥{taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold border-t border-blue-200 pt-1">
                  <span>预估纯利润:</span>
                  <span>¥{profitAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsProfitModalOpen(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              完成并更新计算结果
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 2: 目录 Modal --- */}
      {isCatalogOpen && (
        <div className="fixed inset-0 max-w-[412px] md:max-w-xl mx-auto z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-scaleUp border border-slate-100 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-blue-600" />
                <span>方案目录与章节</span>
              </h3>
              <button
                onClick={() => setIsCatalogOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2.5 bg-slate-50 rounded-xl font-bold text-slate-900 flex justify-between">
                <span>1. 项目概况与配置等级</span>
                <span className="text-blue-600">P.1</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl font-bold text-slate-900 flex justify-between">
                <span>2. 全屋智能设备采购清单 (BOM)</span>
                <span className="text-blue-600">P.2</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl font-bold text-slate-900 flex justify-between">
                <span>3. 分房间回路与控制明细</span>
                <span className="text-blue-600">P.3</span>
              </div>
            </div>

            <button
              onClick={() => setIsCatalogOpen(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              关闭目录
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 4: 导出 Menu Modal --- */}
      {isExportMenuOpen && (
        <div className="fixed inset-0 max-w-[412px] md:max-w-xl mx-auto z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl space-y-3 animate-scaleUp border border-slate-100 text-center">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              选择方案导出方式
            </h3>

            <div className="space-y-2">
              {onSaveAsTemplate && (
                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    onSaveAsTemplate();
                  }}
                  className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <FileStack className="w-4 h-4 text-amber-600" />
                  <span>保存为我的方案模板</span>
                </button>
              )}

              <button
                onClick={() => {
                  handleCopyText();
                  setIsExportMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{copied ? '已复制文本清单' : '复制方案纯文本'}</span>
              </button>

              <button
                onClick={() => {
                  setIsExportMenuOpen(false);
                  setTimeout(handlePrint, 200);
                }}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>打印 / 保存为 PDF 报告</span>
              </button>

              <button
                onClick={() => {
                  handleDownloadJSON();
                  setIsExportMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>导出标准 JSON 备份数据</span>
              </button>
            </div>

            <button
              onClick={() => setIsExportMenuOpen(false)}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer mt-1"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
