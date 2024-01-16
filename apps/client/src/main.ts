import { io } from "socket.io-client";
import { handleMouseDown, handleMouseMove, handleMouseUp } from "./draggableProperties";

const socket = io("https://web-rtc-client-jsgh.vercel.app");

const { RTCPeerConnection, RTCSessionDescription } = window;

const peerConnection = new RTCPeerConnection();

let isAlreadyCalling = false;
let getCalled = false;

const remoteVideo = document.getElementById("remote-video") as HTMLVideoElement;
const localVideo = document.getElementById("local-video") as HTMLVideoElement;

function initSocketConnection() {
  socket.on("update-user-list", ({ users }) => {
    updateUserList(users);
  });

  socket.on("remove-user", ({ socketId }) => {
    const elToRemove = document.getElementById(socketId);

    if (elToRemove) {
      elToRemove.remove();
    }
  });

  socket.on("call-made", async data => {
    console.log(data)
    if (getCalled) {
      const confirmed = confirm(`User "Socket: ${data.socket}" wants to call you. Do accept this call?`);
      if (!confirmed) {
        socket.emit("reject-call", { from: data.socket });
        return;
      }
    }

    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

    socket.emit("make-answer", { answer, to: data.socket });
    getCalled = true;
  });

  socket.on("answer-made", async data => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));

    if (!isAlreadyCalling) {
      callUser(data.socket);
      isAlreadyCalling = true;
    }
  });

  socket.on("call-rejected", data => {
    alert(`User: "Socket: ${data.socket}" rejected your call.`);
    unselectUsersFromList();
  });
}

function initPeerConnection() {
  peerConnection.ontrack = ({ streams: [stream] }) => {
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
    }
  };
}

function initLocalVideo() {


  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (localVideo) {
          localVideo.srcObject = stream;
        }

        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });
  } else {
    console.warn('getUserMedia is not supported in this browser');
  }
}

function unselectUsersFromList() {
  const alreadySelectedUser = document.querySelectorAll(".active-user.active-user--selected");

  alreadySelectedUser.forEach(el => {
    el.setAttribute("class", "active-user");
  });
}

function createUserItemContainer(socketId: string) {
  const userContainerEl = document.createElement("div");
  const usernameEl = document.createElement("p");

  userContainerEl.setAttribute("class", "active-user");
  userContainerEl.setAttribute("id", socketId);
  usernameEl.setAttribute("class", "username");
  usernameEl.textContent = `Socket: ${socketId}`;

  userContainerEl.appendChild(usernameEl);

  userContainerEl.addEventListener("click", () => {
    unselectUsersFromList();
    userContainerEl.setAttribute("class", "active-user active-user--selected");
    const talkingWithInfo: HTMLHeadingElement = document.getElementById("talking-with-info") as HTMLHeadingElement;
    talkingWithInfo.innerHTML = `Talking with: "Socket: ${socketId}"`;
    callUser(socketId);
  });

  return userContainerEl;
}

async function callUser(socketId: string) {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

  socket.emit("call-user", { offer, to: socketId });
}

function updateUserList(socketIds: string[]) {
  const activeUserContainer: HTMLDivElement = document.getElementById("active-user-container") as HTMLDivElement;

  socketIds.forEach(socketId => {
    if (!document.getElementById(socketId)) {
      const userContainerEl = createUserItemContainer(socketId);
      activeUserContainer.appendChild(userContainerEl);
    }
  });
}


localVideo.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);
localVideo.addEventListener('touchstart', handleMouseDown);
document.addEventListener('touchmove', handleMouseMove);
document.addEventListener('touchend', handleMouseUp);
initSocketConnection();
initPeerConnection();
initLocalVideo();
