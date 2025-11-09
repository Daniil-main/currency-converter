export interface UserSettings {
  user_id: string;
  base_currency: string;
  favorites: string[];
  created_at: string;
  updated_at: string;
}

export interface UserCreateRequest {
  base_currency?: string;
  favorites?: string[];
}