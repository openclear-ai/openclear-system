'use client';

import React, { useState } from 'react';
import { 
  Plane, AlertCircle, History, Sparkles, 
  Download, FileText, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // 使用更通用的引用方式

// --- 业务配置：方便你随时改汇率 ---
const EXCHANGE_RATE = 1.54; 

export default function TrackerPage() {
  // 1. 状态管理：控制是“查验中”还是“已放行”
  const [status, setStatus] = useState<'held' | 'cleared'>('held');
  const [cnyValue] = useState<number>(8116.88); 
  
  // 2. 核心逻辑：中澳汇率换算
  const audValue = (cnyValue * EXCHANGE_RATE).toLocaleString('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 md:p-8 font-sans">
      
      {/* 演示切换按钮：实际开发时可删除 */}
      <div className="fixed top-6 right-6 flex gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-slate-200 z-50">
        <button 
          onClick={() => setStatus('held')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${status === 'held' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          模拟查验 (HELD)
        </button>
        <button 
          onClick={() => setStatus('cleared')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${status === 'cleared' ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          模拟放行 (CLEARED)
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full bg-white border border-slate-100 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        <div className="p-8 md:p-12">
          
          {/* 头部：MAWB信息与自动换算结果 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">MAWB 160-12345678</h1>
                <span className="px-2.5 py-1 text-[10px] font-black bg-slate-100 text-slate-500 rounded-md uppercase tracking-widest">High Priority</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-bold">
                <span>CAN</span>
                <Plane size={16} className="rotate-45 text-slate-300" />
                <span>SYD</span>
              </div>
            </div>

            <div className="flex items-center gap-10 md:border-l md:border-slate-100 md:pl-10">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Customs Value</p>
                <p className="text-2xl font-black text-slate-900">AUD {audValue}</p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${status === 'held' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {status === 'held' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {status === 'held' ? 'Held for Exam' : 'Cleared'}
              </div>
            </div>
          </div>

          {/* 时间轴：从 API 模拟数据渲染 */}
          <div className="relative max-w-2xl ml-4">
             {/* 简单的垂直线布局，逻辑清晰 */}
             <div className="space-y-12">
                <TimelineNode 
                  title="Departed (Guangzhou)" 
                  time="Nov 29 • 00:24" 
                  details="Flight CZ325"
                  isCompleted={true}
                />
                <TimelineNode 
                  title="In Transit" 
                  time="Nov 30 • 08:27" 
                  tag="Transshipment"
                  isCompleted={true}
                />
                
                {/* 核心异常节点：根据 status 动态变化 */}
                <div className="relative pl-10 border-l-2 border-amber-500">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-sm" />
                  <div className="flex items-center gap-3">
                    <p className="font-black text-slate-900">{status === 'held' ? 'Customs Inspection' : 'Customs Cleared'}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${status === 'held' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {status === 'held' ? 'Held for Examination' : 'Success'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Dec 02 • 20:23</p>
                  
                  <AnimatePresence>
                    {status === 'held' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-5"
                      >
                        <p className="text-amber-900 font-bold text-sm">监管暂扣 (预计延迟 2-3 天)</p>
                        <p className="text-sm text-amber-700/70 mt-1">海关正在进行随机布控查验，请保持单证通畅。</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <TimelineNode 
                  title="Final Delivery" 
                  time="Estimated Dec 06" 
                  isCompleted={false}
                  isLast={true}
                />
             </div>
          </div>

          {/* 底部操作 */}
          <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">OpenClear AI Engine</span>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900">下载清单</button>
              <button className="px-8 py-3 bg-black text-white rounded-xl text-sm font-bold shadow-xl hover:bg-slate-800 transition-all">提交报关资料</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// 提取出的时间轴节点小组件，方便以后对接 API 循环使用
function TimelineNode({ title, time, details, tag, isCompleted, isLast = false }: any) {
  return (
    <div className={`relative pl-10 ${!isLast ? 'border-l-2 border-slate-100' : ''}`}>
      <div className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${isCompleted ? 'bg-slate-900' : 'bg-slate-200'}`} />
      <div className="flex items-center gap-3">
        <p className={`font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-300'}`}>{title}</p>
        {tag && <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded uppercase">{tag}</span>}
      </div>
      <p className="text-xs text-slate-400 mt-1">{time} {details && `• ${details}`}</p>
    </div>
  );
}