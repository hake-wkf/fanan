import React, { useState } from 'react';
import {
  User,
  FolderHeart,
  FileStack,
  ChevronRight,
  RotateCcw,
  Home,
  Truck,
  Phone,
  Edit3,
  MapPin,
  X,
  Check,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface UserProfileViewProps {
  user: UserProfile;
  savedPlansCount: number;
  templatesCount?: number;
  activeOrdersCount?: number;
  onOpenLoginModal: () => void;
  onGoToRecords: () => void;
  onGoToTemplates: () => void;
  onGoToDesign: () => void;
  onResetData: () => void;
  onUpdateUser: (user: UserProfile) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  savedPlansCount,
  templatesCount = 6,
  activeOrdersCount = 2,
  onOpenLoginModal,
  onGoToRecords,
  onGoToTemplates,
  onGoToDesign,
  onResetData,
  onUpdateUser,
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name || '卫科帆');
  const [editPhone, setEditPhone] = useState(user.phone || '17696180841');
  const [editCity, setEditCity] = useState(user.city || '北京市 / 朝阳区');

  const handleSaveProfile = () => {
    const updated: UserProfile = {
      ...user,
      name: editName.trim() || '智家用户',
      phone: editPhone.trim() || '17696180841',
      city: editCity.trim() || '北京市 / 朝阳区',
    };
    onUpdateUser(updated);
    setIsEditingProfile(false);
  };

  return (
    <div className="space-y-3 animate-fadeIn pb-10">
      {/* Clean User Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={
                user.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={user.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
            />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                {user.name || '卫科帆'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1 font-mono">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{user.phone || '17696180841'}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{user.city || '北京市 / 朝阳区'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditName(user.name || '卫科帆');
              setEditPhone(user.phone || '17696180841');
              setEditCity(user.city || '北京市 / 朝阳区');
              setIsEditingProfile(true);
            }}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>编辑</span>
          </button>
        </div>

        {/* Quick Numbers */}
        <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100 text-center">
          <button
            onClick={onGoToRecords}
            className="p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-center"
          >
            <span className="text-base font-black text-slate-900 font-mono block">
              {savedPlansCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">我的方案</span>
          </button>

          <button
            onClick={onGoToTemplates}
            className="p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-center"
          >
            <span className="text-base font-black text-slate-900 font-mono block">
              {templatesCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">方案模板</span>
          </button>

          <button
            onClick={onGoToRecords}
            className="p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-center"
          >
            <span className="text-base font-black text-blue-600 font-mono block">
              {activeOrdersCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">发货跟踪</span>
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100">
        <button
          onClick={onGoToRecords}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderHeart className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">我的方案记录</span>
              <span className="text-[11px] text-slate-400">
                已保存 {savedPlansCount} 套定制方案 · 支持编辑与联系商务
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onGoToTemplates}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileStack className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">方案模板库</span>
              <span className="text-[11px] text-slate-400">
                管理与编辑常用空间配置模板
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onGoToRecords}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">发货与物流跟踪</span>
              <span className="text-[11px] text-slate-400">
                实时跟进设备配货、顺丰物流与现场安装
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onGoToDesign}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">方案定制工作台</span>
              <span className="text-[11px] text-slate-400">
                空间划分、灯光回路、智能窗帘与设备选配
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onResetData}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">重置方案与清空缓存</span>
              <span className="text-[11px] text-slate-400">恢复出厂配置与演示数据</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm">编辑个人信息</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">姓名</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">联系电话</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">所在地区</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex space-x-2">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-2 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>保存信息</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
