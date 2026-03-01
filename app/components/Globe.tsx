'use client';

import React, { useEffect, useRef } from 'react';
import * as d3Geo from 'd3-geo';
import { feature } from 'topojson-client';
import { CITIES, ARCS } from '../constants';

const GLOBE_CONFIG = {
  rotationSpeed: 0.05, // 旋转速度
  baseColor: '#0f172a', // slate-900 
  landColor: '#334155', // slate-700
  wireframeColor: 'rgba(255, 255, 255, 0.15)',
  primaryArcColor: '#8F2E2E',
  secondaryArcColor: 'rgba(143, 46, 46, 0.25)',
  particleColor: '#C34A4A',
  hubColor: '#C34A4A',
};

export const Globe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<[number, number, number]>([-120, -15, 0]); // 初始视角对准亚洲/大洋洲

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let worldData: any = null;

    // 获取地图数据
    fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json')
      .then(response => response.json())
      .then(data => {
        worldData = feature(data, data.objects.countries);
      });

    const resize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.scale(dpr, dpr);
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const render = (time: number) => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const radius = Math.min(width, height) * 0.45;

      // 缓慢旋转
      rotationRef.current[0] += GLOBE_CONFIG.rotationSpeed;

      const projection = d3Geo.geoOrthographic()
        .scale(radius)
        .translate([width / 2, height / 2])
        .rotate(rotationRef.current)
        .clipAngle(90);

      const path = d3Geo.geoPath(projection, context);

      context.clearRect(0, 0, width, height);

      // 1. 地球背景与发光
      context.beginPath();
      context.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
      context.fillStyle = GLOBE_CONFIG.baseColor;
      context.fill();
      
      const gradient = context.createRadialGradient(
        width / 2, height / 2, radius * 0.8,
        width / 2, height / 2, radius * 1.05
      );
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.5)');
      context.fillStyle = gradient;
      context.fill();

      // 2. 经纬线网格
      context.beginPath();
      context.strokeStyle = GLOBE_CONFIG.wireframeColor;
      context.lineWidth = 0.5;
      const graticule = d3Geo.geoGraticule();
      path(graticule());
      context.stroke();

      // 3. 陆地轮廓
      if (worldData) {
        context.beginPath();
        context.strokeStyle = GLOBE_CONFIG.landColor;
        context.lineWidth = 1;
        path(worldData);
        context.stroke();
      }

      // 4. 航线与流动粒子
      ARCS.forEach(arc => {
        const start = projection(arc.from);
        const end = projection(arc.to);

        if (start && end) {
          const isStartVisible = d3Geo.geoDistance(arc.from, [-rotationRef.current[0], -rotationRef.current[1]]) < Math.PI / 2;
          const isEndVisible = d3Geo.geoDistance(arc.to, [-rotationRef.current[0], -rotationRef.current[1]]) < Math.PI / 2;

          if (isStartVisible || isEndVisible) {
            context.beginPath();
            context.strokeStyle = arc.type === 'primary' ? 'rgba(143, 46, 46, 0.6)' : 'rgba(143, 46, 46, 0.25)';
            context.lineWidth = arc.type === 'primary' ? 1.2 : 0.8;
            
            const geoLine: any = { type: 'LineString', coordinates: [arc.from, arc.to] };
            path(geoLine);
            context.stroke();

            const speed = arc.type === 'primary' ? 0.0001 : 0.00008;
            const t = (time * speed) % 1;
            const interpolate = d3Geo.geoInterpolate(arc.from, arc.to);
            const pos = interpolate(t);
            const screenPos = projection(pos);
            const isPosVisible = d3Geo.geoDistance(pos, [-rotationRef.current[0], -rotationRef.current[1]]) < Math.PI / 2;

            if (screenPos && isPosVisible) {
              context.beginPath();
              context.arc(screenPos[0], screenPos[1], 1.5, 0, 2 * Math.PI);
              context.fillStyle = 'rgba(195, 74, 74, 0.8)';
              context.fill();
            }
          }
        }
      });

      // 5. 城市节点 (脉冲效果)
      CITIES.forEach((city, i) => {
        const screenPos = projection(city.coords);
        const isVisible = d3Geo.geoDistance(city.coords, [-rotationRef.current[0], -rotationRef.current[1]]) < Math.PI / 2;

        if (screenPos && isVisible) {
          const pulse = (Math.sin(time / 1000 + i) + 1) / 2;
          const opacity = 0.2 + pulse * 0.4;

          context.beginPath();
          context.arc(screenPos[0], screenPos[1], 4 + pulse * 4, 0, 2 * Math.PI);
          context.strokeStyle = `rgba(195, 74, 74, ${opacity})`;
          context.lineWidth = 1;
          context.stroke();

          context.beginPath();
          context.arc(screenPos[0], screenPos[1], 2, 0, 2 * Math.PI);
          context.fillStyle = GLOBE_CONFIG.hubColor;
          context.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute inset-0 pointer-events-none bg-radial-[at_center] from-transparent via-transparent to-[#F8FAFC] dark:to-[#0a0a0a] opacity-80" />
    </div>
  );
};