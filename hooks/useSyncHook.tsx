import { useEffect, useRef } from "react";
import { usePriorityQueue } from "./usePriority-Queue";
import * as Nearby from "expo-nearby-connections"; 

export const useStoreSync = (connectedPeerId: string | null) => {
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (!connectedPeerId) return;
 
    const unsubscribeStore = usePriorityQueue.subscribe(async (state) => {
      if (isInternalUpdate.current) {
        isInternalUpdate.current = false;
        return;
      }

      await Nearby.sendText(connectedPeerId, JSON.stringify({
        type: "SYNC_STATE",
        state: state
      }));
    });
 
    const unsubscribeNearby = Nearby.onTextReceived((event) => {
      try { 
        const payload = JSON.parse(event.text);
        if (payload.type === "SYNC_STATE") {
          const remoteState = payload.state;
          const localState = usePriorityQueue.getState();
 
          if (remoteState.lastUpdated > localState.lastUpdated) {
            console.log("Remote is newer, updating...");
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
  }, [connectedPeerId]);
};