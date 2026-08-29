const setupAnalyticsSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("Analytics client connected");

        socket.on("disconnect", () => {
            console.log("Analytics client disconnected");
        });
    });
};

module.exports = setupAnalyticsSocket;
