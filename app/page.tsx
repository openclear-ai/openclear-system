'use client';
import React, { useState, useEffect } from 'react';

export default function OpenClearSmartSystem() {
  const [cny, setCny] = useState('');
  const [description, setDescription] = useState('');
  // 设定一个真实参考汇率：目前 1 AUD 约等于 4.7 CNY，所以 1 CNY ≈ 0.21 AUD
  const [rate, setRate] = useState(0.2128); 
  const [warning, setWarning] = useState('');

  // 逻辑 A：AI 风险预审
  const checkRisk = (text: string) => {
    setDescription(text);
    const forbidden = ['tobacco', 'cigarette', 'alcohol', 'wine', 'battery', 'meat'];
    const found = forbidden.find(item => text.toLowerCase().includes(item));
    if (found) {
      setWarning(`⚠️ 拦截提示: 检测到敏感品类 "${found}"。请确认是否有进口许可！`);
    } else {
      setWarning('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-8 md:p-12">
        
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">OpenClear <span className="text-red-600">CNY</span></h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Breathing Pty Ltd · China-AU Trade Hub</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">M4 Silicon Native</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">货物描述 (Goods Description)</label>
              <textarea 
                value={description}
                onChange={(e) => checkRisk(e.target.value)}
                placeholder="例如: 服装、电子产品..."
                className={`w-full p-5 bg-slate-50 border-2 rounded-3xl outline-none transition-all h-24 resize-none ${warning ? 'border-red-400 bg-red-50' : 'border-slate-100 focus:border-blue-500'}`}
              />
              {warning && <p className="text-red-600 text-xs mt-3 font-bold animate-pulse">{warning}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">采购金额 (CNY)</label>
                 <div className="relative">
                    <span className="absolute left-4 top-4 font-bold text-slate-400">¥</span>
                    <input 
                      type="number" 
                      value={cny}
                      onChange={(e) => setCny(e.target.value)}
                      className="w-full p-4 pl-8 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono text-xl"
                      placeholder="0.00"
                    />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">实时汇率 (CNY/AUD)</label>
                 <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl font-mono text-xl text-red-600 font-bold">
                   {rate}
                 </div>
               </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-3xl">
            <div className="relative z-10">
              <p className="text-red-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">报关总值 (AUD Total)</p>
              <h2 className="text-7xl font-black tracking-tighter">
                <span className="text-3xl font-light opacity-40 mr-2">$</span>
                {cny ? (parseFloat(cny) * rate).toFixed(2) : '0.00'}
              </h2>
              <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] text-slate-500 uppercase font-black">Trade Note</p>
                <p className="text-xs text-slate-300 mt-1">此金额已包含基于采购价转换的预估报关值。</p>
              </div>
            </div>
            
            <button className={`relative z-10 w-full py-6 rounded-2xl font-black text-lg transition-all ${warning ? 'bg-slate-800 cursor-not-allowed text-slate-500' : 'bg-red-600 hover:bg-white hover:text-red-600'}`}>
              {warning ? '无法提交' : '确认并发送报关数据'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}