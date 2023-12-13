import { useMemo, useState } from "react";
import "./App.css";
import Polyflower from "./components/Polyflower";

const lerp = (a: number, b: number, delta: number) => {
  return a + (b - a) * delta;
};

const d = (from: number, to: number, currVal: number) => {
  const fullRange = from - to;
  const delta = (currVal - from) / fullRange;
  return Math.abs(delta);
};

function App() {
  const [moodQ, setMoodQ] = useState(0);

  const handleMoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMoodQ(e.target.valueAsNumber);
  };

  const polyflowerProps = useMemo((): React.ComponentProps<
    typeof Polyflower
  > => {
    const config = {
      elongation: 1,
      foldRadiusRange: 1,
      sides: 8,
      rounding: {
        petal: 0,
        fold: 0,
      },
      size: 150,
      petalRadiusRange: 0.9,
    };

    const isShitty = moodQ >= -150 && moodQ < -10;
    if (isShitty) {
      const delta = d(-10, -150, moodQ);
      console.log(delta);
      config.petalRadiusRange = lerp(0.79, 0.9, delta);
      config.foldRadiusRange = lerp(1, 0.6, delta);
      config.sides = 8;
      if (moodQ >= 30 && moodQ < 0) {
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

    const isOk = moodQ >= -10 && moodQ < 10;
    if (isOk) {
      config.petalRadiusRange = 0.9;
      config.elongation = 1.3;
      config.foldRadiusRange = 1;
      config.sides = 5;
      config.rounding.petal = 100;
      config.rounding.fold = 10;
      return config;
    }

    const isHeavenly = moodQ >= 10 && moodQ <= 150;
    if (isHeavenly) {
      const delta = d(10, 150, moodQ);
      if (moodQ >= 10 && moodQ <= 30) {
        config.petalRadiusRange = 0.9;
      } else {
        const delta2 = d(30, 150, moodQ);
        config.petalRadiusRange = lerp(0.9, 1.55, delta2);
      }
      config.elongation = lerp(1.3, 2.5, delta);
      config.foldRadiusRange = lerp(1, 0.45, delta);
      config.sides = 5;
      config.rounding.petal = lerp(100, 50, delta);
      config.rounding.fold = lerp(10, 0, delta);
      return config;
    }

    return config;
  }, [moodQ]);

  return (
    <div className="flex justify-center items-center h-screen">
      <main className="flex flex-col justify-center">
        <Polyflower {...polyflowerProps} />
        <section className="flex flex-col justify-center items-center">
          <label htmlFor="mood-slider">How're ya feelin?</label>
          <div className="mt-4 flex gap-4">
            <pre>shitty</pre>
            <input
              id="mood-slider"
              type="range"
              value={moodQ}
              min={-150}
              max={150}
              onChange={handleMoodChange}
            />
            <pre>heavenly</pre>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
