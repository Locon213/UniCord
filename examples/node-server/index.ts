import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { exchangeCodeForTokenNode } from '../../dist/index.mjs';
import crypto from 'node:crypto';

// Node 18+ has global fetch; if using older versions, install node-fetch.

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

const sessions = new Map<string, any>();

app.post('/api/auth/discord', async (req, res) => {
  const { code, code_verifier, redirect_uri } = req.body;
  try {
    const result = await exchangeCodeForTokenNode({
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      code,
      codeVerifier: code_verifier,
      redirectUri: redirect_uri,
    });
    const sid = crypto.randomUUID();
    sessions.set(sid, result.tokens);
    res.cookie('unicord_sid', sid, { httpOnly: true });
    res.json({ user: result.user, tokens: { access_token: 'hidden' } });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
