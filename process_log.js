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
for (let i = 0; i < days; i++) {
    /* the cell and time inside*/
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.id = "day-" + (days - 1 - i);
    cell.style.background = "#f9fff7";
    const time = document.createElement("span");
    time.id = "day-" + (days - 1 - i) + "t";
    cell.appendChild(time);
    grid.appendChild(cell);
    cell.addEventListener("mouseover", (e) => {
        tooltip.innerText = cell.dataset.time ?? "nothing useful"
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

//graph update
activities = document.getElementById('activities')
function updateGraph(){
    activities.replaceChildren()
    const sorted = Object.entries(totalActivityTime).sort((a, b) => b[1] - a[1])
    mostTime = sorted[0][1]
    sorted.forEach(([key, value]) =>{
        console.log("created shit bro")
        const activityBox = document.createElement('div')
        activityBox.classList.add('activityBox')
        const activityName = document.createElement('h1')
        activityName.textContent = key
        activityName.classList.add('activityName')
        const graphBar = document.createElement('div')
        graphBar.classList.add('graphBar')
        graphBar.style.width = ((value/mostTime)*100-20)+"%"
        activityBox.appendChild(activityName)
        activityBox.appendChild(graphBar)
        activities.appendChild(activityBox)
    })
}

//title creation
title = document.getElementById("title")
title.textContent = new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' });

//definitions of functions
function getColour(hours) {
    if (hours === null) return "#f9fff7"
    if (hours >= 3) return "#00441b"
    if (hours >= 2) return "#006d2c"
    if (hours >= 1.5) return "#238b45"
    if (hours >= 1) return "#41ab5d"
    if (hours >= 0.25) return "#74c476"
    return "#f9fff7"
}

function daysInCurrentMonth() {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() 
}

function convertHours(totalHours){
    const hours = Math.floor(totalHours)
    const minutes = Math.round((totalHours-hours)*60)
    return `${hours}:${String(minutes).padStart(2, "0")}`
}

const totalActivityTime = {}
function process(){
    if(localStorage.getItem("log") !== null){
    const text = localStorage.getItem("log");
    const lines = text.split("\n").filter(l => l.trim() !== "")
    Object.keys(totalActivityTime).forEach(key => delete totalActivityTime[key]);

    for (let i = 0; i < now.getDate(); i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        currentCell = document.getElementById("day-" + (days - date.getDate()))
        const day = String(date.getDate()).padStart(2, "0")
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const year  = String(date.getFullYear()).slice(-2)
        const dateStr = `${day}.${month}.${year}`

        //ACTIVITIES: creating the array with all activities
        const finishes = lines.filter(a => a.includes(dateStr) && a.includes("FINISH"))
        let activities = null
        if (finishes.length>0){
            activities = []
            finishes.forEach(entry => {
                const words = entry.split(" ")
                if (!activities.includes(words[4])){
                    activities.push(words[4].trim())
                }
            })
        }

        //Creating an array with all activities for the day and the array that contains data in the form [ACTIVITY H:M:S] where H:M:S is the total time of that activity
        //Also adds up the total time for each activity
        let activityHours = []
        if (activities !== null){
            for (let j = 0; j<activities.length; j++){
                const activityLines = finishes.filter(a => a.includes(activities[j]))
                let currentHours = 0
                activityLines.forEach(entry => {
                    const words = entry.split(" ")
                    const timeStr = words[3]
                    const [h, m] = timeStr.split(":")
                    currentHours += parseInt(h) + parseInt(m) / 60
                })
                totalActivityTime[activities[j]] = (totalActivityTime[activities[j]] ?? 0) + currentHours //adding up hours for each activity throughout all days
                const currentTimeStr = convertHours(currentHours)
                activityHours.push(`${activities[j]} ${currentTimeStr}`)
            }
            currentCell.dataset.time = activityHours.length > 0 ? activityHours.join("\n") : null //adding data to the dataset
        }
        
        //Getting all the EVENT lines and putting the contexts of the events in the array
        const eventLines = lines.filter(a => a.includes("EVENT") && a.includes(dateStr))
        let events = []
        if (eventLines.length > 0 ){
            eventLines.forEach(entry =>{
                const words = entry.split(" ")
                events.push(words[3].replace(/_/g, " "))
            })
            currentCell.style.boxShadow = "inset 0 0 0 5px yellow";
            currentCell.dataset.events = events.length > 0 ? events.join("\n") : null //Dataset
        }

        //Calculating the total time and assigning colors to the cells
        let timeStr = null
        let hours = null
        if (finishes.length > 0){
            hours = 0
            finishes.forEach(entry => {
                const words = entry.split(" ")
                const t = words[3]           
                const [h, m] = t.split(":")
                hours += parseInt(h) + parseInt(m) / 60
            })
        timeStr = convertHours(hours)
        }
        currentCell.style.background = getColour(hours)
        document.getElementById("day-" + (days - date.getDate()) + "t").textContent = timeStr
    }
    const todayCell = document.getElementById("day-" + (days - now.getDate()))
    todayCell.style.boxShadow = "inset 0 0 0 2px red";
    updateGraph()
}
}

//event listeners
window.addEventListener("load", function(e) {
    process()
})

log.addEventListener("change", function(e) {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
        const lines = e.target.result.split("\n")
        /*console.log(lines[lines.length-2])        
        console.log(lines[lines.length-2].split(" "))  */
        localStorage.setItem("log", e.target.result)
        process()
    }
    reader.readAsText(file)
})

statsButton.addEventListener("click", () => {
    stats.classList.toggle('hidden')
})

