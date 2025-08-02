
import type { IProfileRepository } from '../repositories/profile-repository';
import type { Profile } from '../entities/profile';

export class ProfileService {
  constructor(private profileRepository: IProfileRepository) {}

  async getProfile(token: string): Promise<{ profile: Profile | null; isSubscribed: boolean }> {
    return this.profileRepository.getProfile(token);
  }

  async saveProfile(token: string, profile: Profile): Promise<Profile> {
    // Business logic can go here, e.g. validation
    if (!profile.name) {
      throw new Error('Name is required.');
    }
    return this.profileRepository.saveProfile(token, profile);
  }
}
