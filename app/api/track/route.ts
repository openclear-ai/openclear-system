// app/api/track/route.ts
import { NextResponse } from "next/server";

type TimelineEvent = {
  id: string;
  location: string;
  subLocation?: string;
  status: string;
  time: string;
  details?: string;
  tag?: string;
  isCompleted: boolean;
  isWarning?: boolean;
};

function normalizeTrackinfo(trackinfo: any[], prefix: string): TimelineEvent[] {
  if (!Array.isArray(trackinfo)) return [];

  return trackinfo.map((e, idx) => {
    const location =
      e.location ||
      [e.city, e.state].filter(Boolean).join(", ") ||
      "";

    const status =
      e.tracking_detail ||
      e.raw_status ||
      e.checkpoint_delivery_status ||
      "Update";

    const time = e.checkpoint_date || "";

    const sub = e.checkpoint_delivery_substatus || "";

    const text = `${status} ${sub}`.toLowerCase();
    const isWarning =
      /held|inspection|examination|customs|quarantine|delay/.test(text);

    return {
      id: `${prefix}-${idx + 1}`,
      location,
      subLocation: sub || undefined,
      status,
      time,
      details: undefined,
      tag: undefined,
      isCompleted: true,
      isWarning,
    };
  });
}

function mergeAndSort(a: TimelineEvent[], b: TimelineEvent[]) {
  const all = [...a, ...b];
  return all.sort((x, y) => {
    const tx = Date.parse(x.time);
    const ty = Date.parse(y.time);
    if (Number.isNaN(tx) || Number.isNaN(ty)) return 0;
    return tx - ty;
  });
}

function deriveStatus(deliveryStatus?: string, latestEvent?: string): "held" | "cleared" {
  const s = String(deliveryStatus || "").toLowerCase();
  if (s === "delivered") return "cleared";

  const le = String(latestEvent || "").toLowerCase();
  if (le.includes("customs cleared") || le.includes("clearance completed")) return "cleared";

  return "held";
}

async function tmRequest(method: "GET" | "POST", url: string, apiKey: string, body?: any) {
  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Tracking-Api-Key": apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

function pickData(tmJson: any) {
  // v4：data 可能是数组或对象
  if (!tmJson?.data) return null;
  return Array.isArray(tmJson.data) ? tmJson.data[0] : tmJson.data;
}

function hasAnyTrackinfo(data: any) {
  return !!(data?.origin_info?.trackinfo?.length || data?.destination_info?.trackinfo?.length);
}

async function detectCourierCode(tn: string, apiKey: string) {
  // 文档：/v4/couriers/detect，参数 tracking_number
  // SDK 示例是传 params 对象，这里用 POST JSON body 最稳
  const resp = await tmRequest(
    "POST",
    "https://api.trackingmore.com/v4/couriers/detect",
    apiKey,
    { tracking_number: tn }
  );

  return resp;
}

export async function POST(req: Request) {
  try {
    const { trackingNumber, courierCode } = await req.json();
    const tmApiKey = process.env.TRACKINGMORE_API_KEY;

    if (!tmApiKey) {
      return NextResponse.json({ error: "缺少 TrackingMore API Key" }, { status: 500 });
    }

    const tn = String(trackingNumber || "").trim().replace(/\s+/g, "");
    if (!tn) {
      return NextResponse.json({ error: "缺少 trackingNumber" }, { status: 400 });
    }

    // 0) 决定 courier_code：优先用前端传入，否则 detect
    let cc = String(courierCode || "").trim();
    let detectRaw: any = null;

    if (!cc) {
      const detectResp = await detectCourierCode(tn, tmApiKey);
      detectRaw = detectResp.json;

      if (detectRaw?.meta?.code !== 200) {
        return NextResponse.json(
          {
            error: `TrackingMore detect 失败：${detectRaw?.meta?.message || "unknown"}`,
            raw: detectRaw,
          },
          { status: 502 }
        );
      }

      // detect 的 data 通常是候选 couriers 列表
      const candidates = Array.isArray(detectRaw?.data) ? detectRaw.data : [];
      cc = String(candidates?.[0]?.courier_code || "").trim();

      if (!cc) {
        return NextResponse.json(
          {
            error: "TrackingMore detect 未返回可用 courier_code",
            raw: detectRaw,
          },
          { status: 502 }
        );
      }
    }

    // 1) create
    const createResp = await tmRequest(
      "POST",
      "https://api.trackingmore.com/v4/trackings/create",
      tmApiKey,
      {
        tracking_number: tn,
        courier_code: cc,
      }
    );

    const createJson = createResp.json;

    // v4：meta.code === 200 成功
    // 如果 4101（already exists），也算可继续
    const metaCode = createJson?.meta?.code;

    if (!(metaCode === 200 || metaCode === 4101)) {
      return NextResponse.json(
        {
          error: `TrackingMore create 失败：${createJson?.meta?.message || "unknown"}`,
          raw: createJson,
          detectRaw,
          usedCourierCode: cc,
        },
        { status: 502 }
      );
    }

    // 2) 先尝试直接从 create 里拿 data
    let tmJson = createJson;
    let data = pickData(tmJson);

    // 3) 兜底：补 get（注意：参数是 tracking_numbers）
    if (!hasAnyTrackinfo(data)) {
      const getUrl =
        `https://api.trackingmore.com/v4/trackings/get` +
        `?tracking_numbers=${encodeURIComponent(tn)}` +
        `&courier_code=${encodeURIComponent(cc)}`;

      const getResp = await tmRequest("GET", getUrl, tmApiKey);
      const getJson = getResp.json;

      if (getJson?.meta?.code !== 200) {
        return NextResponse.json(
          {
            error: `TrackingMore get 失败：${getJson?.meta?.message || "unknown"}`,
            raw: getJson,
            createRaw: createJson,
            detectRaw,
            usedCourierCode: cc,
            getUrl,
          },
          { status: 502 }
        );
      }

      tmJson = getJson;
      data = pickData(tmJson);
    }

    // 4) timeline mapping
    const originEvents = normalizeTrackinfo(data?.origin_info?.trackinfo, "O");
    const destEvents = normalizeTrackinfo(data?.destination_info?.trackinfo, "D");
    const timeline = mergeAndSort(originEvents, destEvents);

    const status = deriveStatus(data?.delivery_status, data?.latest_event);

    return NextResponse.json({
      trackingNumber: tn,
      courierCode: cc,
      status,
      timeline,
      // 调试信息：前端不展示即可
      detectRaw,
      raw: tmJson,
    });
  } catch (error: any) {
    console.error("Track API Error:", error);
    return NextResponse.json({ error: error?.message || "处理失败" }, { status: 500 });
  }
}