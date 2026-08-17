// Switch between Chinese and English
import {
    getLanguage,
    saveLanguage
} from "./storage.js";


let currentLanguage = getLanguage()


const translations = {
    zh: {
        pageTitle: "训练设置",
        defaultExercises: "默认训练动作",
        description: "这些动作会显示在新的训练记录中。",

        addExercise: "+ 添加动作",
        saveSettings: "保存设置",
        resetSettings: "恢复默认",

        exercise: "动作",
        exerciseName: "动作名称",
        sets: "组数",
        valuePerSet: "每组次数",
        trackingType: "记录类型",
        reps: "次数",
        duration: "时长",
        unit: "单位",
        delete: "删除",

        exercisePlaceholder: "例如：俯卧撑",
        unitPlaceholder: "次"
    },

    en: {
        pageTitle: "Workout Settings",
        defaultExercises: "Default Exercises",
        description: "These exercises will appear in new workout records.",

        addExercise: "+ Add Exercise",
        saveSettings: "Save Settings",
        resetSettings: "Reset to Default",

        exercise: "Exercise",
        exerciseName: "Exercise Name",
        sets: "Sets",
        valuePerSet: "Reps per Set",
        trackingType: "Tracking Type",
        reps: "Reps",
        duration: "Duration",
        unit: "Unit",
        delete: "Delete",

        exercisePlaceholder: "e.g. Push-ups",
        unitPlaceholder: "reps"
    }
}


export function getCurrentLanguage() {
    return currentLanguage
}


export function t(key) {
    return translations[currentLanguage][key] || key
}


export function toggleLanguage() {
    currentLanguage =
        currentLanguage === "zh"
            ? "en"
            : "zh"

    saveLanguage(currentLanguage);

    return currentLanguage;
}

export function updatePageLanguage() {
    document.documentElement.lang =
        currentLanguage === "zh"
            ? "zh-CN"
            : "en"

    document
        .querySelectorAll("[data-i18n]")
        .forEach((element) => {

            const key = element.dataset.i18n

            element.textContent = t(key)
        })

    document
        .querySelectorAll("[data-i18n-placeholder]")
        .forEach((element) => {

            const key = element.dataset.i18nPlaceholder;

            element.placeholder = t(key);
        })

    const languageButton =
        document.getElementById("language-btn")

    if (languageButton) {
        languageButton.textContent =
            currentLanguage === "zh"
                ? "EN"
                : "中"
    }
}