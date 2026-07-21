const $ = selector => document.querySelector(selector)
const dateInput = $('#workout-date')
const exerciseList = $('#exercise-list')
const exerciseTemplate = $('#exercise-template')
const historyList = $('#history-list')
const saveMessage = $('#save-message')
const planMessage = $('#plan-message')
const weeklyCalendar = $('#weekly-calendar')
const weekRangeEl = $('#week-range')
const planSourceEl = $('#plan-source')
const modal = $('#record-modal')

const APP_CONFIG = window.FITNESS_APP_CONFIG || { defaultExercises: [] }

function getConfiguredExercises() {
  return Array.isArray(APP_CONFIG.defaultExercises) ? APP_CONFIG.defaultExercises : []
}

function getExerciseDisplayName(exercise) {
  if (!exercise) return ''
  if (typeof exercise.name === 'string') return exercise.name
  return exercise.name?.[language] || exercise.name?.zh || exercise.name?.en || ''
}

const STORAGE_KEY = 'fitnessWorkoutRecords'
const PLAN_STORAGE_KEY = 'fitnessWeeklyPlansV2'
const OLD_PLAN_STORAGE_KEY = 'fitnessWeeklyPlans'
const LANGUAGE_KEY = 'fitnessLanguage'
let language = localStorage.getItem(LANGUAGE_KEY) || 'zh'
let visibleWeekStart = getMonday(new Date())

const i18n = {
  zh: {
    appTitle:'健身训练打卡', subtitle:'记录每一天的训练，坚持就是进步。', streak:'连续打卡', dayUnit:'天', workoutDate:'训练日期', weeklyPlan:'每周训练计划', previousWeek:'上一周', nextWeek:'下一周', thisWeek:'本周', saveWeeklyPlan:'保存本周计划', exercises:'训练动作', totalSets:'总组数', totalReps:'总次数', todayWorkout:'今日训练', addExercise:'＋ 添加动作', saveWorkout:'保存今日打卡', clearWorkout:'清空今日记录', recentRecords:'最近记录', removeExercise:'删除动作', sets:'组数', repsPerSet:'每组次数', workoutDetails:'训练详情', namePlaceholder:'动作名称，例如：俯卧撑', planPlaceholder:'例如：俯卧撑 4×10\n深蹲 5×15', noRecords:'还没有打卡记录，完成第一次训练吧！', openDetails:'点击查看详情', chooseDate:'请先选择训练日期。', needExercise:'请至少填写一个训练动作。', savedWorkout:'✓ 今日训练已经保存！', clearedWorkout:'今日记录已清空。', savedPlan:'✓ 本周训练计划已保存！以后未设置的周会默认继承此计划。', inheritedPlan:'正在使用最近一周的计划作为默认模板', customPlan:'这是本周单独保存的计划', noPlan:'尚无计划，可填写后保存为以后每周的默认安排', monday:'周一', tuesday:'周二', wednesday:'周三', thursday:'周四', friday:'周五', saturday:'周六', sunday:'周日', setsUnit:'组', repsUnit:'次', summaryText:(s,r)=>`共 ${s} 组 · ${r} 次`
  },
  en: {
    appTitle:'Workout Tracker', subtitle:'Track each workout. Consistency creates progress.', streak:'Streak', dayUnit:'days', workoutDate:'Workout date', weeklyPlan:'Weekly Workout Plan', previousWeek:'Previous week', nextWeek:'Next week', thisWeek:'This week', saveWeeklyPlan:'Save Weekly Plan', exercises:'Exercises', totalSets:'Total Sets', totalReps:'Total Reps', todayWorkout:"Today's Workout", addExercise:'＋ Add Exercise', saveWorkout:'Save Workout', clearWorkout:'Clear Today', recentRecords:'Recent Records', removeExercise:'Remove exercise', sets:'Sets', repsPerSet:'Reps per set', workoutDetails:'Workout Details', namePlaceholder:'Exercise name, e.g. Push-ups', planPlaceholder:'e.g. Push-ups 4×10\nSquats 5×15', noRecords:'No workout records yet. Complete your first workout!', openDetails:'Tap to view details', chooseDate:'Please select a workout date.', needExercise:'Please enter at least one exercise.', savedWorkout:'✓ Workout saved!', clearedWorkout:"Today's record has been cleared.", savedPlan:'✓ Weekly plan saved! Future unset weeks will inherit this plan.', inheritedPlan:'Using your most recently saved weekly plan as the default', customPlan:'This week has its own saved plan', noPlan:'No plan yet. Save one to use it as the default for future weeks.', monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat', sunday:'Sun', setsUnit:'sets', repsUnit:'reps', summaryText:(s,r)=>`${s} sets · ${r} reps total`
  }
}
const t = key => i18n[language][key]

function getLocalDateString(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}` }
function getMonday(date) { const d=new Date(date); d.setHours(0,0,0,0); const day=d.getDay()||7; d.setDate(d.getDate()-day+1); return d }
function addDays(date, days) { const d=new Date(date); d.setDate(d.getDate()+days); return d }
function readJSON(key) { try { return JSON.parse(localStorage.getItem(key)) || {} } catch { return {} } }
function getRecords() { return readJSON(STORAGE_KEY) }
function saveRecords(records) { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)) }
function getWeekKey(date) { return getLocalDateString(getMonday(date)) }

function getWeekPlans() {
  const plans = readJSON(PLAN_STORAGE_KEY)
  if (Object.keys(plans).length) return plans
  const old = readJSON(OLD_PLAN_STORAGE_KEY)
  if (!Object.keys(old).length) return {}
  const migrated = {}
  Object.entries(old).forEach(([date, text]) => {
    const weekKey = getWeekKey(new Date(`${date}T00:00:00`))
    if (!migrated[weekKey]) migrated[weekKey] = Array(7).fill('')
    const d = new Date(`${date}T00:00:00`)
    const index = (d.getDay() || 7) - 1
    migrated[weekKey][index] = text
  })
  localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(migrated))
  return migrated
}
function saveWeekPlans(plans) { localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plans)) }
function resolveWeekPlan(weekKey) {
  const plans = getWeekPlans()
  if (plans[weekKey]) return { values:plans[weekKey], inherited:false }
  const previousKeys = Object.keys(plans).filter(key => key < weekKey).sort().reverse()
  if (previousKeys.length) return { values:[...plans[previousKeys[0]]], inherited:true, source:previousKeys[0] }
  return { values:Array(7).fill(''), inherited:false }
}

function applyLanguage() {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  document.title = t('appTitle')
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n))
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)))
  $('#language-btn').textContent = language === 'zh' ? 'EN' : '中'
  document.querySelectorAll('.exercise-name').forEach(el => el.placeholder = t('namePlaceholder'))
  updateStreak(); renderHistory(); renderWeeklyPlan(); updateSummary()
}

function addExercise(name='', sets=0, reps=0) {
  const item=exerciseTemplate.content.firstElementChild.cloneNode(true)
  const nameInput=item.querySelector('.exercise-name'); nameInput.value=name; nameInput.placeholder=t('namePlaceholder')
  item.querySelector('.sets-input').value=sets; item.querySelector('.reps-input').value=reps
  item.addEventListener('input', updateSummary)
  item.querySelector('.remove-btn').addEventListener('click',()=>{ item.remove(); updateSummary() })
  exerciseList.appendChild(item); updateSummary()
}
function getCurrentExercises() { return [...document.querySelectorAll('.exercise-item')].map(item=>{ const name=item.querySelector('.exercise-name').value.trim(); const sets=Math.max(0,Number(item.querySelector('.sets-input').value)||0); const reps=Math.max(0,Number(item.querySelector('.reps-input').value)||0); return {name,sets,reps,total:sets*reps} }).filter(x=>x.name||x.sets||x.reps) }
function updateSummary() {
  const ex=getCurrentExercises(); let sets=0,reps=0
  document.querySelectorAll('.exercise-item').forEach(item=>{ const s=Number(item.querySelector('.sets-input').value)||0; const r=Number(item.querySelector('.reps-input').value)||0; item.querySelector('.item-total').textContent=Math.max(0,s)*Math.max(0,r) })
  ex.forEach(x=>{sets+=x.sets; reps+=x.total}); $('#exercise-count').textContent=ex.length; $('#total-sets').textContent=sets; $('#total-reps').textContent=reps
}
function loadDefaultExercises() {
  const defaults = getConfiguredExercises()
  if (!defaults.length) {
    addExercise(language === 'zh' ? '新动作' : 'New exercise', 0, 0)
    return
  }
  defaults.forEach(exercise => {
    addExercise(
      getExerciseDisplayName(exercise),
      Number(exercise.defaultSets) || 0,
      Number(exercise.defaultReps) || 0
    )
  })
}
function loadSelectedDate() {
  const record=getRecords()[dateInput.value]; exerciseList.innerHTML=''; saveMessage.textContent=''
  if(record?.exercises?.length) record.exercises.forEach(x=>addExercise(x.name,x.sets,x.reps)); else loadDefaultExercises()
  updateSummary()
}
function saveWorkout() {
  const exercises=getCurrentExercises().filter(x=>x.name)
  if(!dateInput.value) return saveMessage.textContent=t('chooseDate')
  if(!exercises.length) return saveMessage.textContent=t('needExercise')
  const records=getRecords(); records[dateInput.value]={date:dateInput.value,exercises,totalSets:exercises.reduce((s,x)=>s+x.sets,0),totalReps:exercises.reduce((s,x)=>s+x.total,0),savedAt:new Date().toISOString()}; saveRecords(records)
  saveMessage.textContent=t('savedWorkout'); renderHistory(); updateStreak()
}
function clearWorkout() { const records=getRecords(); delete records[dateInput.value]; saveRecords(records); loadSelectedDate(); renderHistory(); updateStreak(); saveMessage.textContent=t('clearedWorkout') }
function formatDate(dateString, options={month:'long',day:'numeric',weekday:'short'}) { return new Intl.DateTimeFormat(language==='zh'?'zh-CN':'en-US',options).format(new Date(`${dateString}T00:00:00`)) }
function escapeHTML(value='') { return value.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])) }
function renderHistory() {
  const records=Object.values(getRecords()).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7)
  if(!records.length) { historyList.innerHTML=`<div class="empty-state">${t('noRecords')}</div>`; return }
  historyList.innerHTML=records.map(record=>`<article class="history-item" tabindex="0" data-date="${record.date}"><div><div class="history-date">${formatDate(record.date)}</div><div>${record.exercises.map(x=>escapeHTML(x.name)).join(language==='zh'?'、':', ')}</div><div class="history-open">${t('openDetails')}</div></div><div class="history-details">${record.totalSets} ${t('setsUnit')} · ${record.totalReps} ${t('repsUnit')}</div></article>`).join('')
}
function updateStreak() { const dates=new Set(Object.values(getRecords()).filter(r=>r.totalSets>0||r.totalReps>0).map(r=>r.date)); let streak=0,cursor=new Date(); while(dates.has(getLocalDateString(cursor))){streak++;cursor.setDate(cursor.getDate()-1)} $('#streak-count').textContent=`${streak} ${t('dayUnit')}` }
function openRecord(date) {
  const record=getRecords()[date]; if(!record) return
  $('#modal-title').textContent=t('workoutDetails'); $('#modal-date').textContent=formatDate(date,{year:'numeric',month:'long',day:'numeric',weekday:'long'})
  $('#modal-exercises').innerHTML=record.exercises.map(x=>`<div class="modal-exercise"><div><strong>${escapeHTML(x.name)}</strong><span>${x.sets} ${t('setsUnit')} × ${x.reps} ${t('repsUnit')}</span></div><strong>${x.total} ${t('repsUnit')}</strong></div>`).join('')
  $('#modal-summary').textContent=t('summaryText')(record.totalSets,record.totalReps); modal.hidden=false; document.body.classList.add('modal-open')
}
function closeModal(){ modal.hidden=true; document.body.classList.remove('modal-open') }

function formatWeekRange(start) { const end=addDays(start,6); const locale=language==='zh'?'zh-CN':'en-US'; const opts={month:'short',day:'numeric'}; return `${new Intl.DateTimeFormat(locale,{year:'numeric',...opts}).format(start)} – ${new Intl.DateTimeFormat(locale,{year:'numeric',...opts}).format(end)}` }
function renderWeeklyPlan() {
  const weekKey=getWeekKey(visibleWeekStart), resolved=resolveWeekPlan(weekKey), today=getLocalDateString(), selected=dateInput.value
  const weekdays=['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
  weekRangeEl.textContent=formatWeekRange(visibleWeekStart)
  planSourceEl.textContent=resolved.inherited?t('inheritedPlan'):(getWeekPlans()[weekKey]?t('customPlan'):t('noPlan'))
  weeklyCalendar.innerHTML=''; planMessage.textContent=''
  for(let i=0;i<7;i++) { const date=addDays(visibleWeekStart,i), key=getLocalDateString(date), card=document.createElement('article'); card.className='week-day'; if(key===today)card.classList.add('today'); if(key===selected)card.classList.add('selected-day'); card.innerHTML=`<div class="week-day-header"><span class="weekday-name">${t(weekdays[i])}</span><span class="weekday-date">${date.getMonth()+1}/${date.getDate()}</span></div><textarea class="plan-input" data-index="${i}" placeholder="${t('planPlaceholder')}"></textarea>`; card.querySelector('textarea').value=resolved.values[i]||''; weeklyCalendar.appendChild(card) }
}
function saveWeeklyPlan() { const plans=getWeekPlans(), key=getWeekKey(visibleWeekStart); plans[key]=[...weeklyCalendar.querySelectorAll('.plan-input')].map(x=>x.value.trim()); saveWeekPlans(plans); planMessage.textContent=t('savedPlan'); planSourceEl.textContent=t('customPlan') }

$('#add-exercise-btn').addEventListener('click',()=>addExercise())
$('#save-btn').addEventListener('click',saveWorkout); $('#clear-btn').addEventListener('click',clearWorkout)
dateInput.addEventListener('change',()=>{loadSelectedDate();renderWeeklyPlan()})
$('#prev-week-btn').addEventListener('click',()=>{visibleWeekStart=addDays(visibleWeekStart,-7);renderWeeklyPlan()})
$('#next-week-btn').addEventListener('click',()=>{visibleWeekStart=addDays(visibleWeekStart,7);renderWeeklyPlan()})
$('#current-week-btn').addEventListener('click',()=>{visibleWeekStart=getMonday(new Date());renderWeeklyPlan()})
$('#save-plan-btn').addEventListener('click',saveWeeklyPlan)
$('#language-btn').addEventListener('click',()=>{language=language==='zh'?'en':'zh';localStorage.setItem(LANGUAGE_KEY,language);applyLanguage()})
historyList.addEventListener('click',e=>{const item=e.target.closest('.history-item');if(item)openRecord(item.dataset.date)})
historyList.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.history-item'))openRecord(e.target.dataset.date)})
modal.addEventListener('click',e=>{if(e.target.hasAttribute('data-close-modal'))closeModal()})
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeModal()})

dateInput.value=getLocalDateString(); loadSelectedDate(); applyLanguage()
