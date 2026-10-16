// Launch the entire app
import { initializeSettings, preserveSettingsForm, refreshSettingsLanguage } from "./settings.js"
import { toggleLanguage, updatePageLanguage } from "./language.js"
import { initializeNavigation, refreshNavigationLanguage } from "./navigation.js"
import { initializeWeeklyPlan, refreshWeeklyPlanLanguage } from "./weekly-plan.js"
import { initializeToday, refreshTodayLanguage } from "./today.js"

function initializeApp(){
    initializeSettings()
    initializeNavigation()
    initializeToday();
    initializeWeeklyPlan()
    
    updatePageLanguage()

    const languageButton = document.getElementById("language-btn")

    languageButton.addEventListener("click", () => {
        preserveSettingsForm()
        toggleLanguage()

        refreshSettingsLanguage()
        refreshTodayLanguage();
        refreshWeeklyPlanLanguage()

        updatePageLanguage()
        refreshNavigationLanguage()
    })

    console.log("Workout Tracker started")
}

initializeApp()