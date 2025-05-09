import { Client, Token, User, Falsey } from 'oauth2-server';

export class OAuth2Model {
  // Get client credentials
  getClient(clientId: string, clientSecret: string): Promise<Client> {
    return Promise.resolve({
      id: clientId,
      clientSecret,
      grants: ['client_credentials', 'password', 'refresh_token'],
      redirectUris: []
    });
  }

  // Save token
  saveToken(token: Token, client: Client, user: User): Promise<Token> {
    return Promise.resolve({
      ...token,
      client,
      user,
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt
    });
  }

  // Get access token
  getAccessToken(accessToken: string): Promise<Token> {
    return Promise.resolve({
      accessToken,
      accessTokenExpiresAt: new Date(),
      client: {
        id: 'client_id',
        grants: ['client_credentials', 'password', 'refresh_token'],
        redirectUris: []
      },
      user: { id: 'user_id' }
    });
  }

  // Verify scope
  verifyScope(token: Token, scope: 'read' | 'write'): Promise<boolean> {
    return Promise.resolve(true);
  }

  // Get user
  getCurrentUser(username: string, password: string): Promise<User> {
    return Promise.resolve({ id: username });
  }

  // Save authorization code
  saveAuthorizationCode(code: any, client: Client, user: User): Promise<any> {
    return Promise.resolve({
      ...code,
      client,
      user
    });
  }

  // Get authorization code
  getAuthorizationCode(authorizationCode: string): Promise<any> {
    return Promise.resolve({
      authorizationCode,
      expiresAt: new Date(),
      client: {
        id: 'client_id',
        grants: ['client_credentials', 'password', 'refresh_token'],
        redirectUris: []
      },
      user: { id: 'user_id' }
    });
  }

  // Revoke token
  revokeToken(token: Token): Promise<boolean> {
    return Promise.resolve(true);
  }

  // Validate scope
  validateScope(user: User, client: Client, scope: string): Promise<string> {
    return Promise.resolve(scope);
  }
}

export default new OAuth2Model();