export interface User {
  id: string;
  email: string;
  password_hash?: string;
  created_at: Date;
}
