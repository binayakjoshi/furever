const express = require('express');
const { SessionsClient } = require('@google-cloud/dialogflow');
const { authenticate } = require("../middleware/authentication")
const router = express.Router();

const sessionClient = new SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const projectId = process.env.DIALOGFLOW_PROJECT_ID || 'your-dialogflow-project-id';

router.use(authenticate);
router.post('/', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId || typeof message !== 'string' || typeof sessionId !== 'string' || message.length > 1000) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: 'en',
        },
      },
    };

    const [response] = await sessionClient.detectIntent(request);
    const result = response.queryResult;

    if (!result) throw new Error('No query result received from Dialogflow');

    const responseText = result.fulfillmentText || "I didn't understand that.";
    const intent = result.intent ? result.intent.displayName : 'Unknown';
    const confidence = result.intentDetectionConfidence || 0;

    console.log(`[Chat] Session: ${sessionId}, Intent: ${intent}, Confidence: ${confidence}`);

    res.json({
      response: responseText,
      intent,
      confidence,
      sessionId,
    });

  } catch (error) {
    console.error('Error processing chat message:', error);

    if (error.code === 'UNAUTHENTICATED') {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
