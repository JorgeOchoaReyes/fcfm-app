import { useCallback, useEffect, useRef } from "react"; 
import { useStorageP2P } from "./useStorage";
import * as Nearby from "expo-nearby-connections"; 
import { AppState, AppStateStatus } from "react-native";
import { usePriorityQueue } from "./usePriority-Queue";

export const useReconnect = () => {
  const isConnected = useStorageP2P(state => state.isConnected);
  const isSearching = useStorageP2P(state => state.isSearching);
  const isHub = useStorageP2P(state => state.isHub);
  const deviceId = useStorageP2P(state => state.deviceId);
  const setConnectedPeerId = useStorageP2P(state => state.setConnectedPeerId);
  const setIsConnected = useStorageP2P(state => state.setIsConnected);
  const setIsSearching = useStorageP2P(state => state.setIsSearching);
  const setConnectedPeerName = useStorageP2P(state => state.setConnectedPeerName); 
  
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const attemptReconnect = useCallback(async () => {
    if (isConnected) return; 

    try {
      setIsSearching(true);
      if(isHub) {
        await Nearby.startAdvertise(deviceId);
      } else {
        await Nearby.startDiscovery(deviceId);
      }
    } catch (e) {
      console.error("Error starting P2P during reconnect:", e);
      setIsSearching(false);
    }
  }, [isConnected, isHub, deviceId, setIsSearching]);

  
  useEffect(() => { 
    const peersFound = Nearby.onPeerFound(async (event) => {
      if (["BOH", "FOH"].includes(event.name)) {
        try {
          await Nearby.requestConnection(event.peerId);
        } catch (e) {
          console.error("Error requesting connection in useReconnect:", e);
        }
      }
    });

    const inviteSub = Nearby.onInvitationReceived(async (event) => {  
      if (["BOH", "FOH"].includes(event.name)) { 
        try {
          await Nearby.acceptConnection(event.peerId); 
        } catch (e) {
          console.error("Error accepting connection in useReconnect:", e);
        }
      }  
    });

    const disconnectSub = Nearby.onDisconnected(() => { 
      setIsConnected(false);
      setIsSearching(false); 
      setConnectedPeerId(null);
      setConnectedPeerName("");

      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = setTimeout(() => {
        attemptReconnect();
      }, 3000);
    });    

    const appStateSub = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") { 
        if (!isConnected) {
          attemptReconnect();
        }
      }
    });

    const connectedSub = Nearby.onConnected(async (event) => {
      setConnectedPeerId(event.peerId);
      setConnectedPeerName(event.name);
      setIsConnected(true);
      setIsSearching(false);
 
      // If we are connected and are the hub we are the main DB so send our db
      if(isHub) {
        await Nearby.sendText(event.peerId, JSON.stringify({
          type: "SYNC_STATE",
          state: usePriorityQueue.getState(),
          mutation: "OTHER",
        }));
      }

    });

    if (!isConnected && !isSearching) {
      attemptReconnect();
    }

    return () => {  
      disconnectSub();
      inviteSub(); 
      peersFound();
      connectedSub();
      appStateSub.remove();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [setIsConnected, setIsSearching, setConnectedPeerId, setConnectedPeerName, isConnected, attemptReconnect, isSearching]);
  
};