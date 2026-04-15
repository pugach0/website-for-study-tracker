//GRID CREATION
cols = 7
rows = 5
const grid = document.getElementById("grid")
grid.style.gridTemplateColumns = `repeat(${cols}, 70px)`
grid.style.gridTemplateRows = `repeat(${rows}, 70px)`


for (let i = 0; i < daysInCurrentMonth(); i++) {
    const cell = document.createElement("div")
    cell.classList.add("cell")
    cell.id = "day-" + (daysInCurrentMonth() -1 -i)
    cell.style.background =  "#f9fff7";
    grid.appendChild(cell)
}

function getColour(hours) {
    if (hours === null) return "#f9fff7"
    if (hours >= 5) return "#125c00"
    if (hours >= 4) return "#1e9400"
    if (hours >= 3) return "#2ee800"
    if (hours >= 2) return "#64ff3d"
    if (hours >= 0.95) return "#beffad"
    return "#f9fff7"
}

// new date(year, month, day)
function daysInCurrentMonth() {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() //day 0 = day before that
}

const now = new Date()

const log = document.getElementById('logInput')
log.addEventListener("change", function(e) {
    const file = e.target.files[0] //input
    const reader = new FileReader()

    reader.onload = function(e) {
        const text = e.target.result; //actual contents
        const lines = text.split("\n").filter(l => l.trim() !== "")
        
        for (let i = 0; i < now.getDate(); i++) {
            const date = new Date()
            date.setDate(date.getDate() - i)

            const day = String(date.getDate()).padStart(2, "0")
            const month = String(date.getMonth() + 1).padStart(2, "0")
            const year  = String(date.getFullYear()).slice(-2)
            const dateStr = `${day}.${month}.${year}`

            const entries = lines.filter(a => a.includes(dateStr) && a.includes("FINISH"))

            let hours = null
            if (entries.length > 0){
                hours = 0
                entries.forEach(entry => {
                    const words = entry.split(" ")
                    const timeStr = words[3]           // "01:30:00"
                    const [h, m] = timeStr.split(":")
                    hours += parseInt(h) + parseInt(m) / 60
                })
            }
            document.getElementById("day-" + (daysInCurrentMonth()-date.getDate())).style.background = getColour(hours)
        }
        
    }
    const todayCell = document.getElementById("day-" + (daysInCurrentMonth() - now.getDate()))
    todayCell.style.border = "1px solid red";
    reader.readAsText(file);
})