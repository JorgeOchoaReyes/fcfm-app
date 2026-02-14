import { useCallback, useEffect, useRef } from "react";
import { usePriorityQueue } from "./usePriority-Queue";
import * as Nearby from "expo-nearby-connections"; 
import { useAudioPlayer } from "expo-audio";
import { useStorageP2P } from "./useStorage";

const clickSoundSource = require("../assets/bell-sfx.mp3");

/**
 * Syncs the priority queue between peers using expo-nearby-connections and zustand store.
 */
export const useStoreSync = (connectedPeerId: string | null) => {
  const isInternalUpdate = useRef(false);
  const player = useAudioPlayer(clickSoundSource);
  const setIsConnected = useStorageP2P(state => state.setIsConnected);
  const setConnectedPeerId = useStorageP2P(state => state.setConnectedPeerId);
  const setConnectedPeerName = useStorageP2P(state => state.setConnectedPeerName);

  const playSFX = useCallback(async () => { 
    try { 
      if (player.playing) {
        player.pause();
      } 
      await player.seekTo(0);
      player.play();  
    } catch (error) {
      alert("Error playing SFX");
      console.error("Error playing SFX:", error);
    }
  }, [player]); 

  useEffect(() => {
    if (!connectedPeerId) return;
 
    const unsubscribeStore = usePriorityQueue.subscribe(async (state, prevState) => {
      if (isInternalUpdate.current) {
        isInternalUpdate.current = false;
        return;
      }  

      try {
        await Nearby.sendText(connectedPeerId, JSON.stringify({
          type: "SYNC_STATE",
          state: state,  
        }));
      } catch (e) {
        setIsConnected(false);
        setConnectedPeerId(null);
        setConnectedPeerName("");
        alert("You are not connected!");
        console.error("Sync error", e);
      }
    });
 
    const unsubscribeNearby = Nearby.onTextReceived(async (event) => {
      try { 
        const payload = JSON.parse(event.text);
        if (payload.type === "SYNC_STATE") {
          const remoteState = payload.state;
          const localState = usePriorityQueue.getState();
 
          if (remoteState.lastUpdated > localState.lastUpdated) {  
            if(Object.keys(remoteState.instanceTracker).length > Object.keys(localState.instanceTracker).length) { 
              await playSFX(); 
            }
            isInternalUpdate.current = true;
            usePriorityQueue.setState(remoteState);
          } else { 
            console.log("Local is newer, ignoring remote sync.");
          }
        }
      } catch (e) {
        console.error("Sync error", e);
      }
    });

    return () => {
      unsubscribeStore();
      unsubscribeNearby();
    };
  }, [connectedPeerId, playSFX, setConnectedPeerId, setConnectedPeerName, setIsConnected]);
};