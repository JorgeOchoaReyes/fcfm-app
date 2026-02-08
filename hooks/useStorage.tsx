import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage"; 

interface DBStorage {   
  
  preferredPeerId: string | null;
  deviceId: string; 

  connectedPeerId: string | null;
  connectedPeerName: string;
  
  isSearching: boolean;
  isConnected: boolean;
  isHub: boolean;
  showChinese: boolean;
 
  setIsConnected: (connected: boolean) => void;
  setDeviceId: (id: string) => void;
  setConnectedPeerId: (id: string | null) => void;
  setConnectedPeerName: (name: string) => void;
  setIsSearching: (searching: boolean) => void;
  setPreferredPeer: (id: string | null) => void;  
  clearStorage: () => void; 
  setIsHub: (hub: boolean) => void;
  setShowChinese: (showChinese: boolean) => void;
}

export const useStorageP2P  = create<DBStorage>()(
  persist(
    (set, get) => ({ 
      preferredPeerId: null, 
      
      deviceId: "",  
      connectedPeerId: null,
      connectedPeerName: "",
      isSearching: false,
      isConnected: false,
      isHub: false,
      showChinese: false,
       
      setDeviceId: (id: string) => set({ deviceId: id }),
      setShowChinese: (showChinese: boolean) => set({ showChinese: showChinese }),

      setConnectedPeerId: (id: string | null) => set({ connectedPeerId: id }),
      setConnectedPeerName: (name: string) => set({ connectedPeerName: name }),
      setPreferredPeer: (id: string | null) => set({ preferredPeerId: id }),
      setIsHub: (hub: boolean) => set({ isHub: hub }),

      setIsConnected: (connected: boolean) => set({ isConnected: connected }),
      setIsSearching: (searching: boolean) => set({ isSearching: searching }),

      clearStorage: () => {
        set({ 
          preferredPeerId: null, 
          deviceId: "", 
          connectedPeerId: null,
          connectedPeerName: "",
          isSearching: false,
          isConnected: false,
          isHub: false,
        });  
      }, 
    }),
    {
      name: "fcfm-settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  ),
);