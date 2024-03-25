import { createContext, useContext } from "react";

export const MOOD_RANGE = 150;
export const MoodContext = createContext({ moodQ: 0 });
export const useMoodContext = () => useContext(MoodContext);
