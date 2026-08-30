export const analyticsSocket = (io) => {

    io.on(
        "connection",
        (socket) => {

            console.log(
                "Dashboard connected:",
                socket.id
            );


            socket.emit(
                "connected",
                {
                    message:
                        "Connected to Shoplytics real-time server"
                }
            );


            socket.on(
                "disconnect",
                () => {

                    console.log(
                        "Dashboard disconnected:",
                        socket.id
                    );

                }
            );

        }
    );

};