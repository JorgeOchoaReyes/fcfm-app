import { useState, useEffect, useCallback, useRef } from "react";
import * as Nearby from "expo-nearby-connections";
import { useStorageP2P } from "../hooks/useStorage";

export const useNearbySync = () => {
  const { 
    preferredPeerId, 
    syncWithPeer, 
    connectedPeer, 
    setConnectedPeer, 
    deviceId,
    deviceName,
    setDeviceName,
    isSearching, 
    setIsSearching,
    isConnected,
    setIsConnected
  } = useStorageP2P();
  const [discoveredPeers, setDiscoveredPeers] = useState<Nearby.BasePeer[]>([]);
   
  useEffect(() => {
    setIsConnected(!!connectedPeer);
  }, [connectedPeer]);
 
  const startP2P = useCallback(async () => {
    if (isConnected) return;
    
    setIsSearching(true);
    try { 
      alert("Braodcasting as: " + deviceId);
      await Nearby.stopDiscovery();
      await Nearby.stopAdvertise(); 
      await Nearby.startAdvertise(deviceId || "Unknown Device", Nearby.Strategy.P2P_CLUSTER);
      await Nearby.startDiscovery(deviceId || "Unknown Device", Nearby.Strategy.P2P_CLUSTER);
    } catch (e) {
      console.error("P2P Init Error:", e);
    }
  }, [setIsSearching, deviceId, isConnected]);

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
    const inviteSub = Nearby.onInvitationReceived( async (event) => {
      console.log(`Handshake initiated with ${event.peerId}`); 
      if (!preferredPeerId || event.peerId === preferredPeerId) {
        await Nearby.acceptConnection(event.peerId);
        setIsConnected(true);
        setConnectedPeer(event.peerId);
        setDeviceName(event.name);
        setIsSearching(false); 
      } else {
        if(event.name === "BOH" || event.name === "FOH") {
          await Nearby.acceptConnection(event.peerId);
          setIsConnected(true);
          setConnectedPeer(event.peerId);
          setDeviceName(event.name);
          setIsSearching(false); 
        }
      }
    });

    const foundSub = Nearby.onPeerFound( async (event) => {
      // if (!preferredPeerId || event.peerId === preferredPeerId) {
      //   await Nearby.acceptConnection(event.peerId);
      //   setIsConnected(true);
      //   setConnectedPeer(event.peerId);
      //   setIsSearching(false); 
      // } else {
      //   if(event.name === "BOH" || event.name === "FOH") {
      //     await Nearby.acceptConnection(event.peerId);
      //     setIsConnected(true);
      //     setConnectedPeer(event.peerId);
      //     setIsSearching(false); 
      //   }
      // }
      const peer = discoveredPeers.find(p => p.peerId === event.peerId);
      if (!peer) {
        setDiscoveredPeers(prev => [...prev, event]);
      }
      setIsSearching(false);
    });

    const lostSub = Nearby.onPeerLost((event) => {
      console.log(`Peer lost: ${event.peerId}`);
      setIsConnected(false);
      setConnectedPeer(null);
      setDeviceName("");
      alert(`Peer lost: ${event.peerId}`);
      setDiscoveredPeers(prev => prev.filter(p => p.peerId !== event.peerId));
    });

    const connectSub = Nearby.onConnected((event) => {
      setIsConnected(true);
      setConnectedPeer(event.peerId);
      setDeviceName(event.name);
      setIsSearching(false); 
      alert("Connected to " + event.peerId + " " + event.name);
    });

    const disconnectSub = Nearby.onDisconnected(() => {
      setIsConnected(false);
      setConnectedPeer(null);
      setDeviceName("");
      alert("Disconnected");
      startP2P(); 
    });

    const payloadSub = Nearby.onTextReceived((event) => {
      const incomingData = JSON.parse(event.text);
      syncWithPeer(incomingData);
    });

    startP2P();

    return () => { 
      lostSub();
      foundSub();
      connectSub();
      disconnectSub();
      inviteSub();
      payloadSub();
      Nearby.stopDiscovery();
      Nearby.stopAdvertise();
    };
  }, [startP2P, preferredPeerId, setConnectedPeer, setIsSearching, syncWithPeer]);

  const syncData = async (targetId: string) => {
    const state = {
      head: "",
      nodes: [],
      lastUpdated: Date.now()
    };
    const dataToSend = JSON.stringify({
      head: state.head,
      nodes: state.nodes,
      lastUpdated: state.lastUpdated
    });
    await Nearby.sendText(targetId, dataToSend);
  };

  return { connectedPeer, isSearching, discoveredPeers, startP2P, stopP2P, disconnect, syncData };
};