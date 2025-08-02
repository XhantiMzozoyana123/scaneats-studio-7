
import type { Profile } from './profile';

export interface IProfileRepository {
  getProfile(token: string): Promise<{ profile: Profile | null; isSubscribed: boolean }>;
  saveProfile(token: string, profile: Profile): Promise<Profile>;
}
