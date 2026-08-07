// Modify the default exercise within the webpage
import {
    getExercises,
    saveExercises,
    resetExercises
} from "./storage.js"

let exercises = []

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
        fragment.querySelector(".exercise-name-zh").value = exercise.names.zh
        fragment.querySelector(".exercise-name-en").value = exercise.names.en
        fragment.querySelector(".exercise-sets").value = exercise.defaultSets
        fragment.querySelector(".exercise-value").value = exercise.defaultValue
        fragment.querySelector(".exercise-type").value = exercise.trackingType
        fragment.querySelector(".exercise-unit-zh").value = exercise.units.zh
        fragment.querySelector(".exercise-unit-en").value = exercise.units.en
    
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

        return {
            id,
            names: {
                zh: card
                    .querySelector(".exercise-name-zh")
                    .value
                    .trim(),
                
                en: card
                    .querySelector(".exercise-name-en")
                    .value
                    .trim()
            },

            defaultSets: Number(
                card.querySelector(".exercise-sets").value
            ),

            defaultValue: Number(
                card.querySelector(".exercise-value").value
            ),

            trackingType:
                card.querySelector(".exercise-type").value,

            units: {
                zh: card
                    .querySelector(".exercise-unit-zh")
                    .value
                    .trim(),

                en: card
                    .querySelector(".exercise-unit-en")
                    .value
                    .trim()
            }
        }
    })
}

function validateExercises(updatedExercises){
    if (updatedExercises.length === 0){
        return "至少需要保留一个训练动作。"
    }

    for (const exercise of updatedExercises) {
        if (!exercise.names.zh || !exercise.names.en) {
            return "请填写所有动作的中文名称和英文名称。"
        }

        if (exercise.defaultSets < 1 || exercise.defaultValue < 1) {
            return "组数和每组数值必须大于 0。"
        }

        if (!exercise.units.zh || !exercise.units.en) {
            return "请填写中文单位和英文单位。"
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