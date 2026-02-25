'use client';
import React, { useState } from 'react';

export default function OpenClearProSystem() {
  const [cny, setCny] = useState('');
  const [description, setDescription] = useState('');
  const [mawb, setMawb] = useState('');
  const [rate] = useState(0.2128); 
  const [warning, setWarning] = useState('');
  const [showPdf, setShowPdf] = useState(false);

  const checkRisk = (text: string) => {
    setDescription(text);
    const forbidden = ['tobacco', 'cigarette', 'alcohol', 'wine', 'battery', 'meat'];
    const found = forbidden.find(item => text.toLowerCase().includes(item));
    setWarning(found ? `⚠️ 风险提示: 检测到敏感品类 "${found}"。请核实进口许可。` : '');
  };

  const handleConfirm = () => {
    if (!warning && cny && mawb) {
      setShowPdf(true); // 激活 PDF 预览模态框
    } else {
      alert("请确保填写了单号和金额，且无风险警报。");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        
        {/* 左侧：录入面板 (占据 2/3) */}
        <div className="md:col-span-2 bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-200">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-black italic">OpenClear <span className="text-red-600 font-normal">CNY</span></h1>
            <div className="bg-slate-900 text-white text-[10px] px-3 py-1 rounded-full font-bold">PRO EDITION</div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Master Air Waybill (MAWB)</label>
              <input type="text" value={mawb} onChange={(e)=>setMawb(e.target.value)} placeholder="请输入主单号..." className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-red-500 outline-none font-mono text-lg" />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">货物描述 (AI Scanning)</label>
              <textarea value={description} onChange={(e) => checkRisk(e.target.value)} placeholder="例如: Clothes / Phone Case..." className={`w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none h-24 resize-none transition-all ${warning ? 'border-red-400 bg-red-50' : 'border-slate-100 focus:border-red-500'}`} />
              {warning && <p className="text-red-600 text-xs mt-2 font-bold">{warning}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">采购价 (CNY)</p>
                <input type="number" value={cny} onChange={(e)=>setCny(e.target.value)} placeholder="0.00" className="bg-transparent text-3xl font-black text-center outline-none w-full" />
              </div>
              <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100 text-center text-red-600">
                <p className="text-[10px] font-black text-red-400 uppercase mb-2">报关值 (AUD)</p>
                <p className="text-3xl font-black italic">${cny ? (parseFloat(cny) * rate).toFixed(2) : '0.00'}</p>
              </div>
            </div>

            <button onClick={handleConfirm} className="w-full bg-red-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-black transition-all shadow-lg shadow-red-200">
              {warning ? '无法提交' : '确认并生成报关单 (PDF)'}
            </button>
          </div>
        </div>

        {/* 右侧：模拟 PDF 预览区域 */}
        <div className="bg-slate-200 rounded-[2.5rem] border-4 border-dashed border-slate-300 flex items-center justify-center p-6 text-center">
          {!showPdf ? (
            <div className="text-slate-400">
              <p className="text-4xl mb-4">📄</p>
              <p className="text-xs font-bold uppercase tracking-widest">等待生成预览...</p>
            </div>
          ) : (
            <div className="bg-white w-full h-full shadow-2xl p-6 text-left animate-in fade-in zoom-in duration-500 relative">
              <div className="border-b-2 border-black pb-4 mb-4 text-center">
                <h2 className="text-sm font-black uppercase">Customs Declaration Advice</h2>
                <p className="text-[8px] text-slate-500">Document No: OC-{Math.floor(Math.random()*100000)}</p>
              </div>
              <div className="space-y-3 text-[10px]">
                <p><strong>MAWB:</strong> {mawb}</p>
                <p><strong>Importer:</strong> Breathing Pty Ltd</p>
                <p><strong>Goods:</strong> {description}</p>
                <p><strong>Value:</strong> ¥{cny} → AUD ${(parseFloat(cny) * rate).toFixed(2)}</p>
                <p><strong>Status:</strong> <span className="text-green-600 font-bold">PRE-CLEARED BY AI</span></p>
              </div>
              <div className="absolute bottom-6 left-6 right-6 border-t pt-4">
                <div className="w-12 h-12 border border-black flex items-center justify-center text-[8px] font-bold">SEAL</div>
              </div>
              <button onClick={()=>setShowPdf(false)} className="absolute -top-4 -right-4 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-xs">×</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}