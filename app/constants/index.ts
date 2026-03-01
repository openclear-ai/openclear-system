export interface City {
  name: string;
  coords: [number, number]; // [longitude, latitude]
  type: 'hub' | 'secondary';
}

export interface TradeArc {
  from: [number, number];
  to: [number, number];
  type: 'primary' | 'secondary';
}

export const CITIES: City[] = [
  { name: 'Guangzhou', coords: [113.2644, 23.1291], type: 'hub' },
  { name: 'Chengdu', coords: [104.0665, 30.5723], type: 'hub' },
  { name: 'Shenzhen', coords: [114.0579, 22.5431], type: 'hub' },
  { name: 'Foshan', coords: [113.1227, 23.0215], type: 'hub' },
  { name: 'Shanghai', coords: [121.4737, 31.2304], type: 'hub' },
  { name: 'Xiamen', coords: [118.0894, 24.4798], type: 'hub' },
  { name: 'Kuala Lumpur', coords: [101.6869, 3.1390], type: 'hub' },
  { name: 'Bali', coords: [115.1889, -8.4095], type: 'hub' },
  { name: 'Sydney', coords: [151.2093, -33.8688], type: 'hub' },
  { name: 'Melbourne', coords: [144.9631, -37.8136], type: 'hub' },
  { name: 'Brisbane', coords: [153.0251, -27.4698], type: 'secondary' },
  { name: 'Jakarta', coords: [106.8456, -6.2088], type: 'secondary' },
  { name: 'Perth', coords: [115.8605, -31.9505], type: 'secondary' },
];

export const ARCS: TradeArc[] = [
  // Primary Spine
  { from: [113.2644, 23.1291], to: [151.2093, -33.8688], type: 'primary' }, // Guangzhou -> Sydney
  { from: [121.4737, 31.2304], to: [144.9631, -37.8136], type: 'primary' }, // Shanghai -> Melbourne
  { from: [114.0579, 22.5431], to: [153.0251, -27.4698], type: 'primary' }, // Shenzhen -> Brisbane
  
  // Secondary Flow - China Internal
  { from: [113.2644, 23.1291], to: [121.4737, 31.2304], type: 'secondary' }, // Guangzhou -> Shanghai
  { from: [121.4737, 31.2304], to: [104.0665, 30.5723], type: 'secondary' }, // Shanghai -> Chengdu
  
  // Secondary Flow - SE Asia
  { from: [114.0579, 22.5431], to: [101.6869, 3.1390], type: 'secondary' }, // Shenzhen -> KL
  { from: [113.2644, 23.1291], to: [106.8456, -6.2088], type: 'secondary' }, // Guangzhou -> Jakarta
  
  // Secondary Flow - Australia Internal
  { from: [151.2093, -33.8688], to: [144.9631, -37.8136], type: 'secondary' }, // Sydney -> Melbourne
  { from: [144.9631, -37.8136], to: [115.8605, -31.9505], type: 'secondary' }, // Melbourne -> Perth
];
