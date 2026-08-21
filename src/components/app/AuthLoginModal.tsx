import React, { useState } from 'react';
import {
  X,
  Smartphone,
  ShieldCheck,
  User,
  ArrowRight,
  CheckCircle2,
  Phone,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface AuthLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthLoginModal: React.FC<AuthLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [phone, setPhone] = useState(currentUser.phone || '17696180841');
  const [smsCode, setSmsCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSendSms = () => {
    if (!phone || phone.length < 11) {
      setErrorMsg('请输入11位手机号码');
      return;
    }
    setErrorMsg('');
    setCountdown(60);
    setSmsCode('8888');
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 11) {
      setErrorMsg('请输入正确的11位手机号码');
      return;
    }

    const updatedProfile: UserProfile = {
      ...currentUser,
      phone: phone || '17696180841',
      name: phone === '17696180841' ? '卫科帆' : `智家用户_${phone.slice(-4)}`,
      roleTitle: '智家全屋定制用户',
      city: '北京市 / 朝阳区',
      isLoggedIn: true,
    };

    onLoginSuccess(updatedProfile);
    onClose();
  };

  const handleQuickSwitch = (name: string, phoneNum: string) => {
    const profile: UserProfile = {
      ...currentUser,
      id: 'usr_' + phoneNum.slice(-4),
      phone: phoneNum,
      name: name,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      roleTitle: '智家全屋定制用户',
      city: '北京市 / 朝阳区',
      isLoggedIn: true,
    };

    onLoginSuccess(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">智家个人中心 · 快捷登录</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                同步您的专属方案记录与商品发货进度
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center space-x-1.5">
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleFormLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                手机号码
              </label>
              <div className="flex items-center space-x-2 border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 transition-colors">
                <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="tel"
                  placeholder="请输入11位手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-transparent outline-none font-mono"
                  maxLength={11}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                短信验证码
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 flex items-center space-x-2 border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="验证码"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    className="w-full text-xs text-slate-800 bg-transparent outline-none font-mono"
                    maxLength={6}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendSms}
                  disabled={countdown > 0}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                    countdown > 0
                      ? 'bg-slate-100 text-slate-400 border border-slate-200'
                      : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  {countdown > 0 ? `${countdown}s 后重试` : '获取验证码'}
                </button>
              </div>
              {countdown > 0 && (
                <p className="text-[10px] text-emerald-600 mt-1">已自动填充测试验证码: 8888</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5 mt-2"
            >
              <span>立即登录</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick User Switcher */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] text-slate-400 block font-bold">
              演示快捷切换测试账号：
            </span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleQuickSwitch('卫科帆', '17696180841')}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-[11px] font-bold text-slate-700 text-center"
              >
                卫科帆
              </button>
              <button
                type="button"
                onClick={() => handleQuickSwitch('李明', '13800138000')}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-[11px] font-bold text-slate-700 text-center"
              >
                李明
              </button>
              <button
                type="button"
                onClick={() => handleQuickSwitch('陈先生', '13912345678')}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-[11px] font-bold text-slate-700 text-center"
              >
                陈先生
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
