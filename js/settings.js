// Modify the default exercise within the webpage
import {
    getExercises,
    saveExercises,
    resetExercises,
    getLanguage
} from "./storage.js"

let exercises = []
let currentLanguage = getLanguage()

function createExerciseId(name) {
    const normalizedName = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
        .replace(/^-+|-+$/g, "")

    const randomPart = Math.random().toString(36).slice(2, 7)

    return `${normalizedName || "exercise"}-${randomPart}`
}

function createEmptyExercise(){
    return {
        id: createExerciseId("exercise"),
        names: {
            zh: "",
            en: ""
        },
        defaultSets: 0,
        defaultValue: 10,
        trackingType: "reps",
        units: {
            zh: "次",
            en: "reps"
        }
    }
}

function getElements(){
    return {
        list: document.getElementById("exercise-list"),
        template: document.getElementById("exercise-card-template"),
        addButton: document.getElementById("add-exercise-btn"),
        saveButton: document.getElementById("save-settings-btn"),
        resetButton: document.getElementById("reset-settings-btn"),
        message: document.getElementById("settings-message")
    }
}

function renderExercises(){
    const {list, template} = getElements()

    list.innerHTML = ""

    exercises.forEach((exercise, index) => {
        const fragment = template.content.cloneNode(true)
        const card = fragment.querySelector(".exercise-card")

        card.dataset.exerciseId = exercise.id

        fragment.querySelector(".exercise-number").textContent = `动作 ${index + 1}`
        fragment.querySelector(".exercise-name").value = exercise.names[currentLanguage]
        fragment.querySelector(".exercise-sets").value = exercise.defaultSets
        fragment.querySelector(".exercise-value").value = exercise.defaultValue
        fragment.querySelector(".exercise-type").value = exercise.trackingType
        fragment.querySelector(".exercise-unit").value = exercise.units[currentLanguage]
    
        const deleteButton = fragment.querySelector(".delete-exercise-btn")

        deleteButton.addEventListener("click", () => {
            deleteExercise(exercise.id)
        })

        list.appendChild(fragment)
    })
}

function readExercisesFromForm(){
    const cards = document.querySelectorAll(".exercise-card")

    return [...cards].map((card) => {
        const id = card.dataset.exerciseId

        const oldExercise = exercises.find(
            (exercise) => exercise.id === id
        );

        const updatedExercise = structuredClone(oldExercise);

        updatedExercise.names[currentLanguage] =
            card.querySelector(".exercise-name").value.trim();

        updatedExercise.defaultSets =
            Number(card.querySelector(".exercise-sets").value);

        updatedExercise.defaultValue =
            Number(card.querySelector(".exercise-value").value);

        updatedExercise.trackingType =
            card.querySelector(".exercise-type").value;

        updatedExercise.units[currentLanguage] =
            card.querySelector(".exercise-unit").value.trim();

        return updatedExercise;
    })
}

function validateExercises(updatedExercises) {
    if (updatedExercises.length === 0) {
        return currentLanguage === "zh"
            ? "至少需要保留一个训练动作。"
            : "You need to keep at least one exercise."
    }

    for (const exercise of updatedExercises) {
        if (!exercise.names[currentLanguage]) {
            return currentLanguage === "zh"
                ? "请填写动作名称。"
                : "Please enter an exercise name."
        }

        if (exercise.defaultSets < 0) {
            return currentLanguage === "zh"
                ? "组数不能小于 0。"
                : "Sets cannot be below 0."
        }

        if (exercise.defaultValue < 1) {
            return currentLanguage === "zh"
                ? "每组数值必须大于 0。"
                : "The value per set must be greater than 0."
        }

        if (!exercise.units[currentLanguage]) {
            return currentLanguage === "zh"
                ? "请填写单位。"
                : "Please enter a unit."
        }
    }

    return null
}

function showMessage(text, type = "success") {
    const {message} = getElements()

    message.textContent = text
    message.className = `settings-message ${type}`
}

function addExercise() {
    exercises.push(createEmptyExercise())
    renderExercises()

    const cards = document.querySelectorAll(".exercise-card")
    const lastCard = cards[cards.length - 1]

    lastCard?.scrollIntoView({
        behavior: "smooth",
        block: "center"
    })
}

function deleteExercise(exerciseId){
    exercises = exercises.filter(
        (exercise)=> exercise.id !== exerciseId
    )

    renderExercises()
}

function handleSave() {
    const updatedExercises = readExercisesFromForm()
    const validationError = validateExercises(updatedExercises)

    if (validationError) {
        showMessage(validationError, "error")
        return
    }

    const saved = saveExercises(updatedExercises)

    if (!saved) {
        showMessage("保存失败，请稍后重试。", "error")
        return
    }

    exercises = updatedExercises
    showMessage("默认动作已保存。")
}

function handleReset() {
    const confirmed = window.confirm(
        "确定要恢复官方默认动作吗？"
    )

    if (!confirmed) {
        return
    }

    exercises = resetExercises()
    renderExercises()
    showMessage("已经恢复默认动作。")
}

export function initializeSettings() {
    const {addButton, saveButton, resetButton} = getElements()

    exercises = getExercises()
    renderExercises()

    addButton.addEventListener("click", addExercise)
    saveButton.addEventListener("click", handleSave)
    resetButton.addEventListener("click", handleReset)
}