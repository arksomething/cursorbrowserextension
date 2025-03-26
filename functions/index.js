const {onRequest} = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const OpenAI = require("openai");
// require('dotenv').config();

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");



exports.gptEndpoint = onRequest({ cors: true, secrets: [OPENAI_API_KEY] }, async (req, res) => {
  const {tab, selected, userPrompt, messages} = req.body;
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });
  try {
    const prompt = `You are an intelligent assistant. The user is currently browsing the web with tab data: "${tab}". They have selected the following text: "${selected}"`;
    const completion = await openai.chat.completions.create({
      messages: [
        {role: "system", content: prompt},
        ...messages,
        {role: "user", content: userPrompt},
      ],
      model: "gpt-4o-mini",  
    });

    const completionContent = completion.choices[0].message.content;
    res.send(completionContent);
  } catch (err) {
    res.send(err);
  }
});

exports.streamEndpoint = onRequest({ cors: true, secrets: [OPENAI_API_KEY] }, async (req, res) => {
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*"); // Allow all origins (or specify your frontend)
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600"); // Cache preflight response for 1 hour
    return res.status(204).send(""); // End preflight response
  }
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });
  // Set CORS Headers for actual requests
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  let isEnded = false; // Flag to track if the response has ended
  const {tab, selected, userPrompt, messages} = req.body;

  const sendData = (data) => {
    if (!isEnded) {
      res.write(data.delta);
    }
  };

  const prompt = `You are an intelligent assistant. The user is currently browsing the web with tab data: "${tab}". They have selected the following text: "${selected}"`;
  const stream = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {role: "system", content: prompt},
        ...messages,
      {role: "user", content: userPrompt},
    ],
    stream: true,
  });

  (async () => {
    try {
      for await (const event of stream) {
        if (event.type == "response.output_text.delta"){ 
          sendData(event);
        }
        if (event.type === 'response.output_item.done') {
          break; // Exit the loop if the event indicates completion
        }
      }
    } catch (error) {
      console.error("Error during streaming:", error);
      sendData({ error: "Something went wrong" }); // Send error message to client
    } finally {
      if (!isEnded) {
        isEnded = true; // Set the flag to true
        res.end(); // End the response
      }
    }
  })();
});
