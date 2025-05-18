const {onRequest} = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require('firebase-admin');
const express = require('express');
const OpenAI = require("openai");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_ENDPOINT_SECRET = defineSecret("STRIPE_ENDPOINT_SECRET");
const OPENROUTER_API_KEY = defineSecret("OPENROUTER_API_KEY");

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

const plusModels = [
  'openai/gpt-4.1-mini',
  'openai/gpt-4.1',
  'anthropic/claude-3.7-sonnet',
  'anthropic/claude-3.7-sonnet:thinking',
  'anthropic/claude-3.5-sonnet',
  'google/gemini-2.0-flash-001',
  'google/gemini-2.5-flash-preview',
  'openai/o4-mini',
  'x-ai/grok-3-mini-beta',
  'openai/gpt-4o-mini-search-preview',
  'openai/gpt-4o-search-preview',
];
exports.streamEndpoint = onRequest({ cors: true, secrets: [OPENAI_API_KEY, OPENROUTER_API_KEY] }, async (req, res) => {
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
    Interesting thread! It's wild how political discussions can spiral into humor and sarcasm. The way people play with words reflects the tension in current politics. What's everyone's take on how rhetoric influences market reactions nowadays?
    \`\`\`
    `;


  const stream = await openai.responses.create({
    model: model,
    input: [
      {role: "system", content: prompt},
      ...(Array.isArray(messages) ? messages : []),
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

exports.routerEndpoint = onRequest({ cors: true, secrets: [OPENROUTER_API_KEY] }, async (req, res) => {
  const token = req.get('Authorization').split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  const uid = decodedToken.uid;

  const openai = new OpenAI({ 
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: OPENROUTER_API_KEY.value(), 
  });

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    return res.status(204).send("");
  }

  // Set CORS Headers for actual requests
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  let isEnded = false;
  const {tab, selected, userPrompt, messages, model, systemPrompt = ''} = req.body;

  // Check user credits
  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      // Initialize new user with default credits
      await userRef.set({
        credits: 50,  // Give new users 5 credits
        premiumCredits: 0,
        plan: 'Free',
        createdAt: FieldValue.serverTimestamp()
      });
    }

    const userData = userDoc.exists ? userDoc.data() : { credits: 50, premiumCredits: 0, plan: 'Free' };
    const credits = userData.credits || 0;
    const premiumCredits = userData.premiumCredits || 0;
    const plan = userData.plan || 'Free';

    // If user has Plus plan, don't check credits
    if (plan !== 'Plus' && credits <= 0) {
      res.write(JSON.stringify({ error: "You've run out of credits. Please upgrade to Plus or purchase more credits." }));
      res.end();
      return;
    }

    if (plan === 'Plus' && plusModels.includes(model) && premiumCredits <= 0) {
      res.write(JSON.stringify({ error: "You've run out of premium credits. Your credits will replenish in the next month." }));
      res.end();
      return;
    }
    // Deduct credit if not Plus plan
    if (plan !== 'Plus') {
      await userRef.update({
        credits: FieldValue.increment(-1),
        lastUsed: FieldValue.serverTimestamp()
      });
    }
    if (plan === 'Plus' && plusModels.includes(model)) {
      await userRef.update({
        premiumCredits: FieldValue.increment(-1),
        lastUsed: FieldValue.serverTimestamp()
      });
    }

    await userRef.set({
      requestSent: FieldValue.increment(1),
      lastUsed: FieldValue.serverTimestamp(),
    }, { merge: true });

  } catch (error) {
    console.error("Error checking credits:", error);
    res.write(JSON.stringify({ error: error }));
    res.end();
  }
    const sysPrompt = `When writing some text that is meant to be copied, like a sample document
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
      Interesting thread! It's wild how political discussions can spiral into humor and sarcasm. The way people play with words reflects the tension in current politics. What's everyone's take on how rhetoric influences market reactions nowadays?
      \`\`\``;

    const prompt = `You are an intelligent assistant. 
      The user is currently browsing the web with tab data: "${tab}". 
      They have selected the following text: "${selected}".
      
      ${systemPrompt.trim() ? systemPrompt : sysPrompt}
      `;

    const stream = await openai.chat.completions.create({
      model: model,
      messages: [
        {role: "system", content: prompt},
        ...(Array.isArray(messages) ? messages : []),
        {role: "user", content: userPrompt},
      ],
      stream: true,
    });

    (async () => {
      try {
        for await (const chunk of stream) {
          if (chunk.choices && chunk.choices[0]?.delta?.content) {
            const content = chunk.choices[0].delta.content;
            if (!isEnded) {
              res.write(content);
            }
          }
        }
      } catch (error) {
        console.error("Detailed error:", error);
        if (!isEnded) {
          res.write(JSON.stringify({ error: error.message }));
        }
      } finally {
        if (!isEnded) {
          isEnded = true;
          res.end();
        }
      }
    })();

  
});



//stripe shit
exports.createCheckoutSession = onRequest({ cors: true, secrets: [STRIPE_SECRET_KEY] }, async (req, res) => {
  const stripe = require('stripe')(STRIPE_SECRET_KEY.value());

  const prices = await stripe.prices.list({
    lookup_keys: [req.body.lookup_key],
    expand: ['data.product'],
  });

  const { uid } = req.body;

  const session = await stripe.checkout.sessions.create({
    billing_address_collection: 'auto',
    line_items: [
      {
        price: prices.data[0].id,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    expand: ['subscription'],
    metadata: {
      uid: uid,
    },
    subscription_data: {
      metadata: {
        uid: uid,
      },
    },
    payment_method_collection: 'always',
    success_url: `https://sophonextension.vercel.app/success/?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `https://sophonextension.vercel.app/cancel/?canceled=true`
  });


  res.send(session.url);
});

const app = express();

app.use(
  express.raw({
    type: 'application/json',
    verify: (req, res, buf) => {
      req['rawBody'] = buf.toString(); // Store the raw body in the request object
    }
  })
);

// 🔐 Stripe webhook handler
app.post('/webhook', async (req, res) => {
  const stripe = require('stripe')(STRIPE_SECRET_KEY.value());
  
  let event;
  const signature = req.headers['stripe-signature'];
  const endpointSecret = STRIPE_ENDPOINT_SECRET.value();
  
  try {
    // 👇 Use the raw body for signature verification
    event = stripe.webhooks.constructEvent(
      (req.rawBody).toString('utf8'),  // This must be a raw string or Buffer
      signature,
      endpointSecret
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("event", event);
  try {
    switch (event.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.object;
        console.log("Subscription created:", {
          id: subscription.id,
          metadata: subscription.metadata,
          status: subscription.status
        });
        
        try {
          // Check subscription metadata first
          let uid = subscription.metadata?.uid;
          
          if (!uid) {
            // If no subscription metadata, retrieve the session that created this subscription
            const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);
            const session = await stripe.checkout.sessions.retrieve(invoice.checkout.session);
            console.log("Checkout session:", {
              id: session.id,
              metadata: session.metadata
            });
            uid = session.metadata?.uid;
          }

          if (uid) {
            const userRef = db.collection("users").doc(uid);
            await userRef.update({
              plan: "Plus",
              premiumCredits: 500,
              subscriptionId: subscription.id,
              customerId: subscription.customer,
              updatedAt: FieldValue.serverTimestamp(),
            });
            console.log(`✅ Updated user ${uid} to Plus plan`);
          } else {
            console.error('❌ No uid found in metadata');
            // Log relevant objects for debugging
            console.log("Debug - Full subscription:", JSON.stringify(subscription, null, 2));
          }
        } catch (error) {
          console.error('Error handling subscription creation:', error);
          console.log("Error details:", error.message);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log(`❌ Subscription canceled! Status: ${subscription.status}`);
        // Update user's subscription status
        const userRef = db.collection("users").doc(subscription.metadata.uid);
        await userRef.update({
          plan: "Free",
        });
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object;
        
        try {
          // Get the customer ID from the invoice
          const customerId = invoice.customer;
          
          // Find user by customerId
          const usersRef = db.collection("users");
          const userSnapshot = await usersRef.where('customerId', '==', customerId).get();
          
          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            await userDoc.ref.update({
              premiumCredits: 500,  // Reset to 500 credits
              lastCreditReset: FieldValue.serverTimestamp()
            });
            console.log(`✅ Reset premium credits for user ${userDoc.id}`);
          }
        } catch (error) {
          console.error('Error resetting premium credits:', error);
          console.log("Error details:", error.message);
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('Error handling webhook event:', error);
    res.sendStatus(500);
  }
});

// 👇 Export as Firebase HTTPS Function
exports.stripeWebhook = onRequest({ cors: true, rawBody: true, secrets: [STRIPE_SECRET_KEY, STRIPE_ENDPOINT_SECRET]}, app);
