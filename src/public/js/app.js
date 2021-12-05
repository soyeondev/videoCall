const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`)

function makeMessage(type, payload){
    const msg = {type, payload}
    return JSON.stringify(msg)
}

function handleOpen(){
    console.log("Connected to Server 🥕 ")
}

socket.addEventListener("open", () => handleOpen)

socket.addEventListener("message", (message) => {
    console.log("New message: ", message.data, " from the Server ")
    const li = document.createElement("li")
    li.innerText = message.data
    messageList.append(li)
})

socket.addEventListener("close", () => {
    console.log("Disconneted from Server ❌ ")
})

// handle submit the message 
function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input")
    socket.send(
        makeMessage("new_message", input.value)
    )
    const li = document.createElement("li")
    li.innerText = `You: ${input.value}`
    messageList.append(li)
    input.value = ""
}

// handle submit the nickname 
function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input")
    socket.send(
        makeMessage("nickname", input.value)
    )
}

messageForm.addEventListener("submit", handleSubmit)
nickForm.addEventListener("submit", handleNickSubmit)