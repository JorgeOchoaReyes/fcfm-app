import { useState, useEffect, useCallback, useRef } from "react";
import * as Nearby from "expo-nearby-connections";
import { useStorage } from "../hooks/useStorage";

export const useNearbySync = (userName: string) => {
  const [connectedPeer, setConnectedPeer] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { preferredPeerId, syncWithPeer } = useStorage();
  
  const isConnected = useRef(false);

  // 1. Service Management: Stops and restarts all radios
  const startP2P = useCallback(async () => {
    if (isConnected.current) return;
    
    setIsSearching(true);
    try { 
      await Nearby.stopDiscovery();
      await Nearby.stopAdvertise();

      // We use P2P_CLUSTER to allow any device to be both seeker and hub
      await Nearby.startAdvertise(userName, Nearby.Strategy.P2P_CLUSTER);
      await Nearby.startDiscovery(userName, Nearby.Strategy.P2P_CLUSTER);
    } catch (e) {
      console.error("P2P Init Error:", e);
    }
  }, [userName]);

  useEffect(() => {
    // A. AUTO-ACCEPT HANDSHAKE
    // This is the "Second Device" logic you asked for.
    const inviteSub = Nearby.onInvitationReceived((event) => {
      console.log(`Handshake initiated with ${event.peerId}`);
      
      // If we have a preferred device, only auto-accept that one.
      // If no preferred device is set, auto-accept everyone (simplest for 2 users).
      if (!preferredPeerId || event.peerId === preferredPeerId) {
        Nearby.acceptConnection(event.peerId);
      } 
    });

    // B. Peer Found (Auto-Connect)
    const foundSub = Nearby.onPeerFound((event) => {
      // If this is our "Trusted" device, or we don't have one yet, try to connect
      if (!preferredPeerId || event.peerId === preferredPeerId) {
        Nearby.acceptConnection(event.peerId);
      }
    });

    // C. Connection Success
    const connectSub = Nearby.onConnected((event) => {
      isConnected.current = true;
      setConnectedPeer(event.peerId);
      setIsSearching(false);
      
      // Send initial data sync
      syncData(event.peerId);
    });

    // D. Auto-Reconnect on drop
    const disconnectSub = Nearby.onDisconnected(() => {
      isConnected.current = false;
      setConnectedPeer(null);
      startP2P(); 
    });

    // E. Data Exchange
    const payloadSub = Nearby.onTextReceived((event) => {
      const incomingData = JSON.parse(event.text);
      syncWithPeer(incomingData);
    });

    startP2P();

    return () => {
    //   inviteSub.remove();
    //   foundSub.remove();
    //   connectSub.remove();
    //   disconnectSub.remove();
    //   payloadSub.remove(); 
      Nearby.stopDiscovery();
      Nearby.stopAdvertise();
    };
  }, [startP2P, preferredPeerId]);

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

  return { connectedPeer, isSearching, syncData };
};