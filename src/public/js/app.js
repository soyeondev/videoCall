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
let myDataChannel;

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
    if(myPeerConnection){
        const videoTrack = myStream.getVideoTracks()[0];
        console.log(myPeerConnection)
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video");
        console.log(videoSender)
        videoSender.replaceTrack(videoTrack)
    }
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
socket.on("welcome", async () => {  // 먼저 들어간 사람
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", (event) => {
        console.log(event.data);
    });
    console.log("made data channel");
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer)
    console.log("sent the offer")
    socket.emit("offer", offer, rooName);
})

socket.on("offer", async offer => { // 두번째로 들어온 사람
    myPeerConnection.addEventListener("datachannel", (event) => {
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message", (event) => {
            console.log(event.data);
        });
    })
    console.log("receive the offer")
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, rooName)
    console.log("sent the offer")
})

socket.on("answer", answer => {
    console.log("receive the answer ")
    myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice", ice => {
    console.log("receive candidate")
    myPeerConnection.addIceCandidate(ice);
})

// RTC Code
function makeConnection(){
    console.log("make connection ???")
    myPeerConnection = new RTCPeerConnection();
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream.getTracks().forEach(track => {
        myPeerConnection.addTrack(track, myStream);
    })
}

function handleIce(data){
    console.log("sent candidate")
    socket.emit("ice", data.candidate, rooName)
}

function handleAddStream(data){
    const peersStream = document.getElementById("peersStream")
    console.log("got an event from my peer")
    console.log("Peer's Stream ", data.stream)
    console.log("My Stream ", myStream)
    peersStream.srcObject = data.stream
}