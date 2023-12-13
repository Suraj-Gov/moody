export type TCoord = [number, number];

const f = (n: number) => Number(n.toFixed(2));
export const toRad = (d: number) => (Math.PI / 180) * d;
export const xy = (point: TCoord) => point.map(f).join(" ");

export const getLineLength = (a: TCoord, b: TCoord) => {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const l = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  return l;
};

export class Rounder {
  private points: [TCoord, TCoord, TCoord];

  private getKappa = (angle: number) => {
    return (4 / 3) * Math.tan(toRad(angle) / 4);
  };

  private getFoldAngle = () => {
    const [[xA, yA], [xB, yB], [xC, yC]] = this.points;
    // Calculate slopes of lines AB and BC
    let slopeAB = (yB - yA) / (xB - xA);
    let slopeBC = (yC - yB) / (xC - xB);
    if (isNaN(slopeAB)) slopeAB = 0;
    if (isNaN(slopeBC)) slopeBC = 0;

    // Use the formula to get tan(theta)
    const tanTheta = Math.abs((slopeAB - slopeBC) / (1 + slopeAB * slopeBC));

    // Calculate theta using arctan
    let theta = Math.atan(tanTheta);

    // Check if the angle is in the second or third quadrant
    if ((xB < xC && yB > yC) || (xB > xC && yB < yC)) {
      theta += Math.PI;
    } else if (xB < xC && yB < yC) {
      theta = 2 * Math.PI - theta;
    }

    // Choose the smaller angle
    const rad1 = theta;
    const rad2 = 2 * Math.PI - theta;
    const smallestAngleRad = Math.min(rad1, rad2);

    const angle = (smallestAngleRad * 180) / Math.PI;
    const isObtuse = angle > 90 && angle < 180;
    if (isObtuse) {
      return 180 - angle;
    }
    return angle;
  };

  private getPointOnLine = (a: TCoord, b: TCoord, dist: number): TCoord => {
    const [[x1, y1], [x2, y2]] = [a, b];
    const l = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    const unitX = (x2 - x1) / l;
    const unitY = (y2 - y1) / l;
    const delX = unitX * dist;
    const delY = unitY * dist;

    return [x2 + delX, y2 + delY];
  };

  private getPointOnLineRatio = (
    a: TCoord,
    b: TCoord,
    ratio: number
  ): TCoord => {
    const [[x1, y1], [x2, y2]] = [a, b];
    const l = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const dist = l * ratio;
    const dirX = x2 - x1;
    const dirY = y2 - y1;
    const magnitude = Math.sqrt(Math.pow(dirX, 2) + Math.pow(dirY, 2));
    const normX = dirX / magnitude;
    const normY = dirY / magnitude;

    return [x2 + dist * normX, y2 + dist * normY];
  };

  private getRoundTerminals = (angle: number, r: number): [TCoord, TCoord] => {
    // tan(ang/2) = opp/adj
    // adj = opp / tan(ang/2)
    const computedOffset = r / Math.tan(toRad(angle / 2));
    const [a, pivot, b] = this.points;
    const maxOffset = getLineLength(a, pivot); // both lines are equal
    const offset = Math.min(computedOffset, maxOffset);

    const l1XY = this.getPointOnLine(a, pivot, -offset);
    const l2XY = this.getPointOnLine(b, pivot, -offset);
    return [l1XY, l2XY];
  };

  private getRoundHandles = (
    roundTerminals: [TCoord, TCoord],
    angle: number,
    elongation: number
  ): [TCoord, TCoord] => {
    const pivot = this.points[1];
    const [a, b] = roundTerminals;

    const k = this.getKappa(angle) * elongation;
    const h1XY = this.getPointOnLineRatio(pivot, a, -k);
    const h2XY = this.getPointOnLineRatio(pivot, b, -k);
    return [h1XY, h2XY];
  };

  constructor(points: [TCoord, TCoord, TCoord]) {
    this.points = points;
  }

  getRoundedPath = (r: number, elongation = 1) => {
    const angle = this.getFoldAngle();
    if (!r) {
      const nonRoundedPath = this.points.map(xy).join("L");
      return { pathCoordinates: this.points, pathDef: nonRoundedPath };
    }

    const terminals = this.getRoundTerminals(angle, r);
    const handles = this.getRoundHandles(terminals, angle, elongation);
    const pathCoordinates = [
      this.points[0],
      terminals[0],
      ...handles,
      terminals[1],
      this.points[2],
    ];
    const pathDef =
      xy(this.points[0]) +
      "L" +
      xy(terminals[0]) +
      "C" +
      [...handles, terminals[1]].map(xy).join(",") +
      "L" +
      xy(this.points[2]);
    return {
      pathCoordinates,
      pathDef,
    };
  };
}

export const findIntersectionPoint = (
  angleInDegrees: number,
  radius: number,
  origin: TCoord
): TCoord => {
  // Convert the angle from degrees to radians
  const angleInRadians = (angleInDegrees * Math.PI) / 180;

  // Calculate the x and y coordinates
  let x = radius * Math.cos(angleInRadians);
  let y = radius * Math.sin(angleInRadians);

  // Check for very small values and set them to zero
  const epsilon = 1e-2;
  if (Math.abs(x) < epsilon) {
    x = 0;
  }
  if (Math.abs(y) < epsilon) {
    y = 0;
  }

  const [offsetX, offsetY] = origin;
  return [f(x + offsetX), f(y + offsetY)];
};
