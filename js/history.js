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

function createSetDetail(set, exerciseId) {
    const row = document.createElement("div")
    row.className = "history-set-row"

    const setLabel = document.createElement("span")
    setLabel.textContent = getCurrentLanguage() === "zh" ? `第${set.setNumber}组` : `Set ${set.setNumber}`

    const value = document.createElement("span")

    const actualValue = set.actualValue ?? "-"
    const unit = getExerciseUnit(exerciseId)

    value.textContent = `${actualValue} ${unit}`

    const status = document.createElement("span")
    status.className = set.completed ? "history-set-status completed" : "history-set-status incomplete"
    status.textContent = set.completed ? "✓" : t("notCompleted")

    row.append(setLabel, value, status)

    return row
}

function createExerciseDetail(workoutExercise) {
    const container = document.createElement("div")
    container.className = "history-exercise"

    const title = document.createElement("h4")

    title.textContent = getExerciseName(workoutExercise.exerciseId)

    const setsContainer = document.createElement("div")
    setsContainer.className = "history-sets"

    for (const set of workoutExercise.sets || []) {
        setsContainer.appendChild(
            createSetDetail(set, workoutExercise.exerciseId)
        )
    }

    container.append(title, setsContainer)

    return container
}

function createHistoryCard(workout) {
    const card = document.createElement("details")
    card.className = "history-card"

    const summary = document.createElement("summary")
    summary.className = "history-card-summary"

    const stats = getWorkoutSummary(workout)

    const date = document.createElement("h3")
    date.textContent = formatHistoryDate(workout.date)

    const description = document.createElement("p")

    description.textContent =
        getCurrentLanguage() === "zh"
            ? `${stats.exerciseCount} 个动作 · ${stats.completedSets}/${stats.totalSets} 组完成`
            : `${stats.exerciseCount} exercises · ${stats.completedSets}/${stats.totalSets} sets completed`

    summary.append(date, description)

    const details = document.createElement("div")
    details.className = "history-card-details"

    for (const workoutExercise of workout.exercises || []) {
        details.appendChild(
            createExerciseDetail(workoutExercise)
        )
    }

    card.append(summary, details)

    return card
}

function renderHistory() {
    const list = document.getElementById("history-list")

    if (!list) return

    list.innerHTML = ""

    if (workouts.length === 0) {
        const emptyMessage = document.createElement("p")
        emptyMessage.className = "empty-state"
        emptyMessage.textContent = t("noHistory")

        list.appendChild(emptyMessage)
        return
    }

    const sortedWorkouts = [...workouts].sort(
        (a, b) => b.date.localeCompare(a.date)
    )

    for (const workout of sortedWorkouts) {
        list.appendChild(createHistoryCard(workout))
    }
}

export function refreshHistory() {
    exercises = getExercises()
    workouts = getWorkouts()

    renderHistory()
}

export function initializeHistory() {
    refreshHistory()
}