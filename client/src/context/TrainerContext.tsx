// context/TrainerContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface TrainerContextType {
  trainerId: string | null;
  setTrainerId: (id: string) => void;
}

const TrainerContext = createContext<TrainerContextType>({
  trainerId: null,
  setTrainerId: () => {},
});

export const TrainerProvider = ({ children }: { children: ReactNode }) => {
  const [trainerId, setTrainerIdState] = useState<string | null>(null);

  // هنگام تغییر trainerId در localStorage هم ذخیره کن
  useEffect(() => {
    if (trainerId) {
      localStorage.setItem("trainerId", trainerId);
    }
  }, [trainerId]);

  // هنگام mount مقدار ذخیره‌شده را بخوان
  useEffect(() => {
    const stored = localStorage.getItem("trainerId");
    if (stored) {
      setTrainerIdState(stored);
    }
  }, []);

  const setTrainerId = (id: string) => {
    setTrainerIdState(id);
  };

  return (
    <TrainerContext.Provider value={{ trainerId, setTrainerId }}>
      {children}
    </TrainerContext.Provider>
  );
};

export const useTrainer = () => useContext(TrainerContext);
