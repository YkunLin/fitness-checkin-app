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

function getPlanForDate(date){
    const monday = getMonday(date)
    const weekKey = formatDateKey(monday)

    if (weeklyPlans[weekKey]) {
        return weeklyPlans[weekKey]
    }

    return (getPreviousSavedPlan(weekKey) || null)
}

function getTodayExerciseIds() {
    const today = new Date()
    const plan = getPlanForDate(today)

    if (!plan) {
        return []
    }

    const dayKey = DAY_KEYS[today.getDay()]

    return plan[dayKey] || []
}

function getExerciseById(id) {
    return exercises.find((exercise) => exercise.id === id)
}

function getTodayWorkoutRecord() {
    const todayKey = formatDateKey(new Date())

    return workouts.find((workout) => workout.date === todayKey)
}

function renderTodayDate() {
    const language = getCurrentLanguage()

    const formatter = new Intl.DateTimeFormat(
        language === "zh" ? "zh-CN" : "en-US",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    )

    document.getElementById("today-date")
            .textContent = formatter.format(new Date())
}

function createSetRow(exercise, setNumber, savedSet) {
    const row = document.createElement("div")
    row.className = "workout-set-row"

    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.className = "set-completed"
    checkbox.checked = savedSet?.completed ?? false

    const setLabel = document.createElement("span")
    setLabel.className = "set-label"

    if (getCurrentLanguage() === "zh") {
        setLabel.textContent = `${t("set")}${setNumber}${t("setSuffix")}`
    } else {
        setLabel.textContent = `${t("set")} ${setNumber}`
    }

    const valueInput = document.createElement("input")
    valueInput.type = "number"
    valueInput.className = "set-actual-value"
    valueInput.min = "0"
    valueInput.step = "1"
    valueInput.inputMode = "numeric"
    valueInput.value = savedSet?.actualValue ?? exercise.defaultValue

    const unitLabel = document.createElement("span")
    unitLabel.className = "set-unit"
    unitLabel.textContent = exercise.units[getCurrentLanguage()]
                        ||  exercise.units.zh
                        ||  ""

    row.append(checkbox, setLabel, valueInput, unitLabel)

    return row
}

function renderExerciseCard(exercise, savedExercise){
    const card = document.createElement("article")
    card.className = "today-exercise-card"
    card.dataset.exerciseId = exercise.id

    const title = document.createElement("h3")
    title.textContent = exercise.names[getCurrentLanguage()]
                        || exercise.names.zh
                        || exercise.id

    const setsContainer = document.createElement("div")
    setsContainer.className = "workout-sets"

    for(let i = 1; i <= exercise.defaultSets; i++) {
        const savedSet = savedExercise?.sets?.[i-1]
        setsContainer.appendChild(createSetRow(exercise, i, savedSet))
    }

    card.append(title, setsContainer)

    return card
}

function renderTodayWorkout() {
    const list = document.getElementById("today-workout-list")
    list.innerHTML = ""

    const exerciseIds = getTodayExerciseIds()

    renderTodayDate()

    if (exerciseIds.length === 0) {
        const message = document.createElement("p")
        message.className = "empty-state"
        message.textContent = t("noWorkoutToday")
        
        list.appendChild(message)

        return;
    }

    const savedWorkout = getTodayWorkoutRecord()

    exerciseIds.forEach((exerciseId) => {
        const exercise = getExerciseById(exerciseId)

        if (!exercise) {
            return;
        }

        const savedExercise = savedWorkout?.exercises?.find(
            (item) => item.exerciseId === exercise.id
        )

        list.appendChild(renderExerciseCard(exercise, savedExercise))
    })
}

function readTodayWorkoutFromUI() {
    const todayKey = formatDateKey(new Date())

    const exerciseCards = document.querySelectorAll(".today-exercise-card")

    const workoutExercises = [...exerciseCards].map((card) => {
        const exerciseId = card.dataset.exerciseId

        const setCheckboxes = card.querySelectorAll(".set-completed")

        const sets = [...setCheckboxes].map((checkbox, index) => {
            const row = checkbox.closest(".workout-set-row")

            const valueInput = row.querySelector(".set-actual-value")

            return {
                setNumber: index + 1,
                completed: checkbox.checked,
                actualValue: Number(valueInput.value)
            }
        })
        
        return {exerciseId, sets}
    })

    return {
        date: todayKey,
        exercises: workoutExercises
    }
}

function validateTodayWorkout() {
    const inputs = document.querySelectorAll(".set-actual-value")

    for (const input of inputs) {
        const value = Number(input.value)

        if (
            input.value.trim() === "" ||
            !Number.isInteger(value) ||
            value < 0
        ) {
            return false
        }
    }

    return true
}

function saveTodayWorkout() {
    if (!validateTodayWorkout()) {
        const message = document.getElementById("today-message")
        message.textContent = getCurrentLanguage() === "zh" ? "请输入有效的训练数值（0 或正整数）。"
                                                            : "Enter a valid workout value (0 or a positive integer)."
        message.className = "settings-message error"

        return
    }

    const newWorkout = readTodayWorkoutFromUI()

    const existingIndex = workouts.findIndex((workout) => workout.date === newWorkout.date)

    if (existingIndex >= 0){
        workouts[existingIndex] = newWorkout
    } else {
        workouts.push(newWorkout)
    }

    if (!saveWorkouts(workouts)) {
        const message = document.getElementById("today-message")

        message.textContent = getCurrentLanguage() === "zh" ? "训练记录保存失败。"
                                                            : "Failed to save workout."
        message.className = "settings-message error"
        
        return
    }

    const message = document.getElementById("today-message")

    message.textContent = t("todayWorkoutSaved")

    message.className = "settings-message success"
}

export function initializeToday() {
    exercises = getExercises()

    weeklyPlans = getWeeklyPlans()

    workouts = getWorkouts()

    document.getElementById("save-today-workout-btn")
            .addEventListener("click", saveTodayWorkout)
    
    renderTodayWorkout()
}

export function refreshToday() {
    exercises = getExercises()
    weeklyPlans = getWeeklyPlans()
    workouts = getWorkouts()

    renderTodayWorkout()
}

export function refreshTodayLanguage() {
    refreshToday()
}

