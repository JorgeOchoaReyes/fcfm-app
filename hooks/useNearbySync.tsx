import { useState, useEffect, useCallback } from "react";
import * as Nearby from "expo-nearby-connections";
import { useStorageP2P } from "../hooks/useStorage";

export const useNearbySync = () => {
  const { 
    preferredPeerId, 
    connectedPeerId,
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
    setIsSearching(true);
    try {  
      await Nearby.stopDiscovery();
      await Nearby.stopAdvertise(); 
      if(isHub) {
        await Nearby.startAdvertise(deviceId || "Unknown Device");
      } else {
        await Nearby.startDiscovery(deviceId || "Unknown Device");
      }
    } catch (e) {
      console.error("P2P Init Error:", e);
    }
  }, [setIsSearching, isHub, deviceId]);

  const stopP2P = useCallback(async () => {
    try {
      await Nearby.stopDiscovery();
      await Nearby.stopAdvertise();
      setIsSearching(false);
      setDiscoveredPeers([]);
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
    const inviteSub = Nearby.onInvitationReceived(async (event) => {  
      if (["BOH", "FOH"].includes(event.name)) {  
        await Nearby.acceptConnection(event.peerId); 
      }  
    });
 
    const connectSub = Nearby.onConnected((event) => { 
      setIsConnected(true);
      setConnectedPeerId(event.peerId);
      setConnectedPeerName(event.name);
      setIsSearching(false);   
    });
 
    const textSub = Nearby.onTextReceived((event) => {
      console.log("📩 New Message Received:", event.text);
    });

    const foundSub = Nearby.onPeerFound(async (event) => { 
      setDiscoveredPeers(prev => {
        const exists = prev.find(p => p.peerId === event.peerId);
        return exists ? prev : [...prev, event];
      });
      if(["BOH", "FOH"].includes(event.name)) {
        try { 
          if(connectedPeerId === null) {
            await Nearby.requestConnection(event.peerId);  
          }
        } catch (e) {
          console.error("Request Connection Error:", e);
        }
      }
    });

    const lostSub = Nearby.onPeerLost((event) => {
      setDiscoveredPeers(prev => prev.filter(p => p.peerId !== event.peerId));
      if (event.peerId === preferredPeerId || event.peerId === connectedPeerId) {
        setIsConnected(false);
        setConnectedPeerId(null);
        setConnectedPeerName("");
      }
    });

    const disconnectSub = Nearby.onDisconnected((event) => { 
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
  }, [startP2P, preferredPeerId, setConnectedPeerId, setConnectedPeerName, setIsConnected, setIsSearching, connectedPeerId]);
 
  const clearDiscoveredPeers = useCallback(() => {
    setDiscoveredPeers([]);
  }, []);

  return { 
    connectedPeer: isConnected ? preferredPeerId : null, // or use your state variable
    isSearching, 
    discoveredPeers, 
    startP2P, 
    stopP2P, 
    disconnect,  
    clearDiscoveredPeers
  };
};