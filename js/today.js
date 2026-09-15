// Today's training and check-in
import {
    getExercises,
    getWeeklyPlans,
    getWorkouts,
    saveWorkouts
} from "./storage.js"

import { getCurrentLanguage, t } from "./language.js"

const DAY_KEYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
]

let exercises = []
let weeklyPlans = {}
let workouts = []

function formatDateKey(date){
    const year = date.getFullYear()

    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
}

function getMonday(date){
    const result = new Date(date)

    const day = result.getDay()
    const difference = day === 0 ? -6 : 1 - day

    result.setDate(result.getDate() + difference)
    result.setHours(0,0,0,0)

    return result
}

function getPreviousSavedPlan(currentWeekKey) {
    const savedWeekKeys = Object.keys(weeklyPlans)

    const previousWeekKeys = 
        savedWeekKeys
            .filter(
                (weekKey) => weekKey < currentWeekKey
            )
            .sort(
                (a,b) => b.localeCompare(a)
            )
    
    if (previousWeekKeys.length === 0) {
        return null
    }

    return weeklyPlans[previousWeekKeys[0]]
}