// Launch the entire app
import { getExercise } from "./storage.js"

function initializeApp(){
    const exercises = getExercise()

    console.log("Workout Tracker started")
    console.log("Default exercises:", exercises)
}

initializeApp()