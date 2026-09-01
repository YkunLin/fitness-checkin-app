// weekly plan
import {
    getExercises,
    getWeeklyPlans,
    saveWeeklyPlans
} from "./storage.js";

import {getCurrentLanguage, t} from "./language.js";

const DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
]

let currentWeekStart = getMonday(new Date())
let weeklyPlans = {}
let exercises = []

function getMonday(date){
    const result = new Date(date)
    const day = result.getDay()
    const difference = day === 0 ? -6 : 1 - day

    result.setDate(result.getDate() + difference)
    result.setHours(0,0,0,0)
    
    return result
}

function formatDateKey(date) {
    const year = date.getFullYear()

    const month = String(date.getMonth() + 1).padStart(2, "0")

    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
}

function getWeekKey() {
    return formatDateKey(currentWeekStart)
}

function getEmptyWeekPlan() {
    return {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
    }
}

function getCurrentWeekPlan() {
    const weekKey = getWeekKey()

    return weeklyPlans[weekKey]
        ? structuredClone(weeklyPlans[weekKey])
        : getEmptyWeekPlan()
}

function renderWeekRange() {
    const start = new Date(currentWeekStart)

    const end = new Date(currentWeekStart)
    end.setDate(end.getDate() + 6)

    const language = getCurrentLanguage()

    const formatter = new Intl.DateTimeFormat(
        language === "zh"
            ? "zh-CN"
            : "en-US",
        {
            month: "short",
            day: "numeric"
        }
    )

    document.getElementById("week-range").textContent =
        `${formatter.format(start)} - ${formatter.format(end)}`
}

function renderWeeklyPlan() {
    const grid = document.getElementById("weekly-plan-grid")
    grid.innerHTML = ""

    const plan = getCurrentWeekPlan()

    DAYS.forEach((day) => {
        const dayCard = document.createElement("article")
        dayCard.className = "day-plan-card"
        dayCard.dataset.day = day

        const title = document.createElement("h3")
        title.textContent = t(day)

        const exerciseList = document.createElement("div")
        exerciseList.className = "day-exercise-list"

        exercises.forEach((exercise) => {
            const label = document.createElement("label")
            label.className = "exercise-check-row"

            const checkbox = document.createElement("input")
            checkbox.type = "checkbox"
            checkbox.value = exercise.id
            checkbox.checked = plan[day].includes(exercise.id)

            const name = document.createElement("span")
            name.textContent =
                exercise.names[getCurrentLanguage()] ||
                exercise.names.zh ||
                exercise.names.en ||
                exercise.id

            label.append(
                checkbox,
                name
            )

            exerciseList.appendChild(label)
        })

        dayCard.append(title, exerciseList)
        grid.appendChild(dayCard)
    })
    
    renderWeekRange()
}