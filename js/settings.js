// Modify the default exercise within the webpage
import {
    getExercises,
    saveExercises,
    resetExercises
} from "./storage.js"

let exercise = []

function createExerciseId(name) {
    const normalizedName = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
        .replace(/^-+|-+$/g, "")

    const randomPart = Math.random().toString(36).slice(2, 7)

    return `${normalizedName || "exercise"}-${randomPart}`
}
