import { PropsWithChildren, useState } from "react";
import "./App.css";
import ReactivePolyflower from "./components/ReactivePolyflower";
import { MOOD_RANGE, MoodContext } from "./contexts/MoodContext";

const Slot: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <span className="relative select-none pointer-events-none touch-none">
      {children}
    </span>
  );
};

const CENTER_FLOWER_SIZE = 100;
const BLOOMING_FLOWER_SIZE = 250;

function App() {
  const [moodQ, setMoodQ] = useState(0);

  const handleMoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMoodQ(e.target.valueAsNumber);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <main className="flex flex-col justify-center items-center gap-12">
        <div className="flex relative justify-center items-center min-h-[300px]">
          <MoodContext.Provider value={{ moodQ }}>
            <Slot>
              <ReactivePolyflower
                size={BLOOMING_FLOWER_SIZE}
                anim={{
                  id: "flower",
                }}
              />
            </Slot>
            <Slot>
              <ReactivePolyflower
                size={BLOOMING_FLOWER_SIZE}
                morphDelayMs={50}
                anim={{
                  id: "flower",
                  delayMs: 1250,
                }}
              />
            </Slot>
            <Slot>
              <ReactivePolyflower
                size={BLOOMING_FLOWER_SIZE}
                morphDelayMs={120}
                anim={{
                  id: "flower",
                  delayMs: 2500,
                }}
              />
            </Slot>
            <Slot>
              <ReactivePolyflower
                size={BLOOMING_FLOWER_SIZE}
                morphDelayMs={200}
                anim={{
                  id: "flower",
                  delayMs: 3750,
                }}
              />
            </Slot>
            <Slot>
              <ReactivePolyflower
                size={CENTER_FLOWER_SIZE}
                anim={{
                  id: "flower-center",
                  style: {
                    zIndex: 20,
                  },
                }}
              />
            </Slot>
          </MoodContext.Provider>
        </div>
        <section className="flex flex-col justify-center items-center">
          <label htmlFor="mood-slider">How're ya feelin?</label>
          <div className="mt-4 flex gap-4">
            <pre>shitty</pre>
            <input
              id="mood-slider"
              type="range"
              value={moodQ}
              min={-MOOD_RANGE}
              max={MOOD_RANGE}
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
