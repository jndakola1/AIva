import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type PersonalitySettings = {
  tone: 'friendly' | 'professional' | 'witty' | 'concise';
  enableHumor: boolean;
  name: string;
};

export type AppearanceSettings = {
  theme: 'light' | 'dark' | 'system';
};

export type UserSettings = {
  personality: PersonalitySettings;
  appearance: AppearanceSettings;
};

export const DEFAULT_SETTINGS: UserSettings = {
  personality: {
    tone: 'friendly',
    enableHumor: true,
    name: 'AIva',
  },
  appearance: {
    theme: 'dark',
  },
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
    // Deep merge with defaults to ensure all keys are present
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
    };
  } else {
    // No settings found, return defaults
    return DEFAULT_SETTINGS;
  }
}

/**
 * Updates user settings in Firestore.
 * This performs a deep merge of the provided settings.
 */
export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
  const settingsRef = doc(db, 'users', userId, 'settings');
  await setDoc(settingsRef, settings, { merge: true });
}
