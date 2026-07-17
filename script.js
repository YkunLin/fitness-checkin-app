const dateInput = document.getElementById('workout-date')
const exerciseList = document.getElementById('exercise-list')
const exerciseTemplate = document.getElementById('exercise-template')
const addExerciseBtn = document.getElementById('add-exercise-btn')
const saveBtn = document.getElementById('save-btn')
const clearBtn = document.getElementById('clear-btn')
const saveMessage = document.getElementById('save-message')
const historyList = document.getElementById('history-list')

const exerciseCountEl = document.getElementById('exercise-count')
const totalSetsEl = document.getElementById('total-sets')
const totalRepsEl = document.getElementById('total-reps')
const streakCountEl = document.getElementById('streak-count')

const STORAGE_KEY = 'fitnessWorkoutRecords'

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function addExercise(name = '', sets = 0, reps = 0) {
  const item = exerciseTemplate.content.firstElementChild.cloneNode(true)
  const nameInput = item.querySelector('.exercise-name')
  const setsInput = item.querySelector('.sets-input')
  const repsInput = item.querySelector('.reps-input')
  const removeBtn = item.querySelector('.remove-btn')

  nameInput.value = name
  setsInput.value = sets
  repsInput.value = reps

  item.addEventListener('input', updateSummary)
  removeBtn.addEventListener('click', () => {
    item.remove()
    updateSummary()
  })

  exerciseList.appendChild(item)
  updateSummary()
}

function getCurrentExercises() {
  return [...document.querySelectorAll('.exercise-item')]
    .map(item => {
      const name = item.querySelector('.exercise-name').value.trim()
      const sets = Math.max(0, Number(item.querySelector('.sets-input').value) || 0)
      const reps = Math.max(0, Number(item.querySelector('.reps-input').value) || 0)

      return {
        name,
        sets,
        reps,
        total: sets * reps
      }
    })
    .filter(exercise => exercise.name || exercise.sets || exercise.reps)
}

function updateSummary() {
  const exercises = getCurrentExercises()
  let totalSets = 0
  let totalReps = 0

  document.querySelectorAll('.exercise-item').forEach(item => {
    const sets = Math.max(0, Number(item.querySelector('.sets-input').value) || 0)
    const reps = Math.max(0, Number(item.querySelector('.reps-input').value) || 0)
    item.querySelector('.item-total').textContent = sets * reps
  })

  exercises.forEach(exercise => {
    totalSets += exercise.sets
    totalReps += exercise.total
  })

  exerciseCountEl.textContent = exercises.length
  totalSetsEl.textContent = totalSets
  totalRepsEl.textContent = totalReps
}

function loadSelectedDate() {
  const records = getRecords()
  const selectedRecord = records[dateInput.value]

  exerciseList.innerHTML = ''
  saveMessage.textContent = ''

  if (selectedRecord?.exercises?.length) {
    selectedRecord.exercises.forEach(exercise => {
      addExercise(exercise.name, exercise.sets, exercise.reps)
    })
  } else {
    addExercise('俯卧撑', 0, 10)
    addExercise('深蹲', 0, 15)
    addExercise('卷腹', 0, 20)
    addExercise('平板支撑', 0, 0)
  }

  updateSummary()
}

function saveWorkout() {
  const exercises = getCurrentExercises().filter(exercise => exercise.name)

  if (!dateInput.value) {
    saveMessage.textContent = '请先选择训练日期。'
    return
  }

  if (exercises.length === 0) {
    saveMessage.textContent = '请至少填写一个训练动作。'
    return
  }

  const records = getRecords()
  records[dateInput.value] = {
    date: dateInput.value,
    exercises,
    totalSets: exercises.reduce((sum, item) => sum + item.sets, 0),
    totalReps: exercises.reduce((sum, item) => sum + item.total, 0),
    savedAt: new Date().toISOString()
  }

  saveRecords(records)
  saveMessage.textContent = '✓ 今日训练已经保存！'
  renderHistory()
  updateStreak()
}

function clearWorkout() {
  const records = getRecords()
  delete records[dateInput.value]
  saveRecords(records)
  loadSelectedDate()
  renderHistory()
  updateStreak()
  saveMessage.textContent = '今日记录已清空。'
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`)
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }).format(date)
}

function renderHistory() {
  const records = Object.values(getRecords())
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7)

  if (records.length === 0) {
    historyList.innerHTML = '<div class="empty-state">还没有打卡记录，完成第一次训练吧！</div>'
    return
  }

  historyList.innerHTML = records.map(record => {
    const names = record.exercises.map(item => item.name).join('、')

    return `
      <article class="history-item">
        <div>
          <div class="history-date">${formatDate(record.date)}</div>
          <div>${names}</div>
        </div>
        <div class="history-details">
          ${record.totalSets} 组 · ${record.totalReps} 次
        </div>
      </article>
    `
  }).join('')
}

function updateStreak() {
  const records = getRecords()
  const completedDates = new Set(
    Object.values(records)
      .filter(record => record.totalSets > 0 || record.totalReps > 0)
      .map(record => record.date)
  )

  let streak = 0
  const cursor = new Date()

  while (completedDates.has(getLocalDateString(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  streakCountEl.textContent = `${streak} 天`
}

addExerciseBtn.addEventListener('click', () => addExercise())
saveBtn.addEventListener('click', saveWorkout)
clearBtn.addEventListener('click', clearWorkout)
dateInput.addEventListener('change', loadSelectedDate)

dateInput.value = getLocalDateString()
loadSelectedDate()
renderHistory()
updateStreak()
