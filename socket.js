import { Server } from 'socket.io';

export function initSocket(httpServer) {
    const io = new Server(httpServer);
    const users = {}; //[socket.id] = {name, room}
    const rooms = new Set(); //список комнат

    io.on('connection', (socket) => {
        console.log("Подключился: ", socket.id);

        socket.on('setName', (name) => {
            users[socket.id] = {name, room: null};
            socket.emit("roomList", [...rooms]);
        });

        socket.on('createRoom', (roomName) => {
            if (!roomName) {
                return;
            }
            rooms.add(roomName);
            io.emit("roomList", [...rooms]);
        });

        socket.on('joinRoom', (roomName) => {
            const user = users[socket.id];
            if (!user) {
                return;
            }

            if (user.room) {
                socket.leave(user.room);
                io.to(user.room).emit("userLeft", user.name);
            }

            user.room = roomName;
            socket.join(roomName);

            io.to(roomName).emit("userJoined", user.name);

            const members = Object.values(users).filter(u => u.room === roomName).map(u => u.name);

            io.to(roomName).emit("roomMembers", members);
        });
        
        socket.on('message', (text) => {
            const user = users[socket.id];
            if (!user || !user.room) {
                return;
            }

            socket.broadcast.to(user.room).emit("message", {
                from: user.name,
                text,
                self: false
            });

            socket.emit("message", {
                from: user.name,
                text,
                self: true
            });
        });

        socket.on('disconnect', () => {
            const user = users[socket.id];

            if (user) {
                if (user.room) {
                    io.to(user.room).emit("userLeft", user.name);
                }
                delete users[socket.id];
            }
            console.log("Отключился: ", socket.id);
        });
    });

}