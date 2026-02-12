import { useCallback, useEffect, useRef } from "react";
import { usePriorityQueue } from "./usePriority-Queue";
import * as Nearby from "expo-nearby-connections"; 
import { useAudioPlayer } from "expo-audio";

const clickSoundSource = require("../assets/bell-sfx.mp3");

export const useStoreSync = (connectedPeerId: string | null) => {
  const isInternalUpdate = useRef(false);
  const player = useAudioPlayer(clickSoundSource);

  const playSFX = useCallback(() => {
    try {
      if (player.isLoaded) {
        player.seekTo(0);
      }

      player.play();
      console.log("Playing SFX");
    } catch (error) {
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

      const mutationIsAdd = state.instanceTracker.length > prevState.instanceTracker.length;

      await Nearby.sendText(connectedPeerId, JSON.stringify({
        type: "SYNC_STATE",
        state: state, 
        mutation: mutationIsAdd ? "ADD" : "OTHER",
      }));
    });
 
    const unsubscribeNearby = Nearby.onTextReceived((event) => {
      try { 
        const payload = JSON.parse(event.text);
        if (payload.type === "SYNC_STATE") {
          const remoteState = payload.state;
          const localState = usePriorityQueue.getState();
 
          if (remoteState.lastUpdated > localState.lastUpdated) { 
            isInternalUpdate.current = true;
            usePriorityQueue.setState(remoteState);
            if(payload.mutation === "ADD") {
              playSFX();
            }
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
  }, [connectedPeerId, playSFX]);
};