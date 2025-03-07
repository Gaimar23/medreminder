import AsyncStorage from "@react-native-async-storage/async-storage";

const MEDICATION_KEY = "@medications";
const DOSE_HISTORY_KEY = "@dose_history";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: string;
  times: string[];
  notes: string;
  reminderEnable: boolean;
  refillReminder: boolean;
  currentSupply: number;
  totalSupply: number;
  refillAt: number;
  color: string;
  lastRefillDate?: string;
}

export interface DosageHistory {
  id: string;
  medicationId: string;
  timestamp: string;
  taken: boolean;
}

export async function getMedications(): Promise<Medication[]> {
  try {
    const data = await AsyncStorage.getItem(MEDICATION_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function addMedication(medication: Medication): Promise<void> {
  try {
    const medications = await getMedications();
    medications.push(medication);
    await AsyncStorage.setItem(MEDICATION_KEY, JSON.stringify(medications));
  } catch (error) {
    throw error;
  }
}

export async function getDoseHistory(): Promise<DosageHistory[]> {
  try {
    const data = await AsyncStorage.getItem(DOSE_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getTodaysDoses(): Promise<DosageHistory[]> {
  try {
    const history = await getDoseHistory();
    const today = new Date().toDateString();
    return history.filter(
      (dose) => new Date(dose.timestamp).toDateString() === today
    );
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function recordDose(
  medicationId: string,
  taken: boolean,
  timestamp: string
): Promise<void> {
  try {
    const history = await getDoseHistory();
    const newDose: DosageHistory = {
      id: Math.random().toString(36).substring(2, 9),
      medicationId,
      timestamp,
      taken,
    };

    history.push(newDose);
    await AsyncStorage.setItem(DOSE_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.log(error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([MEDICATION_KEY, DOSE_HISTORY_KEY]);
  } catch (error) {
    console.log("Error clearing data", error);
    throw error;
  }
}
