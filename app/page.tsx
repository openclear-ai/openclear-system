'use client'; // 启用交互功能
import React, { useState } from 'react';

export default function OpenClearDashboard() {
  const [usd, setUsd] = useState('');
  const rate = 1.54; // 模拟当前汇率

  return (
    <div className="min-h-screen bg-slate-50 p-12 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 p-10">
        
        {/* 顶部标题 */}
        <div className="flex justify-between items-center border-b pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-black italic">OpenClear <span className="text-blue-600">SAC</span></h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Breathing Pty Ltd · AI Engine v1.0</p>
          </div>
          <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-[10px] font-black uppercase">
            M4 Silicon Optimized
          </div>
        </div>

        <div className="grid gap-8">
          {/* 单号录入 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Air Waybill (MAWB)</label>
            <input type="text" placeholder="784-XXXXXXXX" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-mono text-xl transition-all" />
          </div>

          {/* 实时汇率换算区 */}
          <div className="bg-slate-950 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-200 relative overflow-hidden">
             <div className="relative z-10 grid grid-cols-2 gap-8 items-center">
                <div className="space-y-2">
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-tighter">Declared Value (USD)</p>
                  <div className="flex items-center text-white">
                    <span className="text-2xl font-light opacity-30">$</span>
                    <input 
                      type="number" 
                      value={usd}
                      onChange={(e) => setUsd(e.target.value)}
                      placeholder="0.00" 
                      className="bg-transparent text-5xl font-black outline-none w-full placeholder:text-slate-800" 
                    />
                  </div>
                </div>
                <div className="text-right border-l border-white/10 pl-8">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-tighter text-green-400">Total in (AUD)</p>
                  <p className="text-5xl font-black text-white mt-1">
                    <span className="text-2xl font-light opacity-30 mr-1">$</span>
                    {usd ? (parseFloat(usd) * rate).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 italic">Live Rate: 1 USD = {rate} AUD</p>
                </div>
             </div>
             {/* 装饰背景光晕 */}
             <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full"></div>
          </div>

          {/* 提交按钮 */}
          <button className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-200">
            CONFIRM & SEND TO ICS
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-slate-400 font-medium">Licensed to Breathing Pty Ltd · Sydney, Australia</p>
        </div>
      </div>
    </div>
  );
}