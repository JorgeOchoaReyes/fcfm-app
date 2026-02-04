import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFormattedDate } from "util/constants"; 

interface DBStorage {
  priorityQueueStorage: string;
  dateOfStorage: string; 
  lastUpdated: number;
  
  preferredPeerId: string | null;
  deviceId: string; 

  connectedPeerId: string | null;
  connectedPeerName: string;
  
  isSearching: boolean;
  isConnected: boolean;
  isHub: boolean;
 
  setIsConnected: (connected: boolean) => void;
  setDeviceId: (id: string) => void;
  setConnectedPeerId: (id: string | null) => void;
  setConnectedPeerName: (name: string) => void;
  setIsSearching: (searching: boolean) => void;
  setPreferredPeer: (id: string | null) => void; 
  updatePriorityQueueStorage: (incomingData: string) => void;
  clearStorage: () => void;
  clearStorageDaily: () => void;
  setIsHub: (hub: boolean) => void;
}

export const useStorageP2P  = create<DBStorage>()(
  persist(
    (set, get) => ({
      priorityQueueStorage: "",
      lastUpdated: 0, 
      preferredPeerId: null,
      dateOfStorage: getFormattedDate(), 
      
      deviceId: "", 

      connectedPeerId: null,
      connectedPeerName: "",
      isSearching: false,
      isConnected: false,
      isHub: false,
       
      setDeviceId: (id: string) => set({ deviceId: id }),

      setConnectedPeerId: (id: string | null) => set({ connectedPeerId: id }),
      setConnectedPeerName: (name: string) => set({ connectedPeerName: name }),
      setPreferredPeer: (id: string | null) => set({ preferredPeerId: id }),
      setIsHub: (hub: boolean) => set({ isHub: hub }),

      setIsConnected: (connected: boolean) => set({ isConnected: connected }),
      setIsSearching: (searching: boolean) => set({ isSearching: searching }),

      updatePriorityQueueStorage: (incomingData: string) => {
        set({
          priorityQueueStorage: incomingData
        });
        return true;
      },
      clearStorage: () => {
        set({
          priorityQueueStorage: "",
          lastUpdated: 0,
          preferredPeerId: null,
          dateOfStorage: getFormattedDate(),
        });  
      },
      clearStorageDaily: () => {
        const currentDate = getFormattedDate();
        const storedDate = get().dateOfStorage;
        if (storedDate !== currentDate) {
          get().clearStorage();
        }
        set({
          dateOfStorage: currentDate
        });
      },
    }),
    {
      name: "fcfm-settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  ),
);