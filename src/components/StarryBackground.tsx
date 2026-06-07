import { useMemo } from 'react';
import '../styles/starry-bg.css';

interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

interface LayerConfig {
  count: number;
  minSize: number;
  maxSize: number;
  cls: string;
}

const STAR_COLORS = ['#ffffff', '#dce8ff', '#fff4d6', '#e8d9ff', '#c8e8ff'];

/** 生成一层星点（位置/大小/动画参数全随机）。 */
function makeStars(count: number, minSize: number, maxSize: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: minSize + Math.random() * (maxSize - minSize),
    delay: -Math.random() * 8, // 负值：立即处于动画中段，避免开局同步闪烁
    duration: 2 + Math.random() * 5,
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
  }));
}

const LAYERS: LayerConfig[] = [
  { count: 140, minSize: 0.5, maxSize: 1.2, cls: 'star-tiny' },
  { count: 50, minSize: 1, maxSize: 1.8, cls: 'star-small' },
  { count: 18, minSize: 1.5, maxSize: 2.4, cls: 'star-medium' },
  { count: 6, minSize: 2, maxSize: 3, cls: 'star-large' },
];

/**
 * 动态夜晚星空背景。
 * 组成：黑色天空 + 倾斜的银河光带 + 三处飘动星云 + 4 层闪烁星点 + 流星。
 * 位置、颜色、闪烁节奏在挂载时随机生成一次；之后由 CSS 动画驱动。
 */
export function StarryBackground() {
  // 一次生成，避免每次渲染抖动
  const layers = useMemo(
    () => LAYERS.map((l) => ({ ...l, stars: makeStars(l.count, l.minSize, l.maxSize) })),
    [],
  );

  return (
    <div className="starry-bg" aria-hidden="true">
      <div className="milky-way" />
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
      <div className="nebula nebula-3" />

      {layers.map((layer) =>
        layer.stars.map((s, i) => (
          <span
            key={`${layer.cls}-${i}`}
            className={`star ${layer.cls}`}
            style={
              {
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                background: s.color,
                '--delay': `${s.delay}s`,
                '--dur': `${s.duration}s`,
              } as React.CSSProperties
            }
          />
        )),
      )}

      <span className="shooting-star shooting-star-1" />
      <span className="shooting-star shooting-star-2" />
      <span className="shooting-star shooting-star-3" />
    </div>
  );
}
