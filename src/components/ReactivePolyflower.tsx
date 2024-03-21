import React, { useRef } from "react";
import Polyflower from "./Polyflower";

interface props {
  range: number;
  curr: number;
  size: number;
}

type ArrayLeast2<T> = [T, T, ...T[]];

const lerp = (delta: number, ...anchors: ArrayLeast2<number>): number => {
  const n = anchors.length;
  if (n === 2) {
    const [a, b] = anchors;
    return a + (b - a) * delta;
  }

  const unitDelta = 1 / (n - 1);

  for (let i = 0; i < n - 1; i++) {
    const next = i + 1;
    const minD = unitDelta * i;
    const maxD = unitDelta * next;
    const isWithinRange = delta >= minD && delta <= maxD;
    if (isWithinRange) {
      const a = anchors[i];
      const b = anchors[next];
      const adjustedDelta = (delta - unitDelta * i) * (n - 1); // normalize split ranges to 0-1
      return lerp(adjustedDelta, a, b);
    }
  }
  return -1;
};

// const lerp = (delta: number, ...anchors: ArrayLeast2<number>) => {
//   const [a, b] = anchors;
//   return a + (b - a) * delta;
// };

const toRange = (from: number, to: number, currVal: number) => {
  const fullRange = from - to;
  const delta = (currVal - from) / fullRange;
  return Math.abs(delta);
};

const getReactiveConfig = (props: props) => {
  const { curr, range, size } = props;
  const config: React.ComponentProps<typeof Polyflower> = {
    elongation: {
      petal: 1,
      fold: 1,
    },
    foldRadiusRange: 1,
    sides: 8,
    rounding: {
      petal: 0,
      fold: 0,
    },
    size,
    petalRadiusRange: 0.9,
  };

  const min = -range;
  const max = range;
  const isShitty = curr >= min && curr < min * 0.07;
  if (isShitty) {
    const d = toRange(min, min * 0.07, curr);
    config.sides = 8;
    config.size *= lerp(d, 1, 0.875);
    config.elongation.petal = lerp(d, 1.6, 1.2, 1, 2.5);
    config.rounding.petal = lerp(d, 5, size * 0.3);
    config.elongation.fold = lerp(d, 1.2, 1.5, 2.5);
    config.rounding.fold = lerp(d, 10, size * 0.1);

    config.petalRadiusRange *= lerp(d, 0.85, 0.93, 1, 1);
    config.foldRadiusRange = lerp(d, 0.6, 1);
    return config;
  }

  const isOk = curr >= min * 0.07 && curr < max * 0.07;
  if (isOk) {
    config.sides = 5;
    config.rounding.petal = size * 0.5;
    config.elongation.petal = 1.4;
    return config;
  }

  const isHeavenly = curr >= max * 0.07 && curr <= max;
  if (isHeavenly) {
    const d = toRange(max * 0.07, max, curr);
    config.sides = 5;
    config.rounding.petal = lerp(d, size, 40, 80);
    config.elongation.petal = lerp(d, 1.4, 1.3, 1.5);
    config.rounding.fold = lerp(d, size * 0.1, 10, 5, 0);
    config.elongation.fold = lerp(d, 2.5, 1.4);
    config.foldRadiusRange = lerp(d, 1, 0.6);
    config.petalRadiusRange *= lerp(d, 1, 0.9, 0.7);
    config.size *= lerp(d, 1, 1.1, 1.15, 1.4, 1.8);
    // if (curr >= max * 0.07 && curr <= max * 0.33) {
    //   config.petalRadiusRange = 0.9;
    // } else {
    //   const delta2 = d(max * 0.33, max, curr);
    //   config.petalRadiusRange = lerp(0.9, 1.25, delta2);
    // }
    // config.elongation.petal = lerp(1.3, 2.5, delta);
    // config.elongation.fold = lerp(1.3, 2.5, delta);
    // config.foldRadiusRange = lerp(1, 0.45, delta);
    // config.sides = 5;
    // config.rounding.petal = lerp(100, 50, delta);
    // config.rounding.fold = lerp(10, 0, delta);
    return config;
  }

  return config;
};

const ReactivePolyflower: React.FC<props> = (props) => {
  const config = getReactiveConfig(props);

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative pointer-events-none touch-none"
      ref={containerRef}
      style={{ width: props.size * 2, height: props.size * 2 }}
    >
      <Polyflower
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        {...config}
      />
    </div>
  );
};

export default ReactivePolyflower;
