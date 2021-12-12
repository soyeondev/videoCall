const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")
const cameraSelect = document.getElementById("cameras")

let myStream;
let muted = false;
let cameraOff = false;

async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => {
            return device.kind === "videoinput"
        })
        cameras.forEach(camera => {
            const option = document.createElement("option")
            option.value = camera.deviceId
            option.innerText = camera.label
            cameraSelect.appendChild(option)
        })
        console.log(cameras)
    }catch(e){
        console.log(e)
    }
}

async function getMedia(){
    try{
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })
        myFace.srcObject = myStream;
        await getCameras();
    } catch(e){
        console.log(e)
    }
}

getMedia()

function handleMuteClick(){
    console.log(myStream.getAudioTracks())
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
    console.log("myStream getAudioTracks: ", myStream.getAudioTracks())
}

function handleCameraClick(){
    console.log(myStream.getVideoTracks())
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

function handleCameraChange(){
    console.log(cameraSelect.value)
}

muteBtn.addEventListener("click", handleMuteClick)
cameraBtn.addEventListener("click", handleCameraClick)
cameraSelect.addEventListener("input", handleCameraChange)