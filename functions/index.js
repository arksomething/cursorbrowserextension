const {onRequest} = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require('firebase-admin');

const OpenAI = require("openai");
// require('dotenv').config();

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();


exports.gptEndpoint = onRequest({ cors: true, secrets: [OPENAI_API_KEY] }, async (req, res) => {
  const {tab, selected, userPrompt, messages} = req.body;

  try {
    const token = req.get('Authorization').split('Bearer ')[1];
    if (!token) {
      return res.status(401).send("Unauthorized: No token provided");
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
  } catch {
    return res.status(401).send("Unauthorized: No token provided");
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });
  try {
    const prompt = `You are an intelligent assistant. 
    The user is currently browsing the web with tab data: "${tab}". 
    They have selected the following text: "${selected}".
    When writing some text that is meant to be copied, like a sample document
    or a blurb of text to be pasted in or inserted into a form, format it 
    like code with the language named "text". Do this whenever
    the user wants you to write something that they might want to insert into 
    the webpage. 
    
    Some examples of times you might do this include:
    When the user asks you to write a comment while on a reddit page
    When the user asks you to write a short story or paragraph
    When the user asks you to write a tweet or X post
    When the user wants a response for an email
    When the user needs a snippet for a blog post
    When the user asks for a LinkedIn post


    Example User Prompt:
    write a comment here

    Example Response:
    Sure! How about this:

    \`\`\`text
    Interesting thread! It's wild how political discussions can spiral into humor and sarcasm. The way people play with words reflects the tension in current politics. What's everyone’s take on how rhetoric influences market reactions nowadays?
    \`\`\`
    `;



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
  const {tab, selected, userPrompt, messages, model} = req.body;

  const sendData = (data) => {
    if (!isEnded) {
      res.write(data.delta);
    }
  };

  // const prompt = `You are an intelligent assistant. The user is currently browsing the web with tab data: "${tab}". They have selected the following text: "${selected}"`;

  const prompt = `You are an intelligent assistant. 
    The user is currently browsing the web with tab data: "${tab}". 
    They have selected the following text: "${selected}".
    When writing some text that is meant to be copied, like a sample document
    or a blurb of text to be pasted in or inserted into a form, format it 
    like code with the language named "text". Do this whenever
    the user wants you to write something that they might want to insert into 
    the webpage. DO NOT DO THIS FOR CODE, AS THAT CAN ALREADY BE COPY/PASTED EASILY.
    
    Some examples of times you might do this include:
    When the user asks you to write a comment while on a reddit page
    When the user asks you to write a short story or paragraph
    When the user asks you to write a tweet or X post
    When the user wants a response for an email
    When the user needs a snippet for a blog post
    When the user asks for a LinkedIn post


    Example User Prompt:
    write a comment here

    Example Response:
    Sure! How about this:

    \`\`\`text
    Interesting thread! It's wild how political discussions can spiral into humor and sarcasm. The way people play with words reflects the tension in current politics. What's everyone’s take on how rhetoric influences market reactions nowadays?
    \`\`\`
    `;


  const stream = await openai.responses.create({
    model: model,
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


//stripe shit

exports.checkoutIntent = onRequest({ cors: true }, async (req, res) => {
  const { uid } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Premium + Credits',
              description: 'Provides access to all premium features (like email saving) and gives 150 email unlock credits. Enough to get through a recruiting season!',
            },
            unit_amount: 499,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://outlink.work/success',
      cancel_url: 'https://outlink.work/cancel',
      metadata: {uid: uid}
    });
   
    res.send({url: session.url});
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).send({ error: "Failed to create checkout session." });
  }
});

exports.stripeWebhook = onRequest({ cors: true, rawBody: true }, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = req.rawBody.toString('utf8');
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.uid;

      // Check if transaction already exists
      const transactionRef = db.collection("transactions").doc(session.id);
      const transactionDoc = await transactionRef.get();

      if (!transactionDoc.exists) {
        await transactionRef.set({
          userId: userId,
          amount: session.amount_total,
          currency: session.currency,
          status: session.payment_status,
          quantity: session.line_items.data[0].quantity,
          productName: session.line_items.data[0].price_data.product_data.name,
          created: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update user's credit balance and premium status
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
          // If user document doesn't exist, create it with initial credits and premium status
          await userRef.set({
            credits: 100,
            premium: true
          });
        } else {
          // If user document exists, increment credits and set premium
          await userRef.set({
            credits: admin.firestore.FieldValue.increment(150),
            premium: true
          }, { merge: true });
        }

        console.log('Transaction recorded and credits added to user account');
      } else {
        console.log('Transaction already processed, skipping');
      }
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
  }

  res.json({received: true});
});

exports.retrieveFromDatabase = onRequest({ cors: true }, async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).send({ error: "Name is required." });
    }

    const userRef = db.collection("eeg").doc(name);
    const docSnap = await userRef.get();

    if (!docSnap.exists) {
      return res.status(404).send({ error: "No data found for the given name." });
    }

    const data = docSnap.data();
    res.status(200).send(data);

  } catch (err) {
    console.error("Error retrieving content from Firestore:", err);
    res.status(500).send({ error: err.message || "Unknown error" });
  }
});
