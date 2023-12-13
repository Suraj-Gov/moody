import { useState } from "react";
import "./App.css";
import Polyflower from "./components/Polyflower";

function App() {
  const [moodQ, setMoodQ] = useState(0);

  const handleMoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMoodQ(e.target.valueAsNumber);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <main className="flex flex-col justify-center">
        <Polyflower
          sides={8}
          size={200}
          foldRadiusRange={0.6}
          rounding={{
            petal: 5,
            fold: 5,
          }}
          elongation={1.8}
        />
        <section className="flex flex-col justify-center items-center">
          <label htmlFor="mood-slider">How're ya feelin?</label>
          <div className="mt-4 flex gap-4">
            <pre>shitty</pre>
            <input
              type="range"
              value={moodQ}
              min={-50}
              max={50}
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
