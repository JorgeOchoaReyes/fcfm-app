import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DBStorage {
  priorityQueueStorage: string;
  lastUpdated: number;
  preferredPeerId: string | null;
  setPreferredPeer: (id: string | null) => void;
  syncWithPeer: (incomingData: string) => void;
}

export const useStorage = create<DBStorage>()(
  persist(
    (set, get) => ({
      priorityQueueStorage: "",
      lastUpdated: 0, 
      preferredPeerId: null,
      setPreferredPeer: (id: string | null) => set({ preferredPeerId: id }),
      syncWithPeer: (incomingData: string) => {
        const localTime = get().lastUpdated;
        // If the peer's data is newer, accept it
        // if (incomingData.lastUpdated > localTime) {
        //   set({
        //     priorityQueueStorage: incomingData.priorityQueueStorage,
        //     lastUpdated: incomingData.lastUpdated
        //   });
      }
    }),
    {
      name: "fcfm-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  ),
);