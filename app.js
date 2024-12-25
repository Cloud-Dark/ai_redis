const express = require("express");
const redis = require("./config/redis");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

// Konfigurasi TTL (3 jam = 10800 detik)
const TTL = 10800;

// Endpoint untuk mengirim pesan ke AI
app.post("/api/session", async (req, res) => {
    const { session, message } = req.body;

    if (!session || !message) {
        return res.status(400).json({ error: "Session and message are required" });
    }

    try {
        // Ambil percakapan dari Redis jika ada
        let chatHistory = await redis.get(session);
        chatHistory = chatHistory ? JSON.parse(chatHistory) : [];

        // Tambahkan pesan user ke history dengan timestamp
        const userMessage = {
            role: "user",
            content: message,
            timestamp: new Date().toISOString()
        };
        chatHistory.push(userMessage);

        // Ubah riwayat menjadi format yang mencakup timestamp
        const messagesForAI = chatHistory.map(({ role, content, timestamp }) => {
            if (role === "user") {
                return { role, content: `${content} (waktu: ${timestamp})` };
            }
            return { role, content };
        });

        // Kirim request ke Cloudflare AI
        const aiResponse = await axios.post(
            process.env.CLOUDFLARE_AI_URL,
            {
                messages: [
                    { role: "system", content: process.env.AI_SYSTEM_MESSAGE },
                    ...messagesForAI
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // Debug log untuk respons API Cloudflare
        console.log("Cloudflare API Response:", aiResponse.data.result.response);

        // Ambil pesan dari respons
        const botMessage = aiResponse.data?.result?.response;

        if (!botMessage) {
            throw new Error("Invalid response structure from Cloudflare AI");
        }

        // Tambahkan respon AI ke history dengan timestamp
        chatHistory.push({
            role: "assistant",
            content: botMessage,
            timestamp: new Date().toISOString()
        });

        // Simpan history di Redis dengan TTL
        await redis.set(session, JSON.stringify(chatHistory), "EX", TTL);

        // Kirim respon ke client
        res.json({ session, botMessage, chatHistory });
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Endpoint untuk query berdasarkan timestamp
app.get("/api/session/:session/query", async (req, res) => {
    const { session } = req.params;
    const { timestamp } = req.query;

    if (!session || !timestamp) {
        return res.status(400).json({ error: "Session and timestamp are required" });
    }

    try {
        // Ambil riwayat sesi dari Redis
        let chatHistory = await redis.get(session);
        if (!chatHistory) {
            return res.status(404).json({ error: "Session not found" });
        }

        chatHistory = JSON.parse(chatHistory);

        // Cari pesan berdasarkan timestamp
        const message = chatHistory.find(
            (entry) =>
                entry.role === "user" &&
                new Date(entry.timestamp).toISOString() === new Date(timestamp).toISOString()
        );

        if (!message) {
            return res.status(404).json({ error: "No message found for the given timestamp" });
        }

        res.json({
            timestamp: message.timestamp,
            question: message.content
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});
