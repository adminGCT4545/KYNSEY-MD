import { OAuth2Server, Request, Response } from 'oauth2-server';
import { IncomingMessage, ServerResponse } from 'http';
import { OAuth2Model } from './oauth2-model';
import { log } from '../utils/logger';

// Create OAuth2 server instance
const oauth = new OAuth2Server({
  model: OAuth2Model,
  accessTokenLifetime: 60 * 60 * 24, // 24 hours
  allowBearerTokensInQueryString: false,
});

// Convert Express request/response to OAuth2 format
const convertExpressToOAuth = (expressReq: any, expressRes: any) => {
  const req = new Request(expressReq);
  const res = new Response(expressRes);
  return { req, res };
};

// Authentication middleware
export const authenticate = async (expressReq: any, expressRes: any, next: Function) => {
  try {
    const { req, res } = convertExpressToOAuth(expressReq, expressRes);
    const token = await oauth.authenticate(req, res);
    expressReq.user = token;
    log.info('Authentication successful');
    next();
  } catch (err) {
    log.error('Authentication failed:', err);
    expressRes.status(401).json({ error: 'Authentication failed' });
  }
};

// Token generation endpoint
export const token = async (expressReq: any, expressRes: any) => {
  try {
    const { req, res } = convertExpressToOAuth(expressReq, expressRes);
    const token = await oauth.token(req, res);
    log.info('Token generated successfully');
    expressRes.json(token);
  } catch (err) {
    log.error('Token generation failed:', err);
    expressRes.status(400).json({ error: 'Token generation failed' });
  }
};

// Authorization endpoint
export const authorize = async (expressReq: any, expressRes: any, next: Function) => {
  try {
    const { req, res } = convertExpressToOAuth(expressReq, expressRes);
    const code = await oauth.authorize(req, res);
    expressRes.locals.oauth = { code };
    log.info('Authorization successful');
    next();
  } catch (err) {
    log.error('Authorization failed:', err);
    expressRes.status(403).json({ error: 'Authorization failed' });
  }
};

export default oauth;