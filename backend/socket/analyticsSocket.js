// ============================================================
// SHOPLYTICS - ANALYTICS SOCKET
// ============================================================

export const analyticsSocket = (io) => {

    io.on("connection", (socket) => {

        console.log(
            "Analytics client connected:",
            socket.id
        );


        // =====================================================
        // JOIN ANALYTICS DASHBOARD
        // =====================================================

        socket.on("joinAnalytics", () => {

            socket.join(
                "analytics-dashboard"
            );

            console.log(
                `${socket.id} joined analytics dashboard`
            );

        });


        // =====================================================
        // DISCONNECT
        // =====================================================

        socket.on("disconnect", () => {

            console.log(
                "Analytics client disconnected:",
                socket.id
            );

        });

    });

};