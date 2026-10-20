// History and details
import { getExercises, getWorkouts } from "./storage.js";
import { getCurrentLanguage, t } from "./language.js";

let exercises = []
let workouts = []

function formatHistoryDate(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number)

    const date = new Date(year, month - 1, day)

    return new Intl.DateTimeFormat(
        getCurrentLanguage() === "zh" ? "zh-CN" : "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long"
        }
    ).format(date)
}

function getExerciseById(id) {
    return exercises.find(exercise => exercise.id === id)
}

function getExerciseName(exerciseId) {
    const exercise = getExerciseById(exerciseId)

    if (!exercise) {
        return exerciseId
    }

    return (
        exercise.names[getCurrentLanguage()] ||
        exercise.names.zh ||
        exercise.names.en ||
        exerciseId
    )
}

function getExerciseUnit(exerciseId) {
    const exercise = getExerciseById(exerciseId)

    if (!exercise) {
        return ""
    }

    return (
        exercise.units[getCurrentLanguage()] ||
        exercise.units.zh ||
        ""
    )
}

function getWorkoutSummary(workout) {
    let totalSets = 0
    let completedSets = 0

    for (const exercise of workout.exercises || []) {
        for (const set of exercise.sets || []) {
            totalSets++

            if (set.completed) {
                completedSets++
            }
        }
    }

    return {
        exerciseCount: workout.exercises?.length || 0,
        totalSets,
        completedSets
    }
}