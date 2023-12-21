import React, { useEffect, useRef } from "react";
import Polyflower from "./Polyflower";

interface props {
  range: number;
  curr: number;
  size: number;
}

const lerp = (a: number, b: number, delta: number) => {
  return a + (b - a) * delta;
};

const d = (from: number, to: number, currVal: number) => {
  const fullRange = from - to;
  const delta = (currVal - from) / fullRange;
  return Math.abs(delta);
};

const getReactiveConfig = (props: props) => {
  const { curr, range, size } = props;
  const config: React.ComponentProps<typeof Polyflower> = {
    elongation: 1,
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
    const delta = d(min * 0.07, min, curr);
    config.petalRadiusRange = lerp(0.79, 0.85, delta);
    config.foldRadiusRange = lerp(1, 0.5, delta);
    config.sides = 8;
    if (curr >= 30 && curr < 0) {
      config.rounding.petal = lerp(300, 40, delta);
      config.rounding.fold = lerp(0, 10, delta);
      config.elongation = lerp(2.5, 1.8, delta);
    } else {
      config.rounding.petal = lerp(40, 5, delta);
      config.rounding.fold = lerp(10, 5, delta);
      config.elongation = lerp(1.8, 2, delta);
    }
    return config;
  }

  const isOk = curr >= min * 0.07 && curr < max * 0.07;
  if (isOk) {
    config.petalRadiusRange = 0.9;
    config.elongation = 1.3;
    config.foldRadiusRange = 1;
    config.sides = 5;
    config.rounding.petal = 100;
    config.rounding.fold = 10;
    return config;
  }

  const isHeavenly = curr >= max * 0.07 && curr <= max;
  if (isHeavenly) {
    const delta = d(max * 0.07, max, curr);
    if (curr >= max * 0.07 && curr <= max * 0.33) {
      config.petalRadiusRange = 0.9;
    } else {
      const delta2 = d(max * 0.33, max, curr);
      config.petalRadiusRange = lerp(0.9, 1.25, delta2);
    }
    config.elongation = lerp(1.3, 2.5, delta);
    config.foldRadiusRange = lerp(1, 0.45, delta);
    config.sides = 5;
    config.rounding.petal = lerp(100, 50, delta);
    config.rounding.fold = lerp(10, 0, delta);
    return config;
  }

  return config;
};

const loopDuration = 1000;

const animate = (
  node: Element,
  position: number,
  itemsCount: number,
  moodRef: { isShitty: boolean }
) => {
  const isBeingAnimated = node.getAnimations().length > 0;
  if (isBeingAnimated) return;

  const transformKeyframes = [`scale(1)`, `scale(2.5)`];
  if (moodRef.isShitty) {
    transformKeyframes[0] += " " + "rotate(0deg)";
    transformKeyframes[1] +=
      " " + `rotate(${(90 / (itemsCount - 1)) * position}deg)`;
  }
  node
    .animate(
      {
        transform: transformKeyframes,
        opacity: [0, 0.8, 1, 1, 1, 0.7, 0],
      },
      {
        duration: loopDuration * itemsCount,
        easing: "ease-in-out",
      }
    )
    .addEventListener("finish", () =>
      animate(node, position, itemsCount, moodRef)
    );
};

const ReactivePolyflower: React.FC<props> = (props) => {
  const config = getReactiveConfig(props);

  const containerRef = useRef<HTMLDivElement>(null);
  const moodRef = useRef({ isShitty: false });

  const isShitty = props.curr < -props.range * 0.5;
  moodRef.current.isShitty = isShitty;

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const children = [...containerRef.current.children].slice(0, -1);
    children.forEach((c, idx, arr) => {
      const delay = loopDuration * idx;
      setTimeout(() => animate(c, idx, arr.length, moodRef.current), delay);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="relative pointer-events-none touch-none"
      ref={containerRef}
      style={{ width: props.size * 2, height: props.size * 2 }}
    >
      <Polyflower className="absolute" {...config} />
      <Polyflower className="absolute" {...config} />
      <Polyflower className="absolute" {...config} />
      <Polyflower className="absolute" {...config} />
      <Polyflower className="absolute" {...config} />
    </div>
  );
};

export default ReactivePolyflower;
