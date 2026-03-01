export async function fetchRealTracking(trackingNumber: string) {
  const apiKey = process.env.NEXT_PUBLIC_TRACKINGMORE_API_KEY;
  
  try {
    // 第一步：先向 TrackingMore 注册这个单号，让它自动检测承运商
    const createResponse = await fetch('https://api.trackingmore.com/v4/trackings/create', {
      method: 'POST',
      headers: {
        'Tracking-Api-Key': apiKey || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tracking_number: trackingNumber,
        carrier_code: 'auto-detect' // 核心改进：让系统自己猜是 DPEX、AuPost 还是顺丰
      }),
    });

    // 第二步：获取该单号的最新轨迹数据
    const getResponse = await fetch(`https://api.trackingmore.com/v4/trackings/get?tracking_numbers=${trackingNumber}`, {
      method: 'GET',
      headers: {
        'Tracking-Api-Key': apiKey || '',
        'Content-Type': 'application/json',
      }
    });

    const result = await getResponse.json();
    return result.data; 
  } catch (error) {
    console.error("TrackingMore API Error:", error);
    return null;
  }
}