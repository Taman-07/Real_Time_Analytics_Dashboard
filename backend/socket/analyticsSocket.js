// ============================================================
// SHOPLYTICS - ANALYTICS SOCKET
// ============================================================

export const analyticsSocket = (io) => {

    io.on(
        "connection",
        (socket) => {

            console.log(
                "Dashboard connected:",
                socket.id
            );


            // ------------------------------------------------
            // CONNECTION CONFIRMATION
            // ------------------------------------------------

            socket.emit(
                "connected",
                {

                    message:
                        "Connected to Shoplytics real-time server"

                }
            );


            // ------------------------------------------------
            // OPTIONAL CLIENT EVENT
            // ------------------------------------------------

            socket.on(
                "requestAnalyticsRefresh",
                () => {

                    console.log(
                        "Analytics refresh requested by:",
                        socket.id
                    );

                }
            );


            // ------------------------------------------------
            // DISCONNECT
            // ------------------------------------------------

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
