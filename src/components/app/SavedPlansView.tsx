import React, { useState } from 'react';
import {
  FolderHeart,
  Plus,
  Search,
  Trash2,
  Copy,
  Eye,
  CheckCircle2,
  Clock,
  X,
  Truck,
  PhoneCall,
  PackageCheck,
  Check,
  Building2,
  MapPin,
  ChevronRight,
  UserCheck,
  Edit3,
  Sliders,
  Sparkles,
  FileStack,
  Layers,
  Package,
  FileText,
} from 'lucide-react';
import { SavedPlanRecord, RenovationProject, OrderShippingStatus, ShippingLogisticsInfo, PlanTemplate } from '../../types';

interface SavedPlansViewProps {
  savedPlans: SavedPlanRecord[];
  activeProject: RenovationProject;
  onLoadPlan: (plan: SavedPlanRecord) => void;
  onDeletePlan: (planId: string) => void;
  onClonePlan: (plan: SavedPlanRecord) => void;
  onUpdatePlan: (plan: SavedPlanRecord) => void;
  onSaveAsTemplate?: (plan: SavedPlanRecord) => void;
  onOpenSaveModal: () => void;
  onGoToDesign: () => void;
  onGoToTemplates: () => void;
}

export const SavedPlansView: React.FC<SavedPlansViewProps> = ({
  savedPlans,
  activeProject,
  onLoadPlan,
  onDeletePlan,
  onClonePlan,
  onUpdatePlan,
  onSaveAsTemplate,
  onOpenSaveModal,
  onGoToDesign,
  onGoToTemplates,
}) => {
  const [keyword, setKeyword] = useState('');
  const [inspectingPlan, setInspectingPlan] = useState<SavedPlanRecord | null>(null);

  // Edit Plan Modal State
  const [editingPlan, setEditingPlan] = useState<SavedPlanRecord | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCommunity, setEditCommunity] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  // Contact Sales Modal State
  const [contactSalesPlan, setContactSalesPlan] = useState<SavedPlanRecord | null>(null);
  const [contactName, setContactName] = useState('卫科帆');
  const [contactPhone, setContactPhone] = useState('17696180841');
  const [deliveryAddress, setDeliveryAddress] = useState('北京市朝阳区客户指定收货地址');
  const [orderNotes, setOrderNotes] = useState('需确认双轨窗帘盒尺寸，全套设备顺丰保价发货');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time Order & Shipping Tracking Modal State
  const [trackingPlan, setTrackingPlan] = useState<SavedPlanRecord | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const filteredPlans = savedPlans.filter((plan) => {
    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim();
      const match =
        plan.title.toLowerCase().includes(q) ||
        plan.communityName.toLowerCase().includes(q) ||
        (plan.orderStatusLabel && plan.orderStatusLabel.toLowerCase().includes(q)) ||
        (plan.logisticsInfo?.trackingNumber && plan.logisticsInfo.trackingNumber.toLowerCase().includes(q)) ||
        (plan.tags && plan.tags.some((t) => t.toLowerCase().includes(q)));
      if (!match) return false;
    }
    return true;
  });

  const handleOpenEditPlan = (plan: SavedPlanRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPlan(plan);
    setEditTitle(plan.title);
    setEditCommunity(plan.communityName);
    setEditCost(String(plan.totalCostTenThousand));
    setEditNotes(plan.notes || '');
  };

  const handleSaveEditPlan = () => {
    if (!editingPlan || !editTitle.trim()) return;

    const updated: SavedPlanRecord = {
      ...editingPlan,
      title: editTitle.trim(),
      communityName: editCommunity.trim() || editingPlan.communityName,
      totalCostTenThousand: parseFloat(editCost) || editingPlan.totalCostTenThousand,
      notes: editNotes.trim(),
      updatedAt: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5)}`,
    };

    onUpdatePlan(updated);
    setEditingPlan(null);
    showToast('方案修改已保存');
  };

  const handleDeleteWithConfirm = (plan: SavedPlanRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`确定删除方案【${plan.title}】吗？`)) {
      onDeletePlan(plan.id);
      showToast('方案已删除');
    }
  };

  const handleSavePlanAsTemplate = (plan: SavedPlanRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onSaveAsTemplate) {
      onSaveAsTemplate(plan);
      showToast(`已将方案【${plan.title}】保存至方案模板库！`);
    }
  };

  // Generate real product breakdown items for Contact Sales modal
  const getPlanProductList = (plan: SavedPlanRecord) => {
    const items: {
      room: string;
      category: string;
      name: string;
      model: string;
      qty: number;
      unitPrice: number;
      subtotal: number;
    }[] = [];

    // Core gateway
    items.push({
      room: '弱电核心区',
      category: '智能中枢',
      name: '全屋智能多模中枢网关 Hub',
      model: 'ZHW-Hub-Pro (PoE/有线网口)',
      qty: Math.max(1, Math.ceil((plan.deviceCount || 20) / 25)),
      unitPrice: 480,
      subtotal: Math.max(1, Math.ceil((plan.deviceCount || 20) / 25)) * 480,
    });

    const roomsList = plan.project?.rooms || [];
    if (roomsList.length > 0) {
      roomsList.forEach((room) => {
        const s = room.scheme;
        const circuits = s?.isCustom ? (s?.lighting?.circuitsCount || 2) : 2;
        const dimmable = s?.isCustom ? (s?.lighting?.dimmableCount || 0) : 0;
        const nonDimmable = Math.max(0, circuits - dimmable);

        if (nonDimmable > 0) {
          items.push({
            room: room.name,
            category: '智能照明',
            name: '智能开关控制面板 (零火精装版)',
            model: `H1 Pro ${nonDimmable}路物理按键/继电器`,
            qty: Math.ceil(nonDimmable / 2),
            unitPrice: 199,
            subtotal: Math.ceil(nonDimmable / 2) * 199,
          });
        }

        if (dimmable > 0) {
          items.push({
            room: room.name,
            category: '智能调光',
            name: '深调光恒流驱动电源 (0.1%级无频闪)',
            model: `0-10V / 调光驱动模块 x${dimmable}`,
            qty: dimmable,
            unitPrice: 280,
            subtotal: dimmable * 280,
          });
        }

        if (s?.enableCurtain) {
          const isDouble = s?.curtain?.curtainType === 'open_close' && s?.curtain?.curtainLayer === 'double';
          const mCount = isDouble ? 2 : 1;
          items.push({
            room: room.name,
            category: '智能窗帘',
            name: '超静音智能开合帘电机与航空铝导轨',
            model: `C2 静音直流电机套装 x${mCount}`,
            qty: mCount,
            unitPrice: 680,
            subtotal: mCount * 680,
          });
        }

        if (s?.otherRequirements) {
          if (s.otherRequirements.smartSensors) {
            items.push({
              room: room.name,
              category: '空间传感',
              name: '人体存在毫米波雷达感应器',
              model: 'FP2 微动与多区域侦测雷达',
              qty: 1,
              unitPrice: 399,
              subtotal: 399,
            });
          }
          if (s.otherRequirements.thermostatControl) {
            items.push({
              room: room.name,
              category: '暖通控制',
              name: '全屋智能温控面板 (空调/地暖/新风三合一)',
              model: 'S1E 全彩触控温控面板',
              qty: 1,
              unitPrice: 460,
              subtotal: 460,
            });
          }
          if (s.otherRequirements.smartLock) {
            items.push({
              room: room.name,
              category: '入户安防',
              name: '3D 人脸识别全自动智能门锁',
              model: 'D200 哨兵级人脸猫眼视频锁',
              qty: 1,
              unitPrice: 1899,
              subtotal: 1899,
            });
          }
          if (s.otherRequirements.bgMusic) {
            items.push({
              room: room.name,
              category: '背景音乐',
              name: '全屋隐藏式智能背景音乐功放与同轴音箱',
              model: 'HiFi 高保真吸顶音响单元',
              qty: 1,
              unitPrice: 1280,
              subtotal: 1280,
            });
          }
        }
      });
    }

    // Engineering accessories
    items.push({
      room: '全屋辅材',
      category: '工程辅料',
      name: '原厂标准接线端子与屏蔽双绞网线工程包',
      model: '低烟无卤屏蔽线 + 绝缘端子套件',
      qty: 1,
      unitPrice: 380,
      subtotal: 380,
    });

    return items;
  };

  // Handle Contact Sales & Submit Order
  const handleConfirmContactSales = () => {
    if (!contactSalesPlan) return;

    const updatedPlan: SavedPlanRecord = {
      ...contactSalesPlan,
      status: '已确认方案',
      orderStatus: 'submitted',
      orderStatusLabel: '已提交商务 · 待核价确认',
      contactedBusinessAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      logisticsInfo: {
        carrier: '顺丰速运 (待发货分配)',
        trackingNumber: 'SF' + Math.floor(100000000000 + Math.random() * 900000000000),
        shippingDate: '预计 1-2 工作日出库',
        estimatedArrivalDate: '预计提交后 3-5 天送达',
        recipientName: contactName || '智家用户',
        recipientPhone: contactPhone || '17696180841',
        shippingAddress: deliveryAddress || '客户指定收货地址',
        businessManagerName: '王经理 (专属商务对接)',
        businessManagerPhone: '186-0010-8899',
        businessManagerWechat: 'zhijia_service',
        notes: orderNotes,
        currentStepIndex: 0,
        timeline: [
          {
            status: 'submitted',
            title: '已提交方案与采购需求',
            description: `客户【${contactName}】已提交 ${contactSalesPlan.roomsCount} 空间设备选型采购清单`,
            time: new Date().toLocaleString('zh-CN', { hour12: false }),
            done: true,
          },
          {
            status: 'locked',
            title: '商务经理核价与清单确认',
            description: '专属商务已受理，正在核验设备点位与原厂直供采购单',
            time: '处理中...',
            done: false,
          },
          {
            status: 'packing',
            title: '智能仓储中心扫码配货',
            description: '设备按空间分拣、贴附点位标签并完成防震包装',
            time: '待启动',
            done: false,
          },
          {
            status: 'shipping',
            title: '顺丰速运揽收发运',
            description: '顺丰快递员揽收发出，全程陆运保价运输',
            time: '待启动',
            done: false,
          },
          {
            status: 'delivered',
            title: '派送与客户当面验货',
            description: '送达指定地址，当面开箱清点设备与质保卡',
            time: '待启动',
            done: false,
          },
          {
            status: 'completed',
            title: '专业工程师上门安装联调',
            description: '现场接线、网关联调与全屋场景联动测试交付',
            time: '待启动',
            done: false,
          },
        ],
      },
    };

    onUpdatePlan(updatedPlan);
    setContactSalesPlan(null);
    showToast('已提交商务对接，可随时查看发货进度');
    
    setTimeout(() => {
      setTrackingPlan(updatedPlan);
    }, 300);
  };

  // Simulate advancing the order and shipping status
  const handleAdvanceOrderStatus = (plan: SavedPlanRecord) => {
    if (!plan.logisticsInfo) return;
    const currentStep = plan.logisticsInfo.currentStepIndex ?? 0;
    const nextStep = Math.min(5, currentStep + 1);

    const stepStatusKeys: OrderShippingStatus[] = ['submitted', 'locked', 'packing', 'shipping', 'delivered', 'completed'];
    const stepStatusLabels = [
      '已提交商务 · 待核实',
      '商务已接单 · 方案已锁定',
      '仓库配货中 · 待出库',
      '顺丰速运发货中',
      '已送达收货地址',
      '已安装调试交付完成',
    ];

    const nextTimeline = plan.logisticsInfo.timeline.map((item, idx) => ({
      ...item,
      done: idx <= nextStep,
      time: idx === nextStep ? new Date().toLocaleString('zh-CN', { hour12: false }) : item.time,
    }));

    const updatedPlan: SavedPlanRecord = {
      ...plan,
      orderStatus: stepStatusKeys[nextStep],
      orderStatusLabel: stepStatusLabels[nextStep],
      logisticsInfo: {
        ...plan.logisticsInfo,
        currentStepIndex: nextStep,
        timeline: nextTimeline,
      },
    };

    onUpdatePlan(updatedPlan);
    if (trackingPlan?.id === plan.id) {
      setTrackingPlan(updatedPlan);
    }
    showToast(`状态已更新为：${stepStatusLabels[nextStep]}`);
  };

  return (
    <div className="space-y-3 animate-fadeIn pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-xl flex items-center space-x-2 border border-slate-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search Bar - Clean & Direct */}
      <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="搜索方案名称、小区、运单号..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full text-xs text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
        />
        {keyword && (
          <button
            onClick={() => setKeyword('')}
            className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Plan Records List */}
      <div className="space-y-2.5">
        {filteredPlans.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-2 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FolderHeart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700">暂无方案记录</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">可以在工作台完成设计后点击保存方案</p>
            </div>
            <div className="pt-2">
              <button
                onClick={onGoToDesign}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                前往方案定制
              </button>
            </div>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const hasOrder = plan.orderStatus && plan.orderStatus !== 'draft';
            const isShipping = plan.orderStatus === 'shipping' || plan.orderStatus === 'packing';

            return (
              <div
                key={plan.id}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs hover:shadow-sm transition-all space-y-2.5"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-2">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="text-xs font-black text-slate-900">
                        {plan.title}
                      </span>
                      {hasOrder ? (
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                          isShipping ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {plan.orderStatusLabel || '商务对接中'}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-slate-100 text-slate-600">
                          草稿
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      📍 {plan.communityName} · {plan.roomsCount}空间 · {plan.updatedAt}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-slate-900 font-mono">
                      ¥{plan.totalCostTenThousand}万
                    </span>
                    <span className="text-[10px] text-slate-400 block">设备估算</span>
                  </div>
                </div>

                {/* Logistics Quick Pill if ordered */}
                {hasOrder && plan.logisticsInfo && (
                  <div
                    onClick={() => setTrackingPlan(plan)}
                    className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center space-x-1.5 text-slate-800 font-medium truncate">
                      <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">物流：{plan.logisticsInfo.carrier} ({plan.logisticsInfo.trackingNumber})</span>
                    </div>
                    <span className="text-blue-600 font-bold shrink-0 text-[10px] ml-1">查看轨迹 ›</span>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex items-center space-x-1.5 pt-0.5">
                  <button
                    onClick={() => onLoadPlan(plan)}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-amber-400 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>导入定制</span>
                  </button>

                  {!hasOrder ? (
                    <button
                      onClick={() => setContactSalesPlan(plan)}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      联系商务
                    </button>
                  ) : (
                    <button
                      onClick={() => setTrackingPlan(plan)}
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      发货跟踪
                    </button>
                  )}

                  <button
                    onClick={(e) => handleSavePlanAsTemplate(plan, e)}
                    className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                    title="保存为方案模板"
                  >
                    <FileStack className="w-3.5 h-3.5 text-amber-600" />
                    <span>存为模板</span>
                  </button>

                  <button
                    onClick={(e) => handleOpenEditPlan(plan, e)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors cursor-pointer"
                    title="编辑方案"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onClonePlan(plan)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors cursor-pointer"
                    title="复制方案"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDeleteWithConfirm(plan, e)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs transition-colors cursor-pointer"
                    title="删除方案"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <h3 className="font-extrabold text-sm">编辑方案记录</h3>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  方案名称
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  所属小区 / 户型
                </label>
                <input
                  type="text"
                  value={editCommunity}
                  onChange={(e) => setEditCommunity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  预估预算 (万元)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editCost}
                  onChange={(e) => setEditCost(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  方案备注 / 需求说明
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none resize-none"
                  placeholder="记录空间需求或点位说明..."
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex space-x-2">
              <button
                onClick={() => setEditingPlan(null)}
                className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveEditPlan}
                className="flex-2 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>保存修改</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Sales Modal with Comprehensive Product List */}
      {contactSalesPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold text-amber-400 block">联系商务对接与产品采购核价</span>
                <h3 className="font-extrabold text-sm mt-0.5">{contactSalesPlan.title}</h3>
              </div>
              <button
                onClick={() => setContactSalesPlan(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1">
              {/* Product List Breakdown Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900 flex items-center space-x-1.5">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>方案产品与设备采购清单</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    预估总价: <strong className="text-slate-900">¥{contactSalesPlan.totalCostTenThousand}万</strong>
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-200/80 max-h-52 overflow-y-auto">
                  {getPlanProductList(contactSalesPlan).map((prod, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-[11px] hover:bg-slate-100 transition-colors">
                      <div className="flex-1 pr-2 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[9px] font-bold shrink-0">
                            {prod.room}
                          </span>
                          <span className="font-bold text-slate-900 truncate">{prod.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{prod.model}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900 font-mono">
                          x{prod.qty}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          ¥{prod.subtotal}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Contact Info Form */}
              <div className="space-y-2.5 pt-1 border-t border-slate-100">
                <h4 className="font-extrabold text-xs text-slate-900">收货与对接信息</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">联系人</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">联系电话</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">收货地址</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">采购与发货要求说明 (选填)</label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 outline-none resize-none"
                    placeholder="如：需确认双轨窗帘盒尺寸、特定品牌要求等..."
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex space-x-2 shrink-0">
              <button
                onClick={() => setContactSalesPlan(null)}
                className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmContactSales}
                className="flex-2 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>确认清单并提交商务</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Logistics Tracking Modal */}
      {trackingPlan && trackingPlan.logisticsInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold text-amber-400 block">发货与物流实时跟踪</span>
                <h3 className="font-extrabold text-sm">{trackingPlan.title}</h3>
              </div>
              <button
                onClick={() => setTrackingPlan(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">承运快递</span>
                  <span className="font-bold text-slate-900">{trackingPlan.logisticsInfo.carrier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">顺丰单号</span>
                  <span className="font-bold text-blue-700 font-mono">{trackingPlan.logisticsInfo.trackingNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">商务对接</span>
                  <span className="text-slate-800 font-medium">{trackingPlan.logisticsInfo.businessManagerName}</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">物流节点进度</h4>
                <div className="space-y-2 pl-1 border-l-2 border-slate-200 ml-2">
                  {trackingPlan.logisticsInfo.timeline.map((node, idx) => (
                    <div key={idx} className="relative pl-4 space-y-0.5">
                      <div
                        className={`absolute -left-[9px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                          node.done ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${node.done ? 'text-slate-900' : 'text-slate-400'}`}>
                          {node.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{node.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{node.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex space-x-2 shrink-0">
              <button
                onClick={() => handleAdvanceOrderStatus(trackingPlan)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                模拟推进节点
              </button>
              <button
                onClick={() => setTrackingPlan(null)}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
