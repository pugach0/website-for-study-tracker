//GRID CREATION
cols = 7
rows = 5
const grid = document.getElementById("grid")
const tooltip = document.getElementById("tooltip")
grid.style.gridTemplateColumns = `repeat(${cols}, 70px)`
grid.style.gridTemplateRows = `repeat(${rows}, 70px)`

const days = daysInCurrentMonth();
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
        tooltip.innerText = cell.dataset.info ?? "No data"
        tooltip.style.display = "block"
    })
    cell.addEventListener("mousemove", (e) => {
        tooltip.style.left = e.clientX + 12 + "px"
        tooltip.style.top  = e.clientY + 12 + "px"
    })
    cell.addEventListener("mouseleave", () => {
        tooltip.style.display = "none"
    })
}

function getColour(hours) {
    if (hours === null) return "#f9fff7"
    if (hours >= 3) return "#00441b"
    if (hours >= 2) return "#006d2c"
    if (hours >= 1.5) return "#238b45"
    if (hours >= 1) return "#41ab5d"
    if (hours >= 0.25) return "#74c476"
    return "#f9fff7"
}

// new date(year, month, day)
function daysInCurrentMonth() {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() 
}

function convertHours(totalHours){
    const hours = Math.floor(totalHours)
    const minutes = Math.round((totalHours-hours)*60)
    return `${hours}:${String(minutes).padStart(2, "0")}`
}

const now = new Date()

const log = document.getElementById('logInput')

log.addEventListener("change", function(e) {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
        const lines = e.target.result.split("\n")
        console.log(lines[lines.length-2])        
        console.log(lines[lines.length-2].split(" "))  
        localStorage.setItem("log", e.target.result)
        process()
    }
    reader.readAsText(file)
})

function process(){
    if(localStorage.getItem("log") !== null){
    const text = localStorage.getItem("log");
    const lines = text.split("\n").filter(l => l.trim() !== "")

    for (let i = 0; i < now.getDate(); i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        const day = String(date.getDate()).padStart(2, "0")
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const year  = String(date.getFullYear()).slice(-2)
        const dateStr = `${day}.${month}.${year}`

        const finishes = lines.filter(a => a.includes(dateStr) && a.includes("FINISH"))
        let activities = null
        if (finishes.length>0){
            activities = []
            finishes.forEach(entry => {
                const words = entry.split(" ")
                if (!activities.includes(words[4])){
                    activities.push(words[4])
                }
            })
        }
        
        
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
                const currentTimeStr = convertHours(currentHours)
                activityHours.push(`${activities[j]} ${currentTimeStr}`)
            }
            document.getElementById("day-" + (days - date.getDate())).dataset.info = activityHours.length > 0 ? activityHours.join("\n") : null

        }
        
        
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
        document.getElementById("day-" + (days-date.getDate())).style.background = getColour(hours)
        document.getElementById("day-" + (days - date.getDate()) + "t").textContent = timeStr
    }
    const todayCell = document.getElementById("day-" + (days - now.getDate()))
    todayCell.style.border = "1px solid red";
}
}
window.addEventListener("load", function(e) {
    process()
})

//title

title = document.getElementById("title")

title.textContent = new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' });

