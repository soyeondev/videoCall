const socket = io();

const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form")
const room = document.getElementById("room")

room.hidden = true

let roomName;

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("input");
    const value = input.value
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`)
    })
    input.value = ""
}

function handleNicknameSubmit(event) {
    event.preventDefault()
    const input = room.querySelector("#name input")
    socket.emit("nickname", input.value)
    
}

function showRoom(){
    welcome.hidden = true
    room.hidden = false
    const h3 = room.querySelector("h3")
    h3.innerText = `Room ${roomName}`
    const msgForm = room.querySelector("#msg")
    const nameForm = room.querySelector("#name")
    msgForm.addEventListener("submit", handleMessageSubmit)
    nameForm.addEventListener("submit", handleNicknameSubmit)
}

function addMessage(msg){
    const ul = room.querySelector("ul")
    const li = document.createElement("li")
    li.innerText = msg
    ul.appendChild(li)
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit(
        "enter_room", 
        input.value,
        showRoom
    )
    roomName = input.value
    console.log("roomName: ", roomName)
    input.value =""
}

form.addEventListener("submit", handleRoomSubmit)

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3")
    h3.innerText = `Room ${roomName} (${newCount})`
    addMessage(`${user} joined!`)
})

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3")
    h3.innerText = `Room ${roomName} (${newCount})`
    addMessage(`${left} left ㅠㅠ`)
})

socket.on("new_message", (msg) => addMessage(msg))

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul")
    console.log(`rooms: ${rooms}`)
    roomList.innerHTML = ''
    if(rooms.length === 0) return
    rooms.forEach(room => {
        const li = document.createElement("li")
        li.innerText = room;
        roomList.append(li)
    })
});