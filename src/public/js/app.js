const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")
const cameraSelect = document.getElementById("cameras")
const call = document.getElementById("call")

call.hidden = true

let myStream;
let muted = false;
let cameraOff = false;
let rooName;
let myPeerConnection;

async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => {
            return device.kind === "videoinput"
        })
        const currentCamera = myStream.getVideoTracks()[0]
        cameras.forEach(camera => {
            const option = document.createElement("option")
            option.value = camera.deviceId
            option.innerText = camera.label
            if(currentCamera.label === camera.label){
                option.selected = true
            }
            cameraSelect.appendChild(option)
        })
    }catch(e){
        console.log(e)
    }
}

async function getMedia(deviceId){
    const initialConstrains = {
        audio : true,
        video : {facingMode: "user"}
    }
    const cameraConstrains = {
        audio : true,
        video : { deviceId: {exact: deviceId}}
    }
    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId?cameraConstrains:initialConstrains
        );
        myFace.srcObject = myStream;
        if(!deviceId){
            await getCameras();
        }
    } catch(e){
        console.log(e)
    }
}

function handleMuteClick(){
    myStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled
    });
    if(!muted){
        muteBtn.innerText = "Unmute"
        muted = true
    } else {
        muteBtn.innerText = "Mute"
        muted = false
    }
}

function handleCameraClick(){
    myStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled
    })
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off"
        cameraOff = false
    } else {
        cameraBtn.innerText = "Turn Camera On"
        cameraOff = true
    }
}

async function handleCameraChange(){
    console.log("handle camera change")
    await getMedia(cameraSelect.value)
    console.log(cameraSelect.value)
}

muteBtn.addEventListener("click", handleMuteClick)
cameraBtn.addEventListener("click", handleCameraClick)
cameraSelect.addEventListener("input", handleCameraChange)

// Welcome Form(join a room)
const welcome = document.getElementById("welcome")
const welcomeForm = welcome.querySelector("form")

async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia()
    makeConnection()
}

async function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input")
    await initCall()
    socket.emit("join_room", input.value)
    rooName = input.value
    input.value = ""   
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit)

// Socket Code
socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer)
    console.log("sent the offer")
    socket.emit("offer", offer, rooName);
})

socket.on("offer", async offer => {
    console.log("receive the offer")
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, rooName)
    console.log("sent the offer")
    console.log(offer);
})

socket.on("answer", answer => {
    // console.log("answer in browser: ", answer)
    myPeerConnection.setRemoteDescription(answer);
})

// RTC Code
function makeConnection(){
    myPeerConnection = new RTCPeerConnection();
    // myPeerConnection.addEventListener("icecandidate", handleIce);
    myStream.getTracks().forEach(track => {
        myPeerConnection.addTrack(track, myStream);
    })
}

function handleIce(data){
    // console.log("got ice candidate")
    // console.log(data)
}