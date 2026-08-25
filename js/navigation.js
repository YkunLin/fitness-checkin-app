const PAGE_TITLES = {
    today: {
        zh: "今日训练",
        en: "Today's Workout"
    },

    weekly: {
        zh: "每周训练计划",
        en: "Weekly Plan"
    },

    history: {
        zh: "训练记录",
        en: "Workout History"
    },

    settings: {
        zh: "训练设置",
        en: "Workout Settings"
    }
}

let currentPage = "settings"

function showPage(pageName) {
    document.querySelectorAll(".page").forEach((page) => {
        page.classList.toggle("active", page.dataset.page === pageName)
    })

    document.querySelectorAll(".nav-btn").forEach((button) => {
        button.classList.toggle("active", button.dataset.target === pageName)
    })

    currentPage = pageName

    updatePageTitle()
}

function updatePageTitle() {
    const title = document.getElementById("page-title")

    if (!title) {
        return
    }

    const language = document.documentElement.lang === "en" ? "en" : "zh"

    title.textContent = PAGE_TITLES[currentPage][language]
}

export function initializeNavigation() {
    const navButtons = document.querySelectorAll(".nav-btn")

    navButtons.forEach((button) => {
        button.addEventListener("click", () => {
            showPage(button.dataset.target)
        })
    })

    showPage(currentPage)
}

export function refreshNavigationLanguage() {
    updatePageTitle();
}