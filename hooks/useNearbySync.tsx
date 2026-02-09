import { useState, useEffect, useCallback, useRef } from "react";
import * as Nearby from "expo-nearby-connections";
import { useStorageP2P } from "../hooks/useStorage";

export const useNearbySync = () => {
  const { 
    preferredPeerId, 
    setConnectedPeerId, 
    deviceId, 
    setIsSearching,
    setConnectedPeerName,
    isConnected,
    isSearching,
    setIsConnected,
    isHub
  } = useStorageP2P();

  const [discoveredPeers, setDiscoveredPeers] = useState<Nearby.BasePeer[]>([]);

  const startP2P = useCallback(async () => {
    // Note: Removed the isConnected guard here to allow re-broadcast if one side drops
    setIsSearching(true);
    try {  
      await Nearby.stopDiscovery();
      await Nearby.stopAdvertise(); 

      if(isHub) {
        await Nearby.startAdvertise(deviceId || "Unknown Device");
      } else {
        await Nearby.startDiscovery(deviceId || "Unknown Device");
      }
       
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
      setConnectedPeerId(null);
      setConnectedPeerName("");
    } catch (e) {
      console.error("Disconnect Error:", e);
    }
  }, [setIsConnected, setConnectedPeerId, setConnectedPeerName]);

  useEffect(() => {
    // 1. The Handshake Request
    const inviteSub = Nearby.onInvitationReceived(async (event) => { 
      // Only accept if it matches your specific logic
      if (!preferredPeerId || event.peerId === preferredPeerId || ["BOH", "FOH"].includes(event.name)) {
        console.log("Accepting invitation from:", event.name);
        try {
          await Nearby.acceptConnection(event.peerId); 
        } catch (e) {
          alert("Error accepting connection: " + e);
        }
      }  
    });

    // 2. The Confirmation (The "Actually Connected" state)
    const connectSub = Nearby.onConnected((event) => {
      console.log(`✅ Connection established with ${event.name} (${event.peerId})`);
      alert(`✅ Connection established with ${event.name} (${event.peerId})`);
      setIsConnected(true);
      setConnectedPeerId(event.peerId);
      setConnectedPeerName(event.name);
      setIsSearching(false);  
    });

    // 3. THE MISSING PIECE: Listening for incoming sync data
    const textSub = Nearby.onTextReceived((event) => {
      console.log("📩 New Message Received:", event.text);
      try {
        
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
        setConnectedPeerId(null);
        setConnectedPeerName("");
      }
    });

    const disconnectSub = Nearby.onDisconnected((event) => {
      console.log("Disconnected from:", event.peerId);
      setIsConnected(false);
      setConnectedPeerId(null);
      setConnectedPeerName(""); 
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
  }, [startP2P, preferredPeerId, setConnectedPeerId, setConnectedPeerName, setIsConnected, setIsSearching]);

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