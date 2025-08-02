
import type { Profile } from '../entities/profile';

export interface IProfileRepository {
  getProfile(token: string): Promise<{ profile: Profile | null; isSubscribed: boolean }>;
  saveProfile(token: string, profile: Profile): Promise<Profile>;
}
