"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import {
  Plane,
  AlertCircle,
  History,
  Sparkles,
  FileText,
  CheckCircle2,
  Upload,
  Loader2,
  Camera,
  Search,
  ChevronDown,
} from "lucide-react";
// Next.js 环境中使用 framer-motion 处理动效
import { motion, AnimatePresence } from "framer-motion";

// --- 类型定义 ---
type Carrier = {
  name: string;
  code: string;
};

const CARRIERS: Carrier[] = [
  { name: "DHL", code: "dhl" },
  { name: "UPS", code: "ups" },
  { name: "FedEx", code: "fedex" },
  { name: "SF Express", code: "sf-express" },
  { name: "China Post", code: "china-post" },
  { name: "Australia Post", code: "australia-post" },
  { name: "Aramex", code: "aramex" },
  { name: "Toll", code: "toll" },
  { name: "4PX", code: "4px" },
  { name: "YunExpress", code: "yunexpress" },
];
type Status = "held" | "cleared";

interface TimelineEvent {
  id: string;
  location: string;
  subLocation?: string;
  status: string;
  time: string;
  details?: string;
  tag?: string;
  isCompleted: boolean;
  isWarning?: boolean;
}

interface ExtractedData {
  trackingNumber: string;
  valueUsd: number;
  destination: string;
  carrierName?: string; // Add carrierName field
}

// --- 初始模拟数据 ---
const INITIAL_TIMELINE: TimelineEvent[] = [
  {
    id: "1",
    location: "Guangzhou",
    subLocation: "CAN Terminal",
    status: "Departed (Guangzhou)",
    time: "Nov 29 • 00:24",
    details: "Flight CZ325",
    isCompleted: true,
  },
  {
    id: "2",
    location: "Midway",
    subLocation: "PTP Transit Hub",
    status: "In Transit",
    time: "Nov 30 • 08:27",
    tag: "Transshipment",
    isCompleted: true,
  },
  {
    id: "3",
    location: "Sydney",
    subLocation: "SYD Cargo Terminal",
    status: "Arrived (Sydney)",
    time: "Dec 02 • 16:06",
    details: "Flight CZ325",
    isCompleted: true,
  },
  {
    id: "4",
    location: "",
    status: "Unloading Complete",
    time: "Dec 02 • 18:45",
    isCompleted: true,
  },
  {
    id: "5",
    location: "",
    status: "Customs Inspection",
    time: "Dec 02 • 20:23",
    tag: "Held for Examination",
    isWarning: true,
    isCompleted: true,
  },
  {
    id: "6",
    location: "Delivery",
    subLocation: "Final Destination",
    status: "Final Clearance & Delivery",
    time: "Estimated Dec 06",
    isCompleted: false,
  },
];

