import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFormattedDate } from "util/constants";

interface DBStorage {
  priorityQueueStorage: string;
  lastUpdated: number;
  preferredPeerId: string | null;
  dateOfStorage: string; 
  setPreferredPeer: (id: string | null) => void;
  syncWithPeer: (incomingData: string) => void;
  updatePriorityQueueStorage: (incomingData: string) => void;
}

export const useStorageP2P  = create<DBStorage>()(
  persist(
    (set, get) => ({
      priorityQueueStorage: "",
      lastUpdated: 0, 
      preferredPeerId: null,
      dateOfStorage: getFormattedDate(), 
      setPreferredPeer: (id: string | null) => set({ preferredPeerId: id }),
      syncWithPeer: (incomingData: string) => {
        const localTime = get().lastUpdated;
        // If the peer's data is newer, accept it
        // if (incomingData.lastUpdated > localTime) {
        //   set({
        //     priorityQueueStorage: incomingData.priorityQueueStorage,
        //     lastUpdated: incomingData.lastUpdated
        //   });
      },
      updatePriorityQueueStorage: (incomingData: string) => {
        set({
          priorityQueueStorage: incomingData
        });
        return true;
      }
    }),
    {
      name: "fcfm-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  ),
);