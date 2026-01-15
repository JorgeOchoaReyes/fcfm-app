import { useState, useEffect, useCallback, useRef } from "react";
import * as Nearby from "expo-nearby-connections";
// import { useListStore } from "./store";

export const useNearbySync = (userName: string) => {
  const [connectedPeer, setConnectedPeer] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Use a ref to track connection status for the retry logic
  const isConnected = useRef(false);

  // 1. Function to Start/Restart P2P Services
  const startP2P = useCallback(async () => {
    if (isConnected.current) return;
    
    console.log("Starting P2P Services...");
    setIsSearching(true);
    
    try { 
      await Nearby.stopDiscovery();
      await Nearby.stopAdvertise();

      await Nearby.startAdvertise(userName, Nearby.Strategy.P2P_STAR);
      await Nearby.startDiscovery(userName, Nearby.Strategy.P2P_STAR);
    } catch (e) {
      console.error("P2P Init Error:", e);
    }
  }, [userName]);

  useEffect(() => {
    // A. Handle Connection Requests
    const inviteSub = Nearby.onInvitationReceived((event) => {
      Nearby.acceptConnection(event.peerId);
    });

    // B. Handle Successful Connection
    const connectSub = Nearby.onConnected((event) => {
      console.log("Connected to:", event.peerId);
      isConnected.current = true;
      setConnectedPeer(event.peerId);
      setIsSearching(false);
      
      // Sync data immediately on connection
      syncData(event.peerId);
    });

    // C. Handle Disconnections (Crucial for Permanent Connection)
    const disconnectSub = Nearby.onDisconnected((event) => {
      console.log("Disconnected from peer. Restarting search...");
      isConnected.current = false;
      setConnectedPeer(null);
      startP2P(); // Auto-restart discovery/advertising
    });

    // D. Receive Data
    const payloadSub = Nearby.onTextReceived((event) => {
      const incomingData = JSON.parse(event.text);
    //   useListStore.getState().syncWithPeer(incomingData);
    });

    // E. Discovering Peers (Auto-connect when found)
    const foundSub = Nearby.onPeerFound((event) => {
      console.log("Peer found, requesting connection...");
      Nearby.acceptConnection(event.peerId);
    });

    // Initial Start
    startP2P();

    return () => {
    //   inviteSub.remove();
    //   connectSub.remove();
    //   disconnectSub.remove();
    //   payloadSub.remove();
    //   foundSub.remove();
      Nearby.stopDiscovery();
      Nearby.stopAdvertise();
    };
  }, [startP2P]);

  const syncData = (targetId: string) => {
    const state = {
      head: "",
      nodes: [],
      lastUpdated: 0
    };
    const dataToSend = JSON.stringify({
      head: state.head,
      nodes: state.nodes,
      lastUpdated: state.lastUpdated
    });
    Nearby.sendText(targetId, dataToSend);
  };

  return { connectedPeer, isSearching, syncData };
};