import React, { CSSProperties, PropsWithChildren, useMemo } from "react";
import {
  MAX_SVG_SIZE,
  Rounder,
  TCoord,
  findIntersectionPoint,
  getLineLength,
  toRad,
  xy,
} from "../utils/math";

interface props extends PropsWithChildren {
  sides: number;
  size: number;
  foldRadiusRange: number /** 0 to 1 */;
  rounding: {
    petal: number;
    fold: number;
  };
  elongation: {
    petal: number;
    fold: number;
  };
  petalRadiusRange: number /** 0 to 1 */;
  className?: React.SVGAttributes<SVGSVGElement>["className"];
  id?: string;
  style?: CSSProperties;
}

const Polyflower: React.FC<props> = ({
  petalRadiusRange,
  sides,
  size,
  foldRadiusRange,
  rounding,
  elongation,
  className,
  children,
  id,
  style,
}) => {
  const angleDelta = 360 / sides;
  const petalRadius = size * petalRadiusRange;

  const maxFoldRadius = Math.cos(toRad(angleDelta / 2)) * petalRadius;
  const foldRadius = foldRadiusRange * maxFoldRadius;

  const origin: TCoord = [MAX_SVG_SIZE / 2, MAX_SVG_SIZE / 2];

  // always point upwards
  let rotationOffset = 0;
  switch (sides % 4) {
    case 1:
      rotationOffset = -angleDelta / 4;
      break;
    case 2:
      rotationOffset = -angleDelta / 2;
      break;
    case 3:
      rotationOffset = -angleDelta / 1.33;
      break;
  }

  const angles = useMemo(
    () =>
      [...Array(sides)].map((_, idx) => {
        const petalAngle = idx * angleDelta + rotationOffset;
        const foldAngle = petalAngle + angleDelta / 2;
        return [petalAngle, foldAngle];
      }),
    // will change only when sides change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sides]
  );

  const corners = angles.map(([petalAngle, foldAngle]) => {
    const vertCorner = findIntersectionPoint(petalAngle, petalRadius, origin);
    const foldCorner = findIntersectionPoint(foldAngle, foldRadius, origin);
    return [vertCorner, foldCorner];
  });

  const petals = corners.map(([vertCorner, foldCorner], idx, arr) => {
    // return [vertCorner, foldCorner].map(xy).join("L");
    const prevIdx = idx - 1 < 0 ? arr.length - 1 : idx - 1;
    const prevFoldCorner = arr[prevIdx][1];
    const r = new Rounder([prevFoldCorner, vertCorner, foldCorner]);
    const roundRadius = rounding.petal;
    const path = r.getRoundedPath(roundRadius, elongation.petal);
    return { ...path, roundRadius };
  });

  const folds = petals.map(({ pathCoordinates }, idx, arr) => {
    const nextIdx = (idx + 1) % arr.length;
    const p1 = pathCoordinates.at(-2)!;
    const p2 = corners[idx][1];
    const p3 = petals[nextIdx].pathCoordinates.at(1)!;
    const doesGetCollapsed = getLineLength(p1, p3) < 2;
    const r = new Rounder([p1, p2, p3]);
    const roundRadius = doesGetCollapsed ? 0 : rounding.fold;
    const path = r.getRoundedPath(roundRadius, elongation.fold);
    return { ...path, roundRadius };
  });

  const finalPath = petals.map((p, idx, arr) => {
    const prevIdx = idx - 1 < 0 ? arr.length - 1 : idx - 1;
    const nextIdx = (idx + 1) % arr.length;

    const { pathCoordinates: petalPathCoords, roundRadius: petalR } = p;
    const { pathCoordinates: foldPathCoords, roundRadius: foldR } = folds[idx];

    const hasSharpPetals = petalR === 0;
    const hasSharpFolds = foldR === 0;

    if (!hasSharpFolds && !hasSharpPetals) {
      // both paths have rounding
      const [pt0, ph0, ph1, pt1] = petalPathCoords.slice(1, -1);
      const petalPath = xy(pt0) + "C" + xy(ph0) + "," + xy(ph1) + "," + xy(pt1);
      const [ft0, fh0, fh1, ft1] = foldPathCoords.slice(1, -1);
      const foldPath = xy(ft0) + "C" + xy(fh0) + "," + xy(fh1) + "," + xy(ft1);
      return petalPath + "L" + foldPath;
    }

    if (hasSharpFolds && hasSharpPetals) {
      // both path roundings is zero
      return petalPathCoords.map(xy).join("L");
    }

    if (hasSharpFolds && !hasSharpPetals) {
      const [pt0, ph0, ph1, pt1] = petalPathCoords.slice(1, -1);
      const a = corners[prevIdx][1];
      const b = corners[idx][1];

      const curvePath = `${xy(pt0)} C ${xy(ph0)}, ${xy(ph1)}, ${xy(pt1)}`;
      return `${xy(a)} L ${curvePath} L ${xy(b)}`;
    }

    if (hasSharpPetals && !hasSharpFolds) {
      const [ft0, fh0, fh1, ft1] = foldPathCoords.slice(1, -1);
      const a = corners[idx][0];
      const b = corners[nextIdx][0];

      const curvePath = `${xy(ft0)} C ${xy(fh0)}, ${xy(fh1)}, ${xy(ft1)}`;
      return `${xy(a)} L ${curvePath} L ${xy(b)}`;
    }

    console.error("this should never get logged");
  });

  return (
    <svg
      style={style}
      className={`origin-center absolute top-0 left-0 ${className}`}
      id={id}
      width={MAX_SVG_SIZE}
      height={MAX_SVG_SIZE}
      fill="transparent"
    >
      <path
        style={{ animationDelay: style?.animationDelay }}
        d={`M ${finalPath.join("L")} Z`}
      />
      {children}
    </svg>
  );
};

export default Polyflower;