export default function TrackingPage() {
  // --- 状态管理 ---
  const [status, setStatus] = useState<Status>("held");
  const [trackingNumber, setTrackingNumber] = useState("160-12345678");
  const [audValue, setAudValue] = useState("0.00");
  const [timeline, setTimeline] = useState<TimelineEvent[]>(INITIAL_TIMELINE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayQuery, setDisplayQuery] = useState(""); // 用于打字机动画显示
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [showCarrierDropdown, setShowCarrierDropdown] = useState(false);
  const [carrierSearchQuery, setCarrierSearchQuery] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- 搜索处理 ---
  const handleSearch = async (queryOverride?: string) => {
    const query = (queryOverride ?? searchQuery).trim();
    if (!query) return;

    const tn = query.replace(/\s+/g, "");
    setTrackingNumber(tn);
    setDisplayQuery(tn);

    try {
      setIsTracking(true);

      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNumber: tn,
          courierCode: selectedCarrier?.code, // 为空则让后端 detect
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Track API 请求失败");
      }

      if (Array.isArray(data.timeline)) {
        setTimeline(data.timeline);
      }

      if (data.status === "held" || data.status === "cleared") {
        setStatus(data.status);
      } else {
        setStatus("held");
      }

      // 可选：后端如果返回 courierCode，可在列表里匹配后同步到 UI
      if (data.courierCode && !selectedCarrier) {
        const cc = String(data.courierCode).toLowerCase().trim();
        const matched = CARRIERS.find((c) => c.code.toLowerCase() === cc);
        if (matched) setSelectedCarrier(matched);
      }
    } catch (err: any) {
      console.error("Track error:", err);
      alert(err?.message || "查询失败，请稍后再试");
    } finally {
      setIsTracking(false);
    }
  };

  // --- AI 识别逻辑 (通过后端 API) ---
  const processImage = async (file: File) => {
    setIsProcessing(true);

    try {
      // 1. 将图片转换为 Base64
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });

      // 2. 发送至后端 API
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Data,
          mimeType: file.type,
          // Add responseSchema to prompt for carrierName
          responseSchema: {
            type: "object",
            properties: {
              trackingNumber: { type: "string" },
              valueUsd: { type: "number" },
              destination: { type: "string" },
              carrierName: { type: "string", optional: true },
            },
            required: ["trackingNumber", "valueUsd", "destination"],
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 如果后端报错，抛出详细信息
        throw new Error(data.error || "AI 识别请求失败");
      }

      const extracted = data as ExtractedData;

      // 3. 更新提取到的数据
      if (extracted.trackingNumber) {
        setTrackingNumber(extracted.trackingNumber);
        // 打字机动画效果
        typewriterEffect(extracted.trackingNumber, () => {
          handleSearch(extracted.trackingNumber); // 动画结束后自动触发查询
        });
      }

      // 自动匹配承运商（保留一份即可，删掉重复逻辑）
      if (extracted.carrierName) {
        const needle = extracted.carrierName.toLowerCase().trim();
        const matchedCarrier = CARRIERS.find(
          (c) =>
            c.name.toLowerCase() === needle || c.code.toLowerCase() === needle
        );
        setSelectedCarrier(matchedCarrier || null);
      }

      if (extracted.valueUsd) {
        // 汇率换算逻辑
        const aud = (extracted.valueUsd * 1.5).toLocaleString("en-AU", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        setAudValue(aud);
      }

      if (extracted.destination) {
        simulateTimeline(extracted.destination);
      }
    } catch (error: any) {
      console.error("处理运单出错:", error);
      // 如果后端返回了 404，通常是因为 API Key 权限或 SDK 版本问题
      alert(error.message || "识别出错，请检查 API 配置");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 模拟生成新的时间线 ---
  const simulateTimeline = (destination: string) => {
    const now = new Date();
    const formatDate = (daysAgo: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      return (
        d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }) +
        " • " +
        d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };

    const newTimeline: TimelineEvent[] = [
      {
        id: "s1",
        location: "Guangzhou",
        subLocation: "CAN Terminal",
        status: "Departed (Guangzhou)",
        time: formatDate(3),
        isCompleted: true,
      },
      {
        id: "s2",
        location: "Sydney",
        subLocation: "SYD Cargo Terminal",
        status: "Arrived (Sydney)",
        time: formatDate(1),
        isCompleted: true,
      },
      {
        id: "s3",
        location: "",
        status: "Customs Inspection",
        time: formatDate(0.5),
        tag: "Held for Examination",
        isWarning: true,
        isCompleted: true,
      },
      {
        id: "s4",
        location: destination,
        subLocation: "Final Destination",
        status: "Final Clearance & Delivery",
        time:
          "Estimated " +
          new Date(now.getTime() + 86400000 * 3).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
          }),
        isCompleted: false,
      },
    ];
    setTimeline(newTimeline);
    setStatus("held");
  };

  // --- 打字机动画效果 ---
  const typewriterEffect = (text: string, onComplete: () => void) => {
    let i = 0;
    setDisplayQuery(""); // Clear current display
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayQuery((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        onComplete();
      }
    }, 50); // Adjust typing speed here
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  // --- Carrier Dropdown 逻辑 ---
  const handleSelectCarrier = (carrier: Carrier) => {
    setSelectedCarrier(carrier);
    setShowCarrierDropdown(false);
    setCarrierSearchQuery(""); // Clear search after selection
  };

  const filteredCarriers = CARRIERS.filter(
    (carrier) =>
      carrier.name.toLowerCase().includes(carrierSearchQuery.toLowerCase()) ||
      carrier.code.toLowerCase().includes(carrierSearchQuery.toLowerCase())
  ).slice(0, 20); // Limit to 20 items

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCarrierDropdown(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowCarrierDropdown(false);
      }
    };

    if (showCarrierDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showCarrierDropdown]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 md:p-8 font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full bg-white border border-slate-100 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden"
      >
        <div className="p-8 md:p-12">
          {/* Header 部分 */}
          <div className="mb-20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  MAWB {trackingNumber}
                </h1>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="font-bold text-slate-900 text-xl">CAN</span>
                  <Plane size={20} className="text-slate-400 rotate-45" />
                  <span className="font-bold text-slate-900 text-xl">SYD</span>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mt-2 
                    ${
                      status === "held"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                >
                  <span className={`relative flex h-2 w-2`}>
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 
                        ${
                          status === "held" ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 
                        ${
                          status === "held" ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                    />
                  </span>
                  {status === "held" ? "Held for Exam" : "Cleared"}
                </div>
              </div>
            </div>
          </div>

          {/* 极简搜索框 */}
          <div className="mb-16 max-w-2xl mx-auto">
            <div
              className={`relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl p-1.5 focus-within:ring-2 
                ${
                  status === "held"
                    ? "focus-within:ring-amber-500/20 shadow-lg shadow-amber-50/50"
                    : "focus-within:ring-emerald-500/20 shadow-lg shadow-emerald-50/50"
                }
                transition-all shadow-sm`}
            >
              <div className="flex items-center flex-grow px-4">
                <Search size={18} className="text-slate-400 mr-3" />
                <input
                  type="text"
                  value={displayQuery} // 使用 displayQuery 进行打字机动画
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setDisplayQuery(e.target.value);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Enter Tracking Number (e.g. 160-12345678)"
                  className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-center gap-1">
                {/* Carrier Capsule Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowCarrierDropdown(!showCarrierDropdown)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm rounded-full transition-colors active:scale-95
                      ${
                        selectedCarrier
                          ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                          : "text-slate-600 bg-slate-100/50 hover:bg-slate-200/50"
                      }`}
                  >
                    {selectedCarrier ? selectedCarrier.name : "Carrier"}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${
                        showCarrierDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {showCarrierDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.18,
                            ease: [0.2, 0.8, 0.2, 1],
                          },
                        }}
                        exit={{
                          opacity: 0,
                          y: 6,
                          transition: {
                            duration: 0.18,
                            ease: [0.2, 0.8, 0.2, 1],
                          },
                        }}
                        className="absolute z-10 mt-2 w-48 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-[16px] shadow-[0_24px_70px_-40px_rgba(0,0,0,0.35)] overflow-hidden right-0"
                        ref={dropdownRef}
                      >
                        <div className="px-3 py-2 border-b border-slate-200/50">
                          <input
                            type="text"
                            placeholder="Search carrier..."
                            className="w-full px-2 py-1 text-xs bg-transparent border-none outline-none placeholder:text-slate-400/70 focus:ring-0"
                            value={carrierSearchQuery}
                            onChange={(e) =>
                              setCarrierSearchQuery(e.target.value)
                            }
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1">
                          {filteredCarriers.length > 0 ? (
                            filteredCarriers.map((carrier) => {
                              const active =
                                selectedCarrier?.code === carrier.code;
                              return (
                                <button
                                  key={carrier.code}
                                  onClick={() => handleSelectCarrier(carrier)}
                                  className={`w-full text-left px-3 py-1.5 text-sm transition-colors rounded-[10px]
                                    ${
                                      active
                                        ? "bg-slate-900/[0.05] text-slate-900"
                                        : "text-slate-700 hover:bg-indigo-50/50 hover:text-slate-800"
                                    }`}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="font-medium">
                                      {carrier.name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-500 font-mono">
                                        {carrier.code}
                                      </span>
                                      {active && (
                                        <CheckCircle2
                                          size={16}
                                          className="text-slate-900/70"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })
                          ) : (
                            <p className="px-3 py-1.5 text-sm text-slate-500">
                              No carriers found.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all disabled:opacity-50"
                  title="Upload Waybill"
                >
                  {isProcessing ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Camera size={18} />
                  )}
                </button>

                <button
                  onClick={() => handleSearch()}
                  disabled={showCarrierDropdown || isTracking}
                  className={`px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95
                    ${
                      showCarrierDropdown || isTracking
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                >
                  {isTracking ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Tracking
                    </span>
                  ) : (
                    "Track"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Timeline 视觉列表 */}
          <div className="relative max-w-2xl">
            {timeline.map((event, index) => {
              const isLast = index === timeline.length - 1;
              const isCustomsNode = event.status === "Customs Inspection";
              const showWarning = status === "held" && isCustomsNode;

              const getLineColor = () => {
                if (status === "cleared" && index >= timeline.length - 3)
                  return "bg-emerald-500";
                if (event.isWarning && status === "held") return "bg-amber-500";
                if (event.isCompleted) return "bg-slate-900/90";
                return "bg-slate-200/80";
              };

              const getDotColor = () => {
                if (status === "cleared" && index >= timeline.length - 2)
                  return "bg-emerald-500";
                if (event.isWarning && status === "held") return "bg-amber-500";
                if (event.isCompleted) return "bg-slate-900/90";
                return "bg-slate-200/80";
              };

              return (
                <div
                  key={event.id}
                  className="relative flex gap-8 pb-10 group last:pb-0"
                >
                  <div className="flex flex-col items-center flex-none">
                    <div
                      className={`w-2.5 h-2.5 rounded-[3px] mt-2 transition-colors duration-500 ${getDotColor()}`}
                    />
                    {!isLast && (
                      <div
                        className={`w-0.5 h-full mt-2 transition-colors duration-500 ${getLineColor()}`}
                      />
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-12 w-full">
                    <div className="min-w-[140px]">
                      {event.location && (
                        <>
                          <p
                            className={`font-bold transition-colors duration-500 ${
                              event.isCompleted
                                ? "text-slate-900"
                                : "text-slate-400"
                            }`}
                          >
                            {event.location}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {event.subLocation}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p
                          className={`font-bold transition-colors duration-500 ${
                            event.isCompleted
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {status === "cleared" && isCustomsNode
                            ? "Customs Cleared"
                            : event.status}
                        </p>
                        {event.tag && (
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-[0.14em] 
                            ${
                              isCustomsNode && status === "held"
                                ? "bg-amber-100/80 text-amber-700"
                                : isCustomsNode && status === "cleared"
                                ? "bg-emerald-100/80 text-emerald-700"
                                : "bg-indigo-50/80 text-indigo-600"
                            }`}
                          >
                            {status === "cleared" && isCustomsNode
                              ? "Cleared"
                              : event.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {event.time} {event.details && `• ${event.details}`}
                      </p>

                      {/* AI 查验警告详情卡片 */}
                      <AnimatePresence>
                        {showWarning && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-6 bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex items-start gap-4">
                              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                <History size={20} />
                              </div>
                              <div>
                                <p className="text-amber-900 font-bold text-sm">
                                  Regulatory Hold (Estimated 2-3 Day Delay)
                                </p>
                                <p className="text-sm text-amber-700/70 mt-1 leading-relaxed">
                                  Consignment selected for random document audit
                                  by Border Force.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 底部版权信息 */}
          <div className="mt-20 pt-8 border-t border-slate-100 flex justify-center items-center">
            <div className="flex items-center gap-2.5 text-slate-400">
              <Sparkles size={16} className="text-indigo-400" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                OpenClear AI Insights
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}