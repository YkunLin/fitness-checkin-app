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

function getPreviousSavedPlan(currentWeekKey) {
    const savedWeekKeys = Object.keys(weeklyPlans)

    const previousWeekKeys = savedWeekKeys
        .filter((weekKey) => weekKey < currentWeekKey)
        .sort((a, b) => b.localeCompare(a))

    if (previousWeekKeys.length === 0) {
        return null
    }

    const nearestPreviousWeekKey = previousWeekKeys[0]

    return weeklyPlans[nearestPreviousWeekKey]
}

function getCurrentWeekPlan() {
    const weekKey = getWeekKey()

    if (weeklyPlans[weekKey]){
        return structuredClone(weeklyPlans[weekKey])
    }

    const previousPlan = getPreviousSavedPlan(weekKey)

    if (previousPlan) {
        return structuredClone(previousPlan)
    }

    return getEmptyWeekPlan()
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
    renderPlanStatus()
}

function renderPlanStatus() {
    const weekKey = getWeekKey()

    const status = document.getElementById("week-plan-status")

    if (!status) {
        return;
    }

    if (weeklyPlans[weekKey]) {
        status.textContent = t("savedPlan")
        return;
    }

    const previousPlan = getPreviousSavedPlan(weekKey)

    status.textContent = previousPlan ? t("inheritedPlan") : "";
}

function readPlanFromUI() {
    const plan = getEmptyWeekPlan()

    document.querySelectorAll(".day-plan-card")
            .forEach((card) => {
                const day = card.dataset.day

                const checkedExercises = 
                    card.querySelectorAll('input[type="checkbox"]:checked')
                
                plan[day] = [...checkedExercises].map((checkbox) => checkbox.value)
            })
    return plan
}

function showWeeklyMessage(text) {
    const message = document.getElementById("weekly-message")

    message.textContent = text
    message.className = "settings-message success"
}

function saveCurrentWeekPlan() {
    const weekKey = getWeekKey()

    weeklyPlans[weekKey] = readPlanFromUI()

    saveWeeklyPlans(weeklyPlans)

    showWeeklyMessage(
        t("weeklyPlanSaved")
    )

    renderPlanStatus()
}

function changeWeek(offset) {
    currentWeekStart.setDate(
        currentWeekStart.getDate() + offset * 7
    )

    renderWeeklyPlan()
}

function goToCurrentWeek() {
    currentWeekStart = getMonday(new Date())

    renderWeeklyPlan()
}

export function initializeWeeklyPlan() {
    exercises = getExercises()
    weeklyPlans = getWeeklyPlans()

    document
        .getElementById("prev-week-btn")
        .addEventListener(
            "click",
            () => changeWeek(-1)
        )

    document
        .getElementById("next-week-btn")
        .addEventListener(
            "click",
            () => changeWeek(1)
        )

    document
        .getElementById("this-week-btn")
        .addEventListener(
            "click",
            goToCurrentWeek
        )

    document
        .getElementById("save-weekly-plan-btn")
        .addEventListener(
            "click",
            saveCurrentWeekPlan
        )

    renderWeeklyPlan()
}

export function refreshWeeklyPlanLanguage() {
    exercises = getExercises()

    renderWeeklyPlan()
}