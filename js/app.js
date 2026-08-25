// Launch the entire app
import { initializeSettings, preserveSettingsForm, refreshSettingsLanguage } from "./settings.js"
import { toggleLanguage, updatePageLanguage } from "./language.js"
import { initializeNavigation, refreshNavigationLanguage } from "./navigation.js"

function initializeApp(){
    initializeSettings()
    initializeNavigation()
    updatePageLanguage()

    const languageButton = document.getElementById("language-btn")

    languageButton.addEventListener("click", () => {
        preserveSettingsForm()
        toggleLanguage()
        refreshSettingsLanguage()
        updatePageLanguage()
        refreshNavigationLanguage()
    })

    console.log("Workout Tracker started")
}

initializeApp()