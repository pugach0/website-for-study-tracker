cols = 7
rows = 5
const grid = document.getElementById("grid")
const tooltip = document.getElementById("tooltip")
grid.style.gridTemplateColumns = `repeat(${cols}, 70px)`
grid.style.gridTemplateRows = `repeat(${rows}, 70px)`
const events = document.getElementById("events")
const statsButton = document.getElementById("statsButton")
const days = daysInCurrentMonth();
const now = new Date()
const log = document.getElementById('logInput')
const stats = document.getElementById('stats')
const activitiesGraph = document.getElementById('activities')

//grid creation
function createGrid(currentDays = days){
    for (let i = 0; i < currentDays; i++) {
        /* the cell and time inside*/
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.id = "day-" + (currentDays - 1 - i);
        cell.style.background = "#f9fff7";
        const time = document.createElement("span");
        time.id = "day-" + (currentDays - 1 - i) + "t";
        cell.appendChild(time);
        grid.appendChild(cell);
        cell.addEventListener("mouseover", (e) => {
            tooltip.innerText = cell.dataset.time ? cell.dataset.time : "nothing useful"
            tooltip.style.display = "block"
            events.textContent = cell.dataset.events ?? " "
        })
        cell.addEventListener("mousemove", (e) => {
            tooltip.style.left = e.clientX + 12 + "px"
            tooltip.style.top  = e.clientY + 12 + "px"
        })
        cell.addEventListener("mouseleave", () => {
            tooltip.style.display = "none"
            events.textContent = " "
        })
    }
}
//graph update
activities = document.getElementById('activities')
function updateGraph(ActivityTime){
    activities.replaceChildren()
    const entries = Object.entries(ActivityTime ?? {})
    if (entries.length === 0) {
        document.getElementById('statsTitle').textContent = "Total"
        return
    }

    const sorted = entries.sort((a, b) => b[1] - a[1])
    const mostTime = sorted[0]?.[1] ?? 0
    let totalHoursCounted = 0

    sorted.forEach(([key, value]) =>{
        const activityBox = document.createElement('div')
        activityBox.classList.add('activityBox')
        const activityName = document.createElement('h1')
        switch (key) {
            case "CS":
                activityName.textContent = "Computer Studies"
            break;
            case "P":
                activityName.textContent = "Piano"
            break;
            case "M":
                activityName.textContent = "Math"
            break;
            case "NMT-UH":
                activityName.textContent = "Ukrainian History"
            break;
            case "NMT-UL":
                activityName.textContent = "Ukrainian Language"
            break;
            default:
                activityName.textContent = key
            break;
        }
        activityName.classList.add('activityName')
        const graphBar = document.createElement('div')
        graphBar.classList.add('graphBar')
        graphBar.style.width = mostTime > 0 ? ((value/mostTime)*100)+"%" : "0%"
        const totalHours = document.createElement('p')
        totalHours.textContent = convertHours(value)
        totalHoursCounted += parseFloat(value) || 0
        totalHours.classList.add('activityHours')
        graphBar.appendChild(totalHours)
        activityBox.appendChild(activityName)
        activityBox.appendChild(graphBar)
        activities.appendChild(activityBox)
    })
    document.getElementById('totalHoursCounted').textContent = "Total hours: " + convertHours(totalHoursCounted)
}



//title creation
title = document.getElementById("title")
title.textContent = new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' });

//definitions of functions
function getColour(hours) {
    if (hours === null) return "#f9fff7"
    if (hours >= 4) return "#002b11"
    if (hours >= 3) return "#00441b"
    if (hours >= 2) return "#006d2c"
    if (hours >= 1.5) return "#238b45"
    if (hours >= 1) return "#41ab5d"
    if (hours >= 0.25) return "#74c476"
    return "#f9fff7"
}

function daysInCurrentMonth(month = new Date().getMonth(), year = new Date().getFullYear()) {
    return new Date(year, month + 1, 0).getDate()
}

function convertHours(totalHours){
    const hours = Math.floor(totalHours)
    const minutes = Math.round((totalHours-hours)*60)
    return `${hours}:${String(minutes).padStart(2, "0")}`
}


function process(monthBackward = 0) {
    if (localStorage.getItem("log") !== null) {
        const text = localStorage.getItem("log");
        const lines = text.split("\n").filter(l => l.trim() !== "")

        const targetMonth = now.getMonth() - monthBackward
        const targetYear = now.getFullYear()
        const lastDay = monthBackward === 0 ? now.getDate() : daysInCurrentMonth(targetMonth, targetYear)

        for (let d = 1; d <= lastDay; d++) {
            const date = new Date(targetYear, targetMonth, d)
            const day = String(date.getDate()).padStart(2, "0")
            const month = String(date.getMonth() + 1).padStart(2, "0")
            const year = String(date.getFullYear()).slice(-2)
            const dateStr = `${day}.${month}.${year}`

            const currentDays = daysInCurrentMonth(targetMonth, targetYear)
            const cellId = "day-" + (currentDays - d)
            const currentCell = document.getElementById(cellId)
            if (!currentCell) continue

            const finishes = lines.filter(a => a.includes(dateStr) && a.includes("FINISH"))

            if (finishes.length > 0) {
                const activities = []
                finishes.forEach(entry => {
                    const words = entry.split(" ")
                    if (!activities.includes(words[4])) activities.push(words[4])
                })

                let activityHours = []
                for (let j = 0; j < activities.length; j++) {
                    const activityLines = finishes.filter(a => a.includes(activities[j]))
                    let currentHours = 0
                    activityLines.forEach(entry => {
                        const words = entry.split(" ")
                        const [h, m] = words[3].split(":")
                        currentHours += parseInt(h) + parseInt(m) / 60
                    })
                    activityHours.push(`${activities[j]} ${convertHours(currentHours)}`)
                }
                if (activityHours.length > 0) currentCell.dataset.time = activityHours.join("\n")

                let hours = 0
                finishes.forEach(entry => {
                    const words = entry.split(" ")
                    const [h, m] = words[3].split(":")
                    hours += parseInt(h) + parseInt(m) / 60
                })
                currentCell.style.background = getColour(hours)
                document.getElementById(cellId + "t").textContent = convertHours(hours) === "0:00" ? "" : convertHours(hours)
            }

            // Events
            const eventLines = lines.filter(a => a.includes("EVENT") && a.includes(dateStr))
            if (eventLines.length > 0) {
                const events = eventLines.map(entry => entry.split(" ")[3].replace(/_/g, " "))
                currentCell.style.boxShadow = "inset 0 0 0 5px yellow"
                currentCell.dataset.events = events.join("\n")
            }
        }

        if (monthBackward === 0) {
            const todayCell = document.getElementById("day-" + (days - now.getDate()))
            if (todayCell) todayCell.style.boxShadow = "inset 0 0 0 2px red"
        }
        updateGraph(totalActivityTime)
    }
}

//graph data processing
const weekActivityTime = {}
const monthActivityTime ={}
const yearActivityTime ={}
const totalActivityTime = {}
function processForGraphTotal(){
    if(localStorage.getItem("log") !== null){
        const text = localStorage.getItem("log");
        const lines = text.split("\n").filter(l => l.trim() !== "")
        Object.keys(totalActivityTime).forEach(key => delete totalActivityTime[key]);

        const MAX_DAYS = 2000
        for (let i = 0; i < MAX_DAYS; i++) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const day = String(date.getDate()).padStart(2, "0")
            const month = String(date.getMonth() + 1).padStart(2, "0")
            const year  = String(date.getFullYear()).slice(-2)
            const dateStr = `${day}.${month}.${year}`

            const finishes = lines.filter(a => a.includes(dateStr) && a.includes("FINISH"))
            if (finishes.length === 0) continue

            // Collect unique activities for this day
            const activities = []
            finishes.forEach(entry => {
                const words = entry.split(" ")
                if (!activities.includes(words[4])) activities.push(words[4])
            })

            // Sum hours per activity 
            let activityHours = []
            for (let j = 0; j < activities.length; j++){
                const activityLines = finishes.filter(a => a.includes(activities[j]))
                let currentHours = 0
                activityLines.forEach(entry => {
                    const words = entry.split(" ")
                    const [h, m] = words[3].split(":")
                    currentHours += parseInt(h) + parseInt(m) / 60
                })
                totalActivityTime[activities[j]] = (totalActivityTime[activities[j]] ?? 0) + currentHours  // always
            }
        }
    }
}

function processForGraphYear(){
    if(localStorage.getItem("log") !== null){
        const text = localStorage.getItem("log");
        const lines = text.split("\n").filter(l => l.trim() !== "")
        Object.keys(yearActivityTime).forEach(key => delete yearActivityTime[key]);

        const MAX_DAYS = 365
        for (let i = 0; i < MAX_DAYS; i++) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const day = String(date.getDate()).padStart(2, "0")
            const month = String(date.getMonth() + 1).padStart(2, "0")
            const year  = String(date.getFullYear()).slice(-2)
            const dateStr = `${day}.${month}.${year}`

            const finishes = lines.filter(a => a.includes(dateStr) && a.includes("FINISH"))
            if (finishes.length === 0) continue

            // Collect unique activities for this day
            const activities = []
            finishes.forEach(entry => {
                const words = entry.split(" ")
                if (!activities.includes(words[4])) activities.push(words[4])
            })

            // Sum hours per activity 
            let activityHours = []
            for (let j = 0; j < activities.length; j++){
                const activityLines = finishes.filter(a => a.includes(activities[j]))
                let currentHours = 0
                activityLines.forEach(entry => {
                    const words = entry.split(" ")
                    const [h, m] = words[3].split(":")
                    currentHours += parseInt(h) + parseInt(m) / 60
                })
                yearActivityTime[activities[j]]  = (yearActivityTime[activities[j]]  ?? 0) + currentHours
            }
        }
    }
}

function processForGraphMonth(){
    if(localStorage.getItem("log") !== null){
        const text = localStorage.getItem("log");
        const lines = text.split("\n").filter(l => l.trim() !== "")
        Object.keys(monthActivityTime).forEach(key => delete monthActivityTime[key]);

        const MAX_DAYS = daysInCurrentMonth()
        for (let i = 0; i < MAX_DAYS; i++) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const day = String(date.getDate()).padStart(2, "0")
            const month = String(date.getMonth() + 1).padStart(2, "0")
            const year  = String(date.getFullYear()).slice(-2)
            const dateStr = `${day}.${month}.${year}`

            const finishes = lines.filter(a => a.includes(dateStr) && a.includes("FINISH"))
            if (finishes.length === 0) continue

            // Collect unique activities for this day
            const activities = []
            finishes.forEach(entry => {
                const words = entry.split(" ")
                if (!activities.includes(words[4])) activities.push(words[4])
            })

            // Sum hours per activity 
            let activityHours = []
            for (let j = 0; j < activities.length; j++){
                const activityLines = finishes.filter(a => a.includes(activities[j]))
                let currentHours = 0
                activityLines.forEach(entry => {
                    const words = entry.split(" ")
                    const [h, m] = words[3].split(":")
                    currentHours += parseInt(h) + parseInt(m) / 60
                })
                monthActivityTime[activities[j]]  = (monthActivityTime[activities[j]]  ?? 0) + currentHours
            }
        }
    }
}

function processForGraphWeek(){
    if(localStorage.getItem("log") !== null){
        const text = localStorage.getItem("log");
        const lines = text.split("\n").filter(l => l.trim() !== "")
        Object.keys(weekActivityTime).forEach(key => delete weekActivityTime[key]);

        const MAX_DAYS = 7
        for (let i = 0; i < MAX_DAYS; i++) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const day = String(date.getDate()).padStart(2, "0")
            const month = String(date.getMonth() + 1).padStart(2, "0")
            const year  = String(date.getFullYear()).slice(-2)
            const dateStr = `${day}.${month}.${year}`

            const finishes = lines.filter(a => a.includes(dateStr) && a.includes("FINISH"))
            if (finishes.length === 0) continue

            // Collect unique activities for this day
            const activities = []
            finishes.forEach(entry => {
                const words = entry.split(" ")
                if (!activities.includes(words[4])) activities.push(words[4])
            })

            // Sum hours per activity 
            let activityHours = []
            for (let j = 0; j < activities.length; j++){
                const activityLines = finishes.filter(a => a.includes(activities[j]))
                let currentHours = 0
                activityLines.forEach(entry => {
                    const words = entry.split(" ")
                    const [h, m] = words[3].split(":")
                    currentHours += parseInt(h) + parseInt(m) / 60
                })
                weekActivityTime[activities[j]]  = (weekActivityTime[activities[j]]  ?? 0) + currentHours
            }
        }
    }
}

//event listeners
window.addEventListener("load", function(e) {
    grid.replaceChildren() 
    createGrid(daysInCurrentMonth(now.getMonth()))
    process()
})

log.addEventListener("change", function(e) {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
        const lines = e.target.result.split("\n")
        console.log(lines[lines.length-1])        
        console.log(lines[lines.length-1].split(" "))
        localStorage.setItem("log", e.target.result)
        process()
    }
    reader.readAsText(file)
})

statsButton.addEventListener("click", () => {
    stats.classList.toggle('hidden')
    processForGraphTotal()
    updateGraph(totalActivityTime)
})

//tabs
const yearSwitch = document.getElementById('tabYearSwitch')
const totalSwitch = document.getElementById('tabTotalSwitch')
const monthSwitch = document.getElementById('tabMonthSwitch')
const weekSwitch = document.getElementById('tabWeekSwitch')
const statsTitle = document.getElementById('statsTitle')

yearSwitch.addEventListener("click", () => {
    statsTitle.textContent = "Year"
    processForGraphYear()
    updateGraph(yearActivityTime)
})
totalSwitch.addEventListener("click", () => {
    statsTitle.textContent = "Total"
    processForGraphTotal()
    updateGraph(totalActivityTime)
})
monthSwitch.addEventListener("click", () => {
    statsTitle.textContent = "Month"
    processForGraphMonth()
    updateGraph(monthActivityTime)
})
weekSwitch.addEventListener("click", () => {
    statsTitle.textContent = "Week"
    processForGraphWeek()
    updateGraph(weekActivityTime)
})

//month tabs
monthPos =0
const monthCycleBackward = document.getElementById('monthCycleBackward')
const monthCycleForward = document.getElementById('monthCycleForward')
monthCycleBackward.addEventListener("click", () => {
    monthPos++
    title.textContent = new Date(now.getFullYear(), now.getMonth() - monthPos).toLocaleDateString('en', { month: 'long', year: 'numeric' })
    grid.replaceChildren() 
    createGrid(daysInCurrentMonth(now.getMonth() - monthPos))
    process(monthPos)
})
monthCycleForward.addEventListener("click", () => {
    monthPos--
    title.textContent = new Date(now.getFullYear(), now.getMonth() - monthPos).toLocaleDateString('en', { month: 'long', year: 'numeric' })
    grid.replaceChildren() 
    createGrid(daysInCurrentMonth(now.getMonth() - monthPos))
    process(monthPos)
})