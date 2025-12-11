/**
 * OAuth 2.0 Passport Strategy
 */

import { Strategy as OAuth2Strategy, VerifyFunction } from 'passport-oauth2';
import { getOAuth2Config } from './config';
import { OAuth2Profile, User } from './types';
import { UserService } from './userService';

/**
 * Create OAuth 2.0 strategy for Passport
 */
export function createOAuth2Strategy(userService: UserService): OAuth2Strategy {
  const oauthConfig = getOAuth2Config();

  const verifyCallback: VerifyFunction = async (
    accessToken: string,
    refreshToken: string,
    profile: OAuth2Profile,
    done: (error: Error | null, user?: User) => void
  ) => {
    try {
      // Ensure profile has required fields
      if (!profile.id || !profile.email || !profile.name) {
        return done(new Error('Invalid profile: missing required fields (id, email, name)'));
      }

      // Find or create user
      const user = await userService.findOrCreateUser({
        provider: oauthConfig.name,
        providerId: profile.id,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
      });

      return done(null, user);
    } catch (error) {
      return done(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  const strategy = new OAuth2Strategy(
    {
      authorizationURL: oauthConfig.config.authorizationURL,
      tokenURL: oauthConfig.config.tokenURL,
      clientID: oauthConfig.config.clientID,
      clientSecret: oauthConfig.config.clientSecret,
      callbackURL: oauthConfig.config.callbackURL,
      scope: oauthConfig.config.scope,
    },
    verifyCallback
  );

  // Override userProfile to fetch user info from userInfoURL if provided
  if (oauthConfig.config.userInfoURL) {
    strategy.userProfile = function (accessToken: string, done: (err?: Error | null, profile?: OAuth2Profile) => void) {
      this._oauth2.get(oauthConfig.config.userInfoURL!, accessToken, (err: { statusCode: number; data?: any } | null, body?: string | Buffer) => {
        if (err) {
          return done(new Error(`Failed to fetch user profile: ${err.statusCode}`));
        }

        if (!body) {
          return done(new Error('Empty response from user info endpoint'));
        }

        try {
          const bodyStr = typeof body === 'string' ? body : body.toString();
          const json = JSON.parse(bodyStr);
          const profile: OAuth2Profile = {
            id: json.id || json.sub || json.user_id,
            email: json.email,
            name: json.name || json.display_name || json.username,
            picture: json.picture || json.avatar_url || json.photo_url,
            ...json,
          };

          done(null, profile);
        } catch (parseError) {
          done(parseError instanceof Error ? parseError : new Error('Failed to parse user profile'));
        }
      });
    };
  } else {
    // If no userInfoURL, we need to parse profile from token response
    // This is a fallback - most OAuth providers require userInfoURL
    strategy.userProfile = function (accessToken: string, done: (err?: Error | null, profile?: OAuth2Profile) => void) {
      // Try to extract from token response if available
      // This is a basic implementation - you may need to customize based on your provider
      done(new Error('userInfoURL is required for OAuth 2.0 authentication'));
    };
  }

  return strategy;
}

