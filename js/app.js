// Launch the entire app
import { initializeSettings } from "./settings.js"

function initializeApp(){
    initializeSettings()

    console.log("Workout Tracker started")
}

initializeApp()