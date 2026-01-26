import { useState, useEffect, useCallback, useRef } from "react";
import * as Nearby from "expo-nearby-connections";
import { useStorageP2P } from "../hooks/useStorage";

export const useNearbySync = () => {
  const { 
    preferredPeerId, 
    syncWithPeer, 
    connectedPeer, 
    setConnectedPeer, 
    isSearching, 
    setIsSearching 
  } = useStorageP2P();
  const [discoveredPeers, setDiscoveredPeers] = useState<Nearby.BasePeer[]>([]);
  
  const isConnected = useRef(false);

  useEffect(() => {
    isConnected.current = !!connectedPeer;
  }, [connectedPeer]);
 
  const startP2P = useCallback(async () => {
    if (isConnected.current) return;
    
    setIsSearching(true);
    try { 
      await Nearby.stopDiscovery();
      await Nearby.stopAdvertise(); 
      await Nearby.startAdvertise("fcfm_panda", Nearby.Strategy.P2P_CLUSTER);
      await Nearby.startDiscovery("fcfm_panda", Nearby.Strategy.P2P_CLUSTER);
    } catch (e) {
      console.error("P2P Init Error:", e);
    }
  }, [setIsSearching]);

  useEffect(() => {
    const inviteSub = Nearby.onInvitationReceived((event) => {
      console.log(`Handshake initiated with ${event.peerId}`); 
      if (!preferredPeerId || event.peerId === preferredPeerId) {
        Nearby.acceptConnection(event.peerId);
      } 
    });

    const foundSub = Nearby.onPeerFound((event) => {
      if (!preferredPeerId || event.peerId === preferredPeerId) {
        Nearby.acceptConnection(event.peerId);
      }
      setDiscoveredPeers(prev => [...prev, event]);
      setIsSearching(false);
    });

    const lostSub = Nearby.onPeerLost((event) => {
      console.log(`Peer lost: ${event.peerId}`);
      setDiscoveredPeers(prev => prev.filter(p => p.peerId !== event.peerId));
    });

    const connectSub = Nearby.onConnected((event) => {
      isConnected.current = true;
      setConnectedPeer(event.peerId);
      setIsSearching(false);
      syncData(event.peerId);
    });

    const disconnectSub = Nearby.onDisconnected(() => {
      isConnected.current = false;
      setConnectedPeer(null);
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

  const syncData = (targetId: string) => {
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
    Nearby.sendText(targetId, dataToSend);
  };

  return { connectedPeer, isSearching, discoveredPeers, startP2P, syncData };
};