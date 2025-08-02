
// This is a placeholder service. In a real application, this would
// interact with a database.

type Profile = {
  id: number;
  userId: string;
  name: string;
  gender: string;
  weight: number | string;
  goals: string;
  birthDate: Date | null;
};

// Placeholder in-memory "database"
let profiles: Profile[] = [];
let nextId = 1;

export async function getProfilesByUserId(userId: string): Promise<Profile[]> {
  return profiles.filter(p => p.userId === userId);
}

export async function getProfileById(id: number, userId: string): Promise<Profile | null> {
  const profile = profiles.find(p => p.id === id && p.userId === userId);
  return profile || null;
}

export async function createProfile(profileData: Omit<Profile, 'id'>): Promise<Profile> {
    const existingProfile = profiles.find(p => p.userId === profileData.userId);
    if(existingProfile) {
        // In a real app, you might throw an error or handle this differently
        console.warn("User already has a profile. Overwriting for placeholder purposes.");
        Object.assign(existingProfile, profileData);
        return existingProfile;
    }

  const newProfile: Profile = {
    ...profileData,
    id: nextId++,
  };
  profiles.push(newProfile);
  return newProfile;
}

export async function updateProfile(id: number, userId: string, profileData: Partial<Profile>): Promise<boolean> {
  const profileIndex = profiles.findIndex(p => p.id === id && p.userId === userId);
  if (profileIndex === -1) {
    return false;
  }
  profiles[profileIndex] = { ...profiles[profileIndex], ...profileData };
  return true;
}

export async function deleteProfile(id: number, userId: string): Promise<boolean> {
    const initialLength = profiles.length;
    profiles = profiles.filter(p => !(p.id === id && p.userId === userId));
    return profiles.length < initialLength;
}
