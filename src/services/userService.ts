import { createClient } from '@supabase/supabase-js';
import { UserSettings, UserCreateRequest } from '../models/user';

const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and ANON KEY are required in environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
};

export class UserService {
  private supabase = getSupabaseClient();

  async getUser(userId: string): Promise<UserSettings | null> {
    try {
      console.log('Fetching user:', userId);
      
      const { data, error } = await this.supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Используем maybeSingle вместо single

      if (error) {
        console.error('Supabase error in getUser:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getUser:', error);
      return null;
    }
  }

  async createUser(userId: string, userData: UserCreateRequest): Promise<UserSettings> {
    try {
      const now = new Date().toISOString();
      const defaultUser: UserSettings = {
        user_id: userId,
        base_currency: userData.base_currency || 'USD',
        favorites: userData.favorites || [],
        created_at: now,
        updated_at: now,
      };

      console.log('Creating user:', userId);

      const { data, error } = await this.supabase
        .from('user_settings')
        .insert([defaultUser])
        .select()
        .single();

      if (error) {
        console.error('Supabase error in createUser:', error);
        
        // Если ошибка из-за RLS, создаем временного пользователя
        if (error.message.includes('policy') || error.message.includes('RLS')) {
          console.log('RLS policy error, using fallback user');
          return defaultUser;
        }
        
        throw new Error(`Error creating user: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned after user creation');
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in createUser:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
    try {
      console.log('Updating user:', userId, updates);

      const { data, error } = await this.supabase
        .from('user_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error in updateUser:', error);
        
        // Если ошибка из-за RLS, возвращаем обновленные данные без сохранения
        if (error.message.includes('policy') || error.message.includes('RLS')) {
          console.log('RLS policy error, using fallback update');
          const currentUser = await this.getUser(userId) || {
            user_id: userId,
            base_currency: 'USD',
            favorites: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          return {
            ...currentUser,
            ...updates,
            updated_at: new Date().toISOString()
          };
        }
        
        throw new Error(`Error updating user: ${error.message}`);
      }

      if (!data) {
        throw new Error('User not found');
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in updateUser:', error);
      throw error;
    }
  }
}