require("dotenv").config();
const express = require("express");
// const fs = require("fs");
const app = express();
const port = 3000;

app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
const { Configuration, OpenAIApi } = require("openai");
const bodyParser = require("body-parser");
const axios = require("axios");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Conversation history
let conversationHistory = [];

// sendFile will go here
app.get("/", function (req, res) {
  res.sendFile("./public/index.html");
});

// Handle the voice input processing
app.post("/process", async (req, res) => {
  try {
    const transcript = req.body.transcript;

    // Add user message to the conversation history
    conversationHistory.push({ role: "user", content: transcript });

    // Generate response from GPT
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: conversationHistory,
    });
    const responseText = chatCompletion.data.choices[0].message?.content;

    // Add AI response to the conversation history
    conversationHistory.push({ role: "assistant", content: responseText });

    const audio = await textToSpeech(responseText);

    res.status(200).json({ audio, responseText, conversationHistory });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

async function textToSpeech(text) {
  const encodedParams = new URLSearchParams();
  encodedParams.set("src", text);
  encodedParams.set("hl", "en-us");
  encodedParams.set("r", "0");
  encodedParams.set("c", "mp3");
  encodedParams.set("f", "32khz_8bit_mono");
  encodedParams.set("b64", true);

  const options = {
    method: "POST",
    url: "https://voicerss-text-to-speech.p.rapidapi.com/",
    params: {
      key: process.env.VOICE_RSS,
    },
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "voicerss-text-to-speech.p.rapidapi.com",
    },
    data: encodedParams,
  };
  const response = await axios.request(options);
  console.log(response.data);
  return response.data;
}
