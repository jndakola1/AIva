import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type PersonalitySettings = {
  tone: 'friendly' | 'professional' | 'witty' | 'concise';
  enableHumor: boolean;
  name: string;
};

export type AppearanceSettings = {
  theme: 'light' | 'dark' | 'system';
  primaryColor: 'orange' | 'blue' | 'green' | 'purple';
};

export type UserSettings = {
  personality: PersonalitySettings;
  appearance: AppearanceSettings;
  tier: 'free' | 'pro';
};

export const DEFAULT_SETTINGS: UserSettings = {
  personality: {
    tone: 'friendly',
    enableHumor: true,
    name: 'AIva',
  },
  appearance: {
    theme: 'dark',
    primaryColor: 'orange',
  },
  tier: 'free',
};

/**
 * Fetches user settings from Firestore.
 * Returns default settings if no settings are found.
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  const settingsRef = doc(db, 'users', userId, 'settings');
  const docSnap = await getDoc(settingsRef);

  if (docSnap.exists()) {
    const dbSettings = docSnap.data() as Partial<UserSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...dbSettings,
      personality: {
        ...DEFAULT_SETTINGS.personality,
        ...(dbSettings.personality || {}),
      },
      appearance: {
        ...DEFAULT_SETTINGS.appearance,
        ...(dbSettings.appearance || {}),
      },
      tier: dbSettings.tier || 'free',
    };
  } else {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Updates user settings in Firestore.
 */
export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
  const settingsRef = doc(db, 'users', userId, 'settings');
  await setDoc(settingsRef, settings, { merge: true });
}
