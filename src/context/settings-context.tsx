'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { DEFAULT_SETTINGS, updateUserSettings, type UserSettings } from '@/lib/user-settings';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (category: keyof UserSettings, key: string, value: any) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const settingsRef = doc(db, 'users', user.uid, 'settings');
    const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserSettings;
        setSettings({
            ...DEFAULT_SETTINGS,
            ...data,
            personality: { 
                ...DEFAULT_SETTINGS.personality, 
                ...(data.personality || {}) 
            },
            appearance: { 
                ...DEFAULT_SETTINGS.appearance, 
                ...(data.appearance || {}) 
            },
        });
      }
      setLoading(false);
    }, (error) => {
        console.error("Settings listener error:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateSettings = async (category: keyof UserSettings, key: string, value: any) => {
    if (!user) return;
    const updatedCategory = { ...settings[category], [key]: value };
    await updateUserSettings(user.uid, { [category]: updatedCategory });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
