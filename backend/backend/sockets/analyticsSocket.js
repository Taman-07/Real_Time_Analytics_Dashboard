const Analytics = require("../models/Analytics");
const EventLog = require("../models/EventLog");

const documentStats = {};

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("⚡ User connected:", socket.id);

        socket.on("join:doc", async ({ docId, userId }) => {
            socket.join(docId);

            if (!documentStats[docId]) {
                documentStats[docId] = {
                    activeUsers: 0,
                    edits: 0,
                    messages: 0
                };
            }

            documentStats[docId].activeUsers++;

            await Analytics.findOneAndUpdate(
                { documentId: docId },
                { $inc: { activeUsers: 1 } },
                { upsert: true }
            );

            await EventLog.create({
                documentId: docId,
                event: "JOIN",
                userId
            });

            io.to(docId).emit("analytics:update", documentStats[docId]);
        });

        socket.on("doc:edit", async ({ docId, userId }) => {
            if (!documentStats[docId]) return;

            documentStats[docId].edits++;

            await Analytics.findOneAndUpdate(
                { documentId: docId },
                { $inc: { totalEdits: 1 } }
            );

            io.to(docId).emit("analytics:update", documentStats[docId]);
        });

        socket.on("chat:message", async ({ docId, userId }) => {
            if (!documentStats[docId]) return;

            documentStats[docId].messages++;

            await Analytics.findOneAndUpdate(
                { documentId: docId },
                { $inc: { totalMessages: 1 } }
            );
        });

        socket.on("disconnecting", async () => {
            const rooms = [...socket.rooms];

            for (let docId of rooms) {
                if (documentStats[docId]) {
                    documentStats[docId].activeUsers--;

                    await Analytics.findOneAndUpdate(
                        { documentId: docId },
                        { $inc: { activeUsers: -1 } }
                    );

                    io.to(docId).emit("analytics:update", documentStats[docId]);
                }
            }
        });
    });
};
