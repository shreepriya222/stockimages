const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const upload = multer({ dest: "uploads/" });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "shreepriya222/stockimages";  // ✅ Make sure this is correct
const BRANCH = "main";  // ✅ Use the correct branch (usually "main" or "master")

app.use(express.static("public"));

app.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const { path, originalname } = req.file;
        const content = fs.readFileSync(path, { encoding: "base64" });

        const url = `https://api.github.com/repos/${REPO}/contents/uploads/${originalname}`;
        console.log(`🔵 Uploading to: ${url}`); // ✅ Debugging

        const response = await axios.put(
            url,
            {
                message: `Upload ${originalname}`,
                content: content,
                branch: BRANCH
            },
            {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                },
            }
        );

        fs.unlinkSync(path);
        console.log("✅ Upload successful:", response.data);
        res.json({ success: true, url: response.data.content.html_url });

    } catch (error) {
        console.error("❌ Upload failed!", error.response?.data || error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
