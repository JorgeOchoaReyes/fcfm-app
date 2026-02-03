import { useState, useEffect, useCallback, useRef } from "react";
import * as Nearby from "expo-nearby-connections";
import { useStorageP2P } from "../hooks/useStorage";

export const useNearbySync = () => {
  const { 
    preferredPeerId, 
    setConnectedPeer, 
    deviceId,
    setDeviceName,
    setIsSearching,
    isConnected,
    isSearching,
    setIsConnected
  } = useStorageP2P();

  const [discoveredPeers, setDiscoveredPeers] = useState<Nearby.BasePeer[]>([]);

  const startP2P = useCallback(async () => {
    // Note: Removed the isConnected guard here to allow re-broadcast if one side drops
    setIsSearching(true);
    try { 
      // Stop any existing processes to clear the internal state
      await Nearby.stopDiscovery();
      await Nearby.stopAdvertise(); 
      
      // Using your deviceId as the "Service ID" as well as the name
      await Nearby.startAdvertise(deviceId || "Unknown Device", Nearby.Strategy.P2P_CLUSTER);
      await Nearby.startDiscovery(deviceId || "Unknown Device", Nearby.Strategy.P2P_CLUSTER);
      console.log("P2P Started as:", deviceId);
    } catch (e) {
      console.error("P2P Init Error:", e);
    }
  }, [setIsSearching, deviceId]);

  const stopP2P = useCallback(async () => {
    try {
      await Nearby.stopDiscovery();
      await Nearby.stopAdvertise();
      setIsSearching(false);
    } catch (e) {
      console.error("Stop P2P Error:", e);
    }
  }, [setIsSearching]);

  const disconnect = useCallback(async (peerId: string) => {
    try {
      await Nearby.disconnect(peerId);
      setIsConnected(false);
      setConnectedPeer(null);
      setDeviceName("");
    } catch (e) {
      console.error("Disconnect Error:", e);
    }
  }, [setIsConnected, setConnectedPeer, setDeviceName]);

  useEffect(() => {
    // 1. The Handshake Request
    const inviteSub = Nearby.onInvitationReceived(async (event) => { 
      // Only accept if it matches your specific logic
      if (!preferredPeerId || event.peerId === preferredPeerId || ["BOH", "FOH"].includes(event.name)) {
        console.log("Accepting invitation from:", event.name);
        await Nearby.acceptConnection(event.peerId); 
      }  
    });

    // 2. The Confirmation (The "Actually Connected" state)
    const connectSub = Nearby.onConnected((event) => {
      console.log(`✅ Connection established with ${event.name} (${event.peerId})`);
      alert(`✅ Connection established with ${event.name} (${event.peerId})`);
      setIsConnected(true);
      setConnectedPeer(event.peerId);
      setDeviceName(event.name);
      setIsSearching(false); 
    });

    // 3. THE MISSING PIECE: Listening for incoming sync data
    const textSub = Nearby.onTextReceived((event) => {
      console.log("📩 New Message Received:", event.text);
      try {
        const data = JSON.parse(event.text);
        // Here is where you'd call your internal sync logic, e.g.:
        // updateLocalState(data.nodes);
        alert(`Sync received from ${event.peerId}`);
      } catch (e) {
        console.error("Failed to parse incoming sync text", e);
      }
    });

    const foundSub = Nearby.onPeerFound((event) => { 
      setDiscoveredPeers(prev => {
        const exists = prev.find(p => p.peerId === event.peerId);
        return exists ? prev : [...prev, event];
      });
    });

    const lostSub = Nearby.onPeerLost((event) => {
      setDiscoveredPeers(prev => prev.filter(p => p.peerId !== event.peerId));
      if (event.peerId === preferredPeerId) {
        setIsConnected(false);
        setConnectedPeer(null);
      }
    });

    const disconnectSub = Nearby.onDisconnected((event) => {
      console.log("Disconnected from:", event.peerId);
      setIsConnected(false);
      setConnectedPeer(null);
      setDeviceName("");
      // Restart broadcasting to allow reconnection
      startP2P(); 
    }); 

    startP2P();

    return () => { 
      inviteSub();
      connectSub();
      textSub();
      foundSub();
      lostSub();
      disconnectSub();
      Nearby.stopDiscovery();
      Nearby.stopAdvertise();
    };
  }, [startP2P, preferredPeerId, setConnectedPeer, setIsConnected, setIsSearching, setDeviceName]);

  const syncData = async (targetId: string) => {
    if (!targetId || !isConnected) {
      console.warn("Attempted to sync while disconnected");
      return;
    }

    const dataToSend = JSON.stringify({
      head: "", // Populate these as needed
      nodes: [],
      lastUpdated: Date.now()
    });

    try {
      await Nearby.sendText(targetId, dataToSend);
      console.log("✈️ Data sent successfully to:", targetId);
    } catch (e) {
      console.error("Sync Send Error:", e);
    }
  };

  return { 
    connectedPeer: isConnected ? preferredPeerId : null, // or use your state variable
    isSearching, 
    discoveredPeers, 
    startP2P, 
    stopP2P, 
    disconnect, 
    syncData 
  };
};