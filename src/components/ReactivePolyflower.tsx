import React, { CSSProperties, useEffect, useRef } from "react";
import Polyflower from "./Polyflower";
import { MOOD_RANGE, useMoodContext } from "../contexts/MoodContext";
import { useDelayedValue } from "../hooks/useDelayedValue";
import { useCSSVariables } from "../hooks/useCSSVariables";

interface props {
  morphDelayMs?: number;
  size: number;
  anim: {
    shouldBloom?: boolean;
    id: string;
    delayMs?: number;
    style?: CSSProperties;
  };
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

const getReactiveConfig = (params: { currMoodQ: number; size: number }) => {
  const { currMoodQ: curr, size } = params;
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

  const min = -MOOD_RANGE;
  const max = MOOD_RANGE;
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
    config.rounding.petal = size * lerp(d, 1, 0.2, 0.3);
    config.elongation.petal = lerp(d, 1.4, 1.3, 1.3);
    config.rounding.fold = size * lerp(d, 0.1, 0.05, 0.025, 0);
    config.elongation.fold = lerp(d, 2.5, 1);
    config.foldRadiusRange = lerp(d, 1, 0.65);
    config.petalRadiusRange *= lerp(d, 1, 0.9, 0.7);
    config.size *= lerp(d, 1, 1.1, 1.15, 1.4, 1.75);
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

const rotationMap = new Map<string /** id */, number /** max degrees */>();

const getMoodCSSVariables = (currMoodQ: number, args: props["anim"]) => {
  return {
    colors: () => {
      // shitty -3, -2, -1, 0, 1, 2, 3 heavenly
      const sliceLength = MOOD_RANGE / 3;
      const moodIdx = Math.round(currMoodQ / sliceLength);

      let outerColor: string;
      let innerColor: string;
      switch (moodIdx) {
        case -3: {
          outerColor = "196, 92, 255";
          innerColor = "146, 53, 210";
          break;
        }
        case -2: {
          outerColor = "125, 114, 255";
          innerColor = "88, 74, 210";
          break;
        }
        case -1: {
          outerColor = "150, 192, 255";
          innerColor = "86, 120, 210";
          break;
        }
        case 0: {
          outerColor = "224, 250, 255";
          innerColor = "103, 183, 210";
          break;
        }
        case 1: {
          outerColor = "154, 255, 129";
          innerColor = "98, 210, 88";
          break;
        }
        case 2: {
          outerColor = "222, 255, 117";
          innerColor = "224, 212, 92";
          break;
        }
        case 3: {
          outerColor = "255, 172, 91";
          innerColor = "232, 115, 53";
          break;
        }
        default: {
          outerColor = "224, 250, 255";
          innerColor = "103, 183, 210";
        }
      }

      return {
        "--fill-outer": `rgb(${outerColor}, var(--opacity-fill-outer))`,
        "--fill-inner": `rgb(${innerColor}, var(--opacity-fill-inner))`,
      };
    },
    rotation: () => {
      const { id } = args;
      const rotationCssVarKey = `--rotation-${id}`;
      let maxDeg = rotationMap.get(id);
      if (!maxDeg) {
        maxDeg = Math.random() * -40;
        rotationMap.set(id, maxDeg);
      }

      const rotation =
        maxDeg * (currMoodQ < 0 ? Math.abs(currMoodQ / MOOD_RANGE) : 0);
      return {
        [rotationCssVarKey]: `${rotation}deg`,
      };
    },
  };
};

const strokeKeyframes: CSSProperties[] = [
  {
    strokeWidth: 12,
  },
  {
    strokeWidth: 4,
  },
];

const ANIM = {
  DURATION: 5000,
  EASING: "cubic-bezier(0.65, 0, 0.35, 1)",
};

const animateSvgBloom = (ref: SVGSVGElement, args: props["anim"]) => {
  const { delayMs = 0, id } = args;
  const rotationCssVarKey = `--rotation-${id}`;
  ref.style.setProperty(rotationCssVarKey, "0deg");

  const bloomKeyframes: (CSSProperties &
    Record<string, unknown> & { offset: number })[] = [
    {
      offset: 0,
      zIndex: 10,
      opacity: 1,
      "--opacity-fill-outer": 1,
      "--opacity-fill-inner": 1,
      transform: `translate(-50%, -50%) scale(0.2) rotate(0deg)`,
    },
    {
      offset: 0.5,
      "--opacity-fill-outer": 0.2,
      transform: `translate(-50%, -50%) scale(0.6) rotate(calc(var(${rotationCssVarKey}) / 2))`,
    },
    {
      offset: 0.9,
      "--opacity-fill-inner": 0.6,
      opacity: 0.7,
    },
    {
      offset: 1,
      zIndex: 1,
      "--opacity-fill-outer": 0,
      opacity: 0,
      transform: `translate(-50%, -50%) scale(1) rotate(var(${rotationCssVarKey}))`,
    },
  ];

  ref.animate(bloomKeyframes as Keyframe[], {
    duration: ANIM.DURATION,
    easing: ANIM.EASING,
    iterations: Infinity,
    delay: delayMs,
  });

  ref.querySelectorAll("path").forEach((stroke) => {
    stroke.animate(strokeKeyframes as Keyframe[], {
      duration: ANIM.DURATION,
      easing: ANIM.EASING,
      iterations: Infinity,
      delay: delayMs,
    });
  });
};

const ReactivePolyflower: React.FC<props> = (props) => {
  const { morphDelayMs = 0, anim, size } = props;
  const { shouldBloom = true } = anim;

  const { moodQ } = useMoodContext();
  const config = useDelayedValue(
    getReactiveConfig({ currMoodQ: moodQ, size }),
    morphDelayMs
  );

  const svgRef = useRef<SVGSVGElement>(null);

  useCSSVariables(
    {
      val: getMoodCSSVariables(moodQ, anim).colors(),
    },
    [moodQ]
  );
  useCSSVariables(
    {
      val: getMoodCSSVariables(moodQ, anim).rotation(),
      nodes: [svgRef.current],
    },
    [moodQ]
  );

  useEffect(() => {
    if (svgRef.current && shouldBloom) {
      animateSvgBloom(svgRef.current, anim);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldBloom, svgRef]);

  const transitionDelay = `${props.anim.delayMs}ms`;
  const style = {
    ...anim.style,
    transitionDelay,
  };

  return (
    <Polyflower ref={svgRef} style={style} id={props.anim.id} {...config}>
      <defs>
        <radialGradient style={style} id="bg-fill">
          <stop offset="0%" stopColor="var(--fill-inner)" />
          <stop offset="100%" stopColor="var(--fill-outer)" />
        </radialGradient>
        <linearGradient
          style={style}
          id="stroke-fill"
          gradientTransform="rotate(45 0.5 0.5)"
        >
          <stop offset="0%" stopColor="var(--fill-outer)" />
          <stop offset="50%" stopColor="var(--fill-inner)" />
          <stop offset="100%" stopColor="var(--fill-outer)" />
        </linearGradient>
      </defs>
    </Polyflower>
  );
};

export default ReactivePolyflower;
