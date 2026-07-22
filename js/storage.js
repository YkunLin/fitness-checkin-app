// Read/write `localStorage` data
import { DEFAULT_EXERCISES } from "./config";

const STORAGE_KEYS = {
    exercises: "workoutTracker_exercises",
    weeklyPlans: "workoutTracker_weeklyPlans",
    workouts: "workoutTracker_workouts",
    language: "workoutTracker_language"
}

function readJSON(key, fallbackValue) {
    try {
        const savedValue = localStorage.getItem(key)

        if(!savedValue) {
            return fallbackValue
        }

        return JSON.parse(savedValue)
    } catch (error) {
        console.error(`Unable to read ${key}:`, error)
        return fallbackValue
    }
}

function writeJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
    } catch (error) {
        console.error(`Unable to save ${key}:`, error)
        return false
    }
}

export function getExercise() {
    const exercises = readJSON(STORAGE_KEYS.exercises, null)

    if (exercises){
        return exercises
    }

    const defaultExercises = structuredClone(DEFAULT_EXERCISES)
    saveExercises(defaultExercises)

    return defaultExercises
}