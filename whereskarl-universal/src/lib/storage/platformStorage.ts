import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export async function readStorageItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') {
        return null;
      }

      return localStorage.getItem(key);
    }

    return AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function writeStorageItem(
  key: string,
  value: string,
): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }

      return;
    }

    await AsyncStorage.setItem(key, value);
  } catch {
    // Ignore write failures — callers treat missing values as unset.
  }
}

export async function removeStorageItem(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }

      return;
    }

    await AsyncStorage.removeItem(key);
  } catch {
    // Ignore remove failures.
  }
}
