/**
 * OAuth 2.0 Passport Strategy
 */

import { Strategy as OAuth2Strategy, VerifyFunction } from 'passport-oauth2';
import { getOAuth2Config } from './config';
import { OAuth2Profile, User } from './types';
import { UserService } from './userService';

interface GitHubUser {
  id: number;
  login: string;
  name?: string;
  email?: string | null;
  avatar_url?: string;
  [key: string]: unknown;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility?: string | null;
}

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
      // Ensure profile has required fields (email is now optional, will use fallback)
      if (!profile.id || !profile.name) {
        return done(new Error('Invalid profile: missing required fields (id, name)'));
      }

      // Use fallback email if not provided
      const email = profile.email || `${oauthConfig.name}-${profile.id}@oauth.local`;

      // Find or create user
      const user = await userService.findOrCreateUser({
        provider: oauthConfig.name,
        providerId: String(profile.id),
        email: email,
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
      const userInfoURL = oauthConfig.config.userInfoURL!;
      const isGitHub = userInfoURL.includes('api.github.com');
      
      // For GitHub, use fetch with proper Authorization header
      if (isGitHub) {
        // Fetch user profile using native fetch with GitHub's required format
        fetch(userInfoURL, {
          headers: {
            'Authorization': `token ${accessToken}`,
            'User-Agent': 'BookingAPP',
            'Accept': 'application/vnd.github.v3+json',
          },
        })
          .then(async (response) => {
            if (!response.ok) {
              return done(new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`));
            }
            
            try {
              const json = await response.json() as GitHubUser;
              
              let email = json.email;
              
              // If email is null, fetch from /user/emails endpoint
              if (!email) {
                try {
                  const emailsResponse = await fetch('https://api.github.com/user/emails', {
                    headers: {
                      'Authorization': `token ${accessToken}`,
                      'User-Agent': 'BookingAPP',
                      'Accept': 'application/vnd.github.v3+json',
                    },
                  });
                  
                  if (emailsResponse.ok) {
                    const emails = await emailsResponse.json() as GitHubEmail[];
                    // Get primary email or first verified email
                    const primaryEmail = emails.find((e) => e.primary) || emails.find((e) => e.verified);
                    if (primaryEmail) {
                      email = primaryEmail.email;
                    }
                  }
                } catch (emailError) {
                  console.warn('Failed to fetch GitHub emails:', emailError);
                }
              }
              
              // Use fallback email if still null
              if (!email) {
                email = `${oauthConfig.name}-${json.id || json.login}@oauth.local`;
              }
              
              const profile: OAuth2Profile = {
                id: String(json.id || json.login),
                email: email,
                name: json.name || json.login || 'GitHub User',
                picture: json.avatar_url || undefined,
              };

              done(null, profile);
            } catch (parseError) {
              done(parseError instanceof Error ? parseError : new Error('Failed to parse user profile'));
            }
          })
          .catch((error) => {
            done(error instanceof Error ? error : new Error('Failed to fetch user profile'));
          });
      } else {
        // For other providers, use the default OAuth2 method
        const self = this;
        self._oauth2.get(userInfoURL, accessToken, (err: { statusCode: number; data?: any } | null, body?: string | Buffer) => {
          if (err) {
            return done(new Error(`Failed to fetch user profile: ${err.statusCode}`));
          }

          if (!body) {
            return done(new Error('Empty response from user info endpoint'));
          }

          try {
            const bodyStr = typeof body === 'string' ? body : body.toString();
            const json = JSON.parse(bodyStr);
            
            // Use fallback email if null
            const email = json.email || `${oauthConfig.name}-${json.id || json.sub}@oauth.local`;
            
            const profile: OAuth2Profile = {
              id: String(json.id || json.sub || json.user_id),
              email: email,
              name: json.name || json.display_name || json.username || 'User',
              picture: json.picture || json.avatar_url || json.photo_url,
              ...json,
            };

            done(null, profile);
          } catch (parseError) {
            done(parseError instanceof Error ? parseError : new Error('Failed to parse user profile'));
          }
        });
      }
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

