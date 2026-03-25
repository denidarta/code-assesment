import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Step1Data, Step2Data, Step3Data } from "@/lib/schemas";

type RegisterState = {
  step1: Partial<Step1Data>;
  step2: Partial<Step2Data>;
  step3: Partial<Step3Data>;
  completedSteps: Set<number>;
  setStep1: (data: Step1Data) => void;
  setStep2: (data: Step2Data) => void;
  setStep3: (data: Step3Data) => void;
  getLatestValidStep: () => number;
  reset: () => void;
};

export const useRegisterStore = create<RegisterState>()(
  persist(
    (set, get) => ({
      step1: {},
      step2: {},
      step3: {},
      completedSteps: new Set<number>(),

      setStep1: (data) =>
        set((s) => ({
          step1: data,
          completedSteps: new Set([...s.completedSteps, 1]),
        })),

      setStep2: (data) =>
        set((s) => ({
          step2: data,
          completedSteps: new Set([...s.completedSteps, 2]),
        })),

      setStep3: (data) =>
        set((s) => ({
          step3: data,
          completedSteps: new Set([...s.completedSteps, 3]),
        })),

      // Returns the highest step the user is ALLOWED to visit (not necessarily where they should go next).
      getLatestValidStep: () => {
        const { completedSteps } = get();
        if (completedSteps.has(2)) return 3;
        if (completedSteps.has(1)) return 2;
        return 1;
      },

      reset: () =>
        set({ step1: {}, step2: {}, step3: {}, completedSteps: new Set() }),
    }),
    {
      name: "register-form-v1",
      partialize: (state) => ({
        step1: state.step1,
        step2: state.step2,
        step3: state.step3,
        completedSteps: [...state.completedSteps],
      }),
      merge: (persisted: unknown, current) => {
        const p = persisted as {
          step1?: Partial<Step1Data>;
          step2?: Partial<Step2Data>;
          step3?: Partial<Step3Data>;
          completedSteps?: number[];
        };
        return {
          ...current,
          step1: p.step1 ?? current.step1,
          step2: p.step2 ?? current.step2,
          step3: p.step3 ?? current.step3,
          completedSteps: new Set(p.completedSteps ?? []),
        };
      },
    }
  )
);
