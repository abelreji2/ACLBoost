import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WorkoutSet{
    id: string;
    reps: string;
    weight: string;
    weightUnit: 'lbs' | 'kg';
    isCompleted: boolean;
}

interface WorkoutExercise{
    id: string;
    sanityId: string;
    name: string;
    sets: WorkoutSet[];
}

interface WorkoutStore{
    workoutExercise : WorkoutExercise[];
    weightUnitPreference: 'lbs' | 'kg';
    addExercise: (exercise: {sanityId: string; name: string}) => void;
    setWorkoutExercise: (exercise: WorkoutExercise[] | ((prev: WorkoutExercise[]) => WorkoutExercise[])) => void;
    setWeightUnit: (unit: 'kg' | 'lbs') => void;
    resetWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
    persist(
        (set) => ({
            workoutExercise: [],
            weightUnitPreference: 'lbs',
            addExercise: (exercise) => set((state) => {
                const newExercise: WorkoutExercise = {
                    id: Math.random().toString(),
                    sanityId: exercise.sanityId,
                    name: exercise.name,
                    sets: [],
                }
                return {
                    workoutExercise: [...state.workoutExercise, newExercise],
                }
            }),
            setWorkoutExercise: (exercises) => set((state) => ({
                // Changed from setWorkoutExercises to setWorkoutExercise
                workoutExercise:
                    typeof exercises === 'function' ? exercises(state.workoutExercise) : exercises
            })),
            setWeightUnit: (unit) => set({ weightUnitPreference: unit }),
            resetWorkout: () => set({ workoutExercise: [] }),
        }),
        {
            name: "workout-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                weightUnitPreference: state.weightUnitPreference,
            }),
        }
    )
);