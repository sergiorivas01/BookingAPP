/**
 * User Service
 * Handles user creation and retrieval from database
 */

import { query } from '../database/connection';
import { User, OAuth2Profile } from './types';

export interface CreateUserInput {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  picture?: string;
}

export class UserService {
  /**
   * Find user by provider and provider ID
   */
  async findByProvider(provider: string, providerId: string): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
      [provider, providerId]
    );

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Create a new user
   */
  async createUser(input: CreateUserInput): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    await query(
      `INSERT INTO users (id, email, name, picture, provider, provider_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        input.email,
        input.name,
        input.picture || null,
        input.provider,
        input.providerId,
        now,
        now,
      ]
    );

    const user = await this.findByProvider(input.provider, input.providerId);
    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, updates: Partial<Pick<User, 'name' | 'picture' | 'email'>>): Promise<User> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.picture !== undefined) {
      fields.push(`picture = $${paramIndex++}`);
      values.push(updates.picture);
    }
    if (updates.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(updates.email);
    }

    if (fields.length === 0) {
      const user = await query<User>('SELECT * FROM users WHERE id = $1', [userId]);
      if (user.length === 0) {
        throw new Error('User not found');
      }
      return user[0];
    }

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(userId);

    await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    const user = await query<User>('SELECT * FROM users WHERE id = $1', [userId]);
    if (user.length === 0) {
      throw new Error('User not found');
    }

    return user[0];
  }

  /**
   * Find or create user from OAuth profile
   */
  async findOrCreateUser(profile: CreateUserInput): Promise<User> {
    // Try to find existing user by provider
    let user = await this.findByProvider(profile.provider, profile.providerId);

    if (user) {
      // Update user info if needed
      const updates: Partial<Pick<User, 'name' | 'picture' | 'email'>> = {};
      if (user.name !== profile.name) updates.name = profile.name;
      if (user.picture !== profile.picture) updates.picture = profile.picture;
      if (user.email !== profile.email) updates.email = profile.email;

      if (Object.keys(updates).length > 0) {
        user = await this.updateUser(user.id, updates);
      }

      return user;
    }

    // Try to find by email (in case user signed in with different provider)
    user = await this.findByEmail(profile.email);

    if (user) {
      // Link this provider to existing user
      await query(
        `UPDATE users SET provider = $1, provider_id = $2, updated_at = $3 WHERE id = $4`,
        [profile.provider, profile.providerId, new Date(), user.id]
      );

      return await this.findByProvider(profile.provider, profile.providerId) || user;
    }

    // Create new user
    return await this.createUser(profile);
  }
}

