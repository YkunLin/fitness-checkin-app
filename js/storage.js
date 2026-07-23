// Read/write `localStorage` data
import { DEFAULT_EXERCISES } from "./config.js";

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

export function saveExercises(exercise){
    return writeJSON(STORAGE_KEYS.exercises, exercise)
}

export function resetExercises(){
    const defaultExercises = structuredClone(DEFAULT_EXERCISES)
    saveExercises(defaultExercises)

    return defaultExercises
}

export function getWeeklyPlans(){
    return readJSON(STORAGE_KEYS.weeklyPlans, {})
}

export function saveWeeklyPlans(weeklyPlans){
    return writeJSON(STORAGE_KEYS.weeklyPlans, weeklyPlans)
}

export function getWorkouts(){
    return readJSON(STORAGE_KEYS.workouts, [])
}

export function saveWorkouts(workouts){
    return writeJSON(STORAGE_KEYS.workouts, workouts)
}

export function getLanguage(){
    return localStorage.getItem(STORAGE_KEYS.language) || "zh"
}

export function saveLanguage(language){
    localStorage.setItem(STORAGE_KEYS.language, language)
}