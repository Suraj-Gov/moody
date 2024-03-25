import { PropsWithChildren, useState } from "react";
import "./App.css";
import ReactivePolyflower from "./components/ReactivePolyflower";

const range = 150;

const Slot: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <span className="relative select-none pointer-events-none touch-none">
      {children}
    </span>
  );
};

function App() {
  const [moodQ, setMoodQ] = useState(0);

  const handleMoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMoodQ(e.target.valueAsNumber);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <main className="flex flex-col justify-center items-center gap-12">
        <div className="flex relative justify-center items-center min-h-[300px]">
          <Slot>
            <ReactivePolyflower
              curr={moodQ}
              range={range}
              size={250}
              anim={{
                id: "flower",
              }}
            />
          </Slot>
          <Slot>
            <ReactivePolyflower
              curr={moodQ}
              range={range}
              size={250}
              anim={{
                id: "flower",
                delayMs: 1250,
              }}
            />
          </Slot>
          <Slot>
            <ReactivePolyflower
              curr={moodQ}
              range={range}
              size={250}
              anim={{
                id: "flower",
                delayMs: 2500,
              }}
            />
          </Slot>
          <Slot>
            <ReactivePolyflower
              curr={moodQ}
              range={range}
              size={250}
              anim={{
                id: "flower",
                delayMs: 3750,
              }}
            />
          </Slot>
          <Slot>
            <ReactivePolyflower
              curr={moodQ}
              range={range}
              size={100}
              anim={{
                id: "flower-center",
              }}
            />
          </Slot>
        </div>
        <section className="flex flex-col justify-center items-center">
          <label htmlFor="mood-slider">How're ya feelin?</label>
          <div className="mt-4 flex gap-4">
            <pre>shitty</pre>
            <input
              id="mood-slider"
              type="range"
              value={moodQ}
              min={-range}
              max={range}
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
