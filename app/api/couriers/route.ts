// app/api/couriers/route.ts
import { NextResponse } from "next/server";

type TMResp = {
  meta?: { code?: number; message?: string };
  data?: any;
};

type Courier = {
  courier_code: string;
  courier_name: string;
  courier_country_iso2?: string | null;
  courier_type?: string;
  courier_logo?: string;
};

const TM_BASE = "https://api.trackingmore.com/v4";

// 10 分钟缓存（仅 dev/单实例下足够用）
const CACHE_TTL_MS = 10 * 60 * 1000;

declare global {
  // eslint-disable-next-line no-var
  var __tmCouriersCache:
    | {
        at: number;
        endpoint: string;
        couriers: Courier[];
      }
    | undefined;
}

function jsonError(message: string, status: number, extra?: any) {
  return NextResponse.json(
    { error: message, ...(extra ? extra : {}) },
    { status }
  );
}

async function tmGet(url: string, apiKey: string) {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Tracking-Api-Key": apiKey,
    },
    // 避免 Next 缓存干扰
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as TMResp;
  return { ok: res.ok, status: res.status, json };
}

async function tmPost(url: string, apiKey: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Tracking-Api-Key": apiKey,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as TMResp;
  return { ok: res.ok, status: res.status, json };
}

/**
 * 尝试拉取 TrackingMore 全量 couriers 列表
 * 不确定具体 endpoint 时，做多候选探测，命中一个就返回
 */
async function fetchAllCouriers(apiKey: string) {
  // 先读缓存
  const cached = globalThis.__tmCouriersCache;
  if (cached && Date.now() - cached.at < CACHE_TTL_MS && cached.couriers?.length) {
    return { endpoint: cached.endpoint, couriers: cached.couriers, fromCache: true };
  }

  // 常见候选路径（你现在命中 404，说明你用的不是其中正确那个）
  const candidates = [
    `${TM_BASE}/couriers/all`,
    `${TM_BASE}/couriers/getall`,
    `${TM_BASE}/couriers`,
    `${TM_BASE}/couriers/list`,
    `${TM_BASE}/couriers/get`,
  ];

  const tries: Array<{ url: string; status: number; meta?: any }> = [];

  for (const url of candidates) {
    const r = await tmGet(url, apiKey);
    tries.push({ url, status: r.status, meta: r.json?.meta });

    // TrackingMore v4 成功通常是 meta.code === 200
    if (r.json?.meta?.code === 200 && Array.isArray(r.json?.data)) {
      const couriers = r.json.data as Courier[];
      globalThis.__tmCouriersCache = {
        at: Date.now(),
        endpoint: url,
        couriers,
      };
      return { endpoint: url, couriers, fromCache: false };
    }
  }

  // 全失败：把每次尝试的结果返回，方便你立刻定位
  return { endpoint: null as any, couriers: [] as Courier[], fromCache: false, tries };
}

export async function GET(req: Request) {
  try {
    const apiKey = process.env.TRACKINGMORE_API_KEY;
    if (!apiKey) return jsonError("缺少 TrackingMore API Key", 500);

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const trackingNumber = (searchParams.get("trackingNumber") || "").trim().replace(/\s+/g, "");

    // 1) Detect courier：给 trackingNumber -> 返回候选 courier_code
    // ✅ 这个 endpoint 已在公开文档/集合里出现：/v4/couriers/detect
    if (trackingNumber) {
      const detect = await tmPost(`${TM_BASE}/couriers/detect`, apiKey, {
        tracking_number: trackingNumber,
      });

      if (detect.json?.meta?.code !== 200) {
        return jsonError(
          `TrackingMore detect 失败：${detect.json?.meta?.message || "unknown"}`,
          502,
          { raw: detect.json }
        );
      }

      return NextResponse.json({
        trackingNumber,
        couriers: Array.isArray(detect.json?.data) ? detect.json.data : [],
        raw: detect.json,
      });
    }

    // 2) Get all couriers：用于像后台那样“输入 dpex 下拉搜索”
    const all = await fetchAllCouriers(apiKey);

    // 探测全失败
    if (!all.endpoint) {
      return jsonError(
        "TrackingMore Get all couriers 获取失败：未命中任何候选 endpoint（请看 tries）",
        502,
        { tries: (all as any).tries }
      );
    }

    const list = all.couriers;
    const filtered =
      q.length === 0
        ? list
        : list.filter((c) => {
            const name = String(c.courier_name || "").toLowerCase();
            const code = String(c.courier_code || "").toLowerCase();
            const needle = q.toLowerCase();
            return name.includes(needle) || code.includes(needle);
          });

    // 返回前 50 个足够做 dropdown（避免太大）
    return NextResponse.json({
      endpoint: all.endpoint,
      fromCache: all.fromCache,
      total: list.length,
      q,
      couriers: filtered.slice(0, 50).map((c) => ({
        code: c.courier_code,
        name: c.courier_name,
        country: c.courier_country_iso2 ?? null,
        type: c.courier_type ?? null,
        logo: c.courier_logo ?? null,
      })),
    });
  } catch (e: any) {
    return jsonError(e?.message || "couriers api error", 500);
  }
}