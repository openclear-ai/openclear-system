'use client';
import React, { useState, useEffect } from 'react';

export default function OpenClearSmartSystem() {
  const [usd, setUsd] = useState('');
  const [description, setDescription] = useState('');
  const [rate, setRate] = useState(1.54); // 默认汇率
  const [warning, setWarning] = useState('');

  // 逻辑 B：模拟实时汇率获取 (未来可接入真正的 API)
  useEffect(() => {
    // 这里预留了接口位置，目前设定为每小时自动轻微波动模拟真实感
    const mockLiveRate = 1.54 + (Math.random() * 0.02 - 0.01);
    setRate(parseFloat(mockLiveRate.toFixed(4)));
  }, []);

  // 逻辑 A：AI 风险预审 (关键词识别)
  const checkRisk = (text: string) => {
    setDescription(text);
    const forbidden = ['tobacco', 'cigarette', 'alcohol', 'wine', 'battery'];
    const found = forbidden.find(item => text.toLowerCase().includes(item));
    if (found) {
      setWarning(`⚠️ 风险提示: 检测到敏感词 "${found}"。此类货物可能需要特殊许可证或缴纳额外消费税。`);
    } else {
      setWarning('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-8 md:p-12">
        
        {/* 顶部状态栏 */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">OpenClear <span className="text-blue-600">AI</span></h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Breathing Pty Ltd · Border Compliance v1.2</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-green-500 w-2 h-2 rounded-full animate-pulse mb-2"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase">Live Hub: Sydney</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* 左侧：输入区 */}
          <div className="space-y-8">
            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Goods Description (AI Scanning)</label>
              <textarea 
                value={description}
                onChange={(e) => checkRisk(e.target.value)}
                placeholder="例如: Electronics for personal use..."
                className={`w-full p-5 bg-slate-50 border-2 rounded-3xl outline-none transition-all h-32 resize-none ${warning ? 'border-red-400 bg-red-50' : 'border-slate-100 focus:border-blue-500'}`}
              />
              {warning && <p className="text-red-500 text-xs mt-3 font-bold animate-bounce">{warning}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Value (USD)</label>
                 <input 
                   type="number" 
                   value={usd}
                   onChange={(e) => setUsd(e.target.value)}
                   className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono text-xl"
                   placeholder="0.00"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Live Rate</label>
                 <div className="p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl font-mono text-xl text-blue-600 font-bold">
                   {rate}
                 </div>
               </div>
            </div>
          </div>

          {/* 右侧：结果展示 */}
          <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-3xl">
            <div className="relative z-10">
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Tax Calculation (AUD)</p>
              <h2 className="text-7xl font-black tracking-tighter">
                <span className="text-3xl font-light opacity-40 mr-2">$</span>
                {usd ? (parseFloat(usd) * rate).toFixed(2) : '0.00'}
              </h2>
              <div className="mt-8 space-y-4">
                <div className="flex justify-between text-xs border-b border-white/10 pb-2">
                  <span className="text-slate-500">GST (10%)</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-xs border-b border-white/10 pb-2">
                  <span className="text-slate-500">Duty Rate</span>
                  <span>0.00% (Free Trade)</span>
                </div>
              </div>
            </div>
            
            <button className={`relative z-10 w-full py-6 rounded-2xl font-black text-lg transition-all ${warning ? 'bg-slate-800 cursor-not-allowed text-slate-500' : 'bg-blue-600 hover:bg-white hover:text-blue-600'}`}>
              {warning ? 'PRE-CHECK FAILED' : 'CONFIRM TO CUSTOMS'}
            </button>

            {/* 背景装饰 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

