/**
 * OAuth 2.0 Configuration
 * Supports multiple OAuth providers (Google, GitHub, Azure AD, etc.)
 */

export interface OAuth2Config {
  clientID: string;
  clientSecret: string;
  authorizationURL: string;
  tokenURL: string;
  userInfoURL?: string;
  callbackURL: string;
  scope?: string[];
}

export interface OAuth2ProviderConfig {
  enabled: boolean;
  name: string;
  config: OAuth2Config;
}

/**
 * Get OAuth 2.0 configuration from environment variables
 */
export function getOAuth2Config(): OAuth2ProviderConfig {
  const provider = process.env.OAUTH2_PROVIDER || 'generic';
  const enabled = process.env.OAUTH2_ENABLED === 'true';

  if (!enabled) {
    throw new Error('OAuth 2.0 is not enabled. Set OAUTH2_ENABLED=true');
  }

  const clientID = process.env.OAUTH2_CLIENT_ID;
  const clientSecret = process.env.OAUTH2_CLIENT_SECRET;
  const authorizationURL = process.env.OAUTH2_AUTHORIZATION_URL;
  const tokenURL = process.env.OAUTH2_TOKEN_URL;
  const userInfoURL = process.env.OAUTH2_USER_INFO_URL;
  const callbackURL = process.env.OAUTH2_CALLBACK_URL || 'http://localhost:8006/auth/callback';
  const scope = process.env.OAUTH2_SCOPE?.split(',') || ['openid', 'profile', 'email'];

  if (!clientID || !clientSecret || !authorizationURL || !tokenURL) {
    throw new Error(
      'Missing required OAuth 2.0 configuration. Please set:\n' +
      '- OAUTH2_CLIENT_ID\n' +
      '- OAUTH2_CLIENT_SECRET\n' +
      '- OAUTH2_AUTHORIZATION_URL\n' +
      '- OAUTH2_TOKEN_URL\n' +
      '- OAUTH2_CALLBACK_URL (optional, defaults to http://localhost:8006/auth/callback)'
    );
  }

  return {
    enabled: true,
    name: provider,
    config: {
      clientID,
      clientSecret,
      authorizationURL,
      tokenURL,
      userInfoURL,
      callbackURL,
      scope,
    },
  };
}

/**
 * Get session configuration
 */
export function getSessionConfig() {
  const secret = process.env.SESSION_SECRET || process.env.OAUTH2_CLIENT_SECRET;
  
  if (!secret) {
    throw new Error('SESSION_SECRET or OAUTH2_CLIENT_SECRET must be set');
  }

  return {
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax' as const,
    },
  };
}

