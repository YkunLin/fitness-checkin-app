// Launch the entire app
import { initializeSettings, preserveSettingsForm, refreshSettingsLanguage } from "./settings.js"
import { toggleLanguage, updatePageLanguage } from "./language.js"

function initializeApp(){
    initializeSettings()
    updatePageLanguage()

    const languageButton = document.getElementById("language-btn")

    languageButton.addEventListener("click", () => {
        preserveSettingsForm()
        toggleLanguage()
        refreshSettingsLanguage()
        updatePageLanguage()
    })

    console.log("Workout Tracker started")
}

initializeApp()