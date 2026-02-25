import React from 'react';

export default function OpenClearDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-12 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 p-10">
        
        {/* 顶部标题栏：展示给银行看的专业度 */}
        <div className="flex justify-between items-center border-b pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">OpenClear SAC 系统</h1>
            <p className="text-blue-600 font-bold mt-1 text-sm uppercase tracking-wider">智能通关平台 · 自主研发专用</p>
          </div>
          <div className="text-right">
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
              M4 SILICON NATIVE
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-mono">NODE v22.22.0 | LOCALHOST:3000</p>
          </div>
        </div>

        {/* 申报字段区：复刻 Surface 里的核心逻辑 */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* 单号录入 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase">主单号 (MAWB / MBL)</label>
              <input type="text" placeholder="784-XXXXXXXX" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-mono text-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase">运输模式</label>
              <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                <option>航空 (Air Cargo)</option>
                <option>海运 (Sea Cargo)</option>
              </select>
            </div>
          </div>

          {/* 货物描述：带 AI 提醒 */}
          <div className="p-6 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-3xl">
            <label className="text-xs font-black text-blue-900 uppercase">货物描述 (Goods Description)</label>
            <input type="text" placeholder="例如: Electronics / Apparel" className="w-full mt-2 p-3 bg-white border border-blue-100 rounded-xl outline-none text-lg" />
            <div className="flex items-center gap-2 mt-3 text-blue-700">
              <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded">AI Check</span>
              <p className="text-[11px] font-medium italic">正在实时监测烟酒及违禁品关键词...</p>
            </div>
          </div>

          {/* 价值计算 */}
          <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
             <div className="relative z-10 flex justify-between items-end">
                <div className="space-y-2">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Cargo Value (USD)</p>
                  <div className="flex items-center">
                    <span className="text-2xl font-light mr-1 text-slate-500">$</span>
                    <input type="number" placeholder="0.00" className="bg-transparent text-5xl font-black outline-none w-48 text-white placeholder-slate-700" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Est. Total (AUD)</p>
                  <p className="text-4xl font-black text-green-400 mt-1">$ 0.00</p>
                </div>
             </div>
             {/* 装饰用背景 */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
          </div>

          {/* 模拟 ICS 勾选项 */}
          <div className="flex items-start gap-4 p-5 bg-orange-50/50 border border-orange-100 rounded-2xl">
            <input type="checkbox" className="w-6 h-6 mt-0.5 rounded-lg accent-orange-600" />
            <p className="text-xs text-orange-800 leading-relaxed font-medium">
              本人特此声明：根据澳大利亚海关法规定，本批次货物申报价值未超过 $1,000 AUD，且不含任何烟草、酒精或受管控物品。
            </p>
          </div>

          {/* 提交按钮 */}
          <button className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all shadow-2xl shadow-blue-200 uppercase tracking-widest">
            生成报文并发往 ICS
          </button>
        </div>

        <div className="mt-12 text-center border-t pt-8">
          <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">
            © 2026 Breathing Pty Ltd · OpenClear Engine v1.0
          </p>
        </div>
      </div>
    </div>
  );
}