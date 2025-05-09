import express from 'express';
import { OAuth2Server } from 'oauth2-server';
import OAuth2Model from './oauth2-model';
import { log } from '../utils/logger';

const app = express();
const port = process.env.PORT || 3000;

// Initialize OAuth2 server with model instance
const oauth = new OAuth2Server({
  model: OAuth2Model,
  accessTokenLifetime: 60 * 60 * 24, // 24 hours
  allowBearerTokensInQueryString: false
});

// Middleware
app.use(express.json());

// Token endpoint
app.post('/oauth/token', async (req, res) => {
  try {
    const token = await oauth.token(new OAuth2Server.Request(req), new OAuth2Server.Response(res));
    log.info('Token generated successfully');
    res.json(token);
  } catch (err) {
    log.error('Token generation failed:', err);
    res.status(400).json({ error: 'Token generation failed' });
  }
});

// Start server
app.listen(port, () => {
  log.info(`OAuth2 server running on port ${port}`);
});

export default app;