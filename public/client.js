const socket = io();
const username = prompt("Введите ваше имя:");
socket.emit("setName", username);

const roomList = document.getElementById("roomList");
const membersDiv = document.getElementById("members");
const messagesDiv = document.getElementById("messages");
const roomTitle = document.getElementById("roomTitle");

document.getElementById("createRoomBtn").onclick = () => {
    const room = document.getElementById("newRoom").value.trim();
    if (room) {
        socket.emit("createRoom", room);
        document.getElementById("newRoom").value = "";
    }
};

socket.on("roomList", (rooms) => {
    roomList.innerHTML = "";

    rooms.forEach(room => {
        const btn = document.createElement("button");
        btn.textContent = room;
        btn.className = "room-btn";
        btn.onclick = () => {
            socket.emit("joinRoom", room);
            roomTitle.textContent =  `Комната: ${room}`;
            messagesDiv.innerHTML = "";
        };
        roomList.appendChild(btn);
    });
})

socket.on("userJoined", (name) => {
    messagesDiv.innerHTML += `<div class="sys"><b>${name}</b> вошёл в комнату</div>`;
});

socket.on("userLeft", (name) => {
    messagesDiv.innerHTML += `<div class="sys"><b>${name}</b> вышел</div>`;
});

socket.on("roomMembers", (members) => {
    membersDiv.innerHTML = "<h4>Участники:</h4>" + members.join("<br>");
});

document.getElementById("sendBtn").onclick = () => {
    const text = document.getElementById("msg").value.trim();
    if (text) {
        socket.emit("message", text);
        document.getElementById("msg").value = "";
    }
};

function getAvatarLetter(name) {
    return (name ? name[0] : "?").toUpperCase();
}

socket.on("message", ({ from, text, self }) => {
    const msg = document.createElement("div");
    msg.className = self ? "msg msg-self" : "msg msg-other";

    msg.innerHTML = `
        <div class="avatar">${getAvatarLetter(from)}</div>
        <div class="bubble">
            <div class="name">${from}</div>
            <div class="text">${text}</div>
        </div>
    `;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
