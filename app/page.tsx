'use client';
import React, { useState, useMemo } from 'react';

export default function OpenClearConsole() {
  const [cny, setCny] = useState('');
  const [description, setDescription] = useState('');
  const [mawb, setMawb] = useState('');
  const [rate] = useState(0.2128);
  const [warning, setWarning] = useState('');
  const [showPdf, setShowPdf] = useState(false);

  // 模拟同行截图中的费用项目
  const charges = [
    { name: 'Handling Fee', cost: 7, qty: 1 },
    { name: 'Storage Fee (Pallet)', cost: 30, qty: 0 },
    { name: 'Document Fee', cost: 15, qty: 1 },
  ];

  const subtotalCharges = useMemo(() => 
    charges.reduce((acc, curr) => acc + (curr.cost * curr.qty), 0), []
  );

  const totalAud = useMemo(() => {
    const goodsVal = cny ? parseFloat(cny) * rate : 0;
    return (goodsVal + subtotalCharges).toFixed(2);
  }, [cny, rate, subtotalCharges]);

  const checkRisk = (text: string) => {
    setDescription(text);
    const forbidden = ['tobacco', 'cigarette', 'alcohol', 'wine', 'battery'];
    const found = forbidden.find(item => text.toLowerCase().includes(item));
    setWarning(found ? `RISK DETECTED: ${found.toUpperCase()}` : '');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-300 p-4 md:p-8 font-mono uppercase tracking-tighter">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Header - Full Width */}
        <div className="md:col-span-12 flex justify-between items-center bg-[#141417] border border-white/5 p-6 rounded-2xl mb-2">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <h1 className="text-xl font-black text-white italic">OpenClear <span className="text-red-600">AI</span></h1>
            <span className="text-[10px] text-slate-500 border border-white/10 px-2 py-0.5 rounded">v2.0 Beta</span>
          </div>
          <div className="flex gap-8 text-[10px]">
            <div className="text-right"><p className="text-slate-500">Network</p><p className="text-white">Secure v4</p></div>
            <div className="text-right"><p className="text-slate-500">Latency</p><p className="text-green-500">12ms</p></div>
          </div>
        </div>

        {/* Column 1: Input (8 Cols) */}
        <div className="md:col-span-8 space-y-4">
          {/* Section: Shipment */}
          <div className="bg-[#141417] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
            <h3 className="text-[10px] font-bold text-slate-500 mb-6 flex items-center gap-2">
               <span className="w-1 h-1 bg-red-600"></span> Shipment Details
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[9px] text-slate-600">Master Air Waybill</p>
                <input value={mawb} onChange={e=>setMawb(e.target.value)} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl focus:border-red-600 outline-none text-white text-sm" placeholder="MAWB-784-000" />
              </div>
              <div className="space-y-2">
                <p className="text-[9px] text-slate-600">Cargo Description</p>
                <input value={description} onChange={e=>checkRisk(e.target.value)} className={`w-full bg-black/40 border p-3 rounded-xl outline-none text-white text-sm transition-all ${warning ? 'border-red-600 animate-pulse' : 'border-white/10'}`} placeholder="AI Scanning..." />
              </div>
            </div>
            {warning && <p className="text-red-600 text-[10px] mt-4 font-bold tracking-widest leading-none">{warning}</p>}
          </div>

          {/* Section: Financials (Bento Box Style) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#141417] border border-white/5 p-6 rounded-3xl">
               <p className="text-[9px] text-slate-600 mb-4 tracking-widest">Procurement Value (CNY)</p>
               <div className="flex items-end gap-2 text-white">
                 <span className="text-xl font-light opacity-20">¥</span>
                 <input type="number" value={cny} onChange={e=>setCny(e.target.value)} className="bg-transparent text-4xl font-black outline-none w-full" placeholder="0.00" />
               </div>
            </div>
            <div className="bg-[#141417] border border-white/5 p-6 rounded-3xl">
               <p className="text-[9px] text-slate-600 mb-4 tracking-widest">FX Rate (CNY/AUD)</p>
               <p className="text-4xl font-black text-red-600 italic leading-none">{rate}</p>
               <p className="text-[8px] text-slate-600 mt-2 italic">Real-time quote via GlobalFX</p>
            </div>
          </div>

          {/* Section: Charge Table */}
          <div className="bg-[#141417] border border-white/5 p-6 rounded-3xl">
             <table className="w-full text-[10px]">
                <thead><tr className="text-slate-600 border-b border-white/5"><th className="text-left pb-2">Item Description</th><th className="text-right pb-2">Unit Cost</th><th className="text-right pb-2">Qty</th><th className="text-right pb-2">Total</th></tr></thead>
                <tbody className="text-white">
                   {charges.map((c, i) => (
                     <tr key={i} className="border-b border-white/5"><td className="py-3 uppercase opacity-70">{c.name}</td><td className="text-right">${c.cost}</td><td className="text-right opacity-40">{c.qty}</td><td className="text-right">${c.cost * c.qty}</td></tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>

        {/* Column 2: Dashboard (4 Cols) */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-red-600 rounded-3xl p-8 text-black flex flex-col justify-between h-[280px] shadow-[0_0_50px_rgba(220,38,38,0.2)]">
            <div>
              <p className="font-black text-[10px] tracking-widest opacity-60">Total Customs Value</p>
              <h2 className="text-6xl font-black italic tracking-tighter mt-2 leading-none">
                <span className="text-2xl">$</span>{totalAud}
              </h2>
            </div>
            <button onClick={handleConfirm} className="w-full bg-black text-white py-4 rounded-xl font-black text-xs hover:bg-white hover:text-black transition-all">
               {warning ? 'SYS_LOCK: RISK' : 'CONFIRM & EXECUTE'}
            </button>
          </div>

          <div className="bg-[#141417] border border-white/5 rounded-3xl p-6 min-h-[300px] flex items-center justify-center relative overflow-hidden">
            {!showPdf ? (
              <div className="text-center opacity-20">
                <div className="w-16 h-1 bg-white/10 mx-auto mb-2"></div>
                <p className="text-[8px] font-black italic tracking-[0.4em]">Pending Data</p>
              </div>
            ) : (
              <div className="bg-white w-full h-full p-6 text-black animate-in slide-in-from-bottom-4 duration-500 rounded-lg">
                 <div className="border-b-4 border-black pb-2 mb-4">
                    <p className="text-[8px] font-black">ADVICE_NOTE // OPEN_CLEAR</p>
                 </div>
                 <div className="space-y-4 text-[9px] font-bold">
                    <p>MAWB: <span className="font-normal">{mawb}</span></p>
                    <p>DESC: <span className="font-normal">{description}</span></p>
                    <p>TOTAL: <span className="font-normal">${totalAud} AUD</span></p>
                    <div className="mt-12 h-16 border-2 border-black/10 flex items-center justify-center opacity-20 italic">DIGITAL_SEAL_ACTIVE</div>
                 </div>
                 <button onClick={()=>setShowPdf(false)} className="absolute top-2 right-2 text-black font-black text-xl">×</button>
              </div>
            )}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>
        </div>
      </div>
    </div>
  );

  function handleConfirm() {
    if (!warning && cny && mawb) setShowPdf(true);
    else alert("SYSTEM ERROR: PLEASE CHECK INPUT DATA");
  }
}