import { useCallback, useEffect, useRef } from "react";
import { usePriorityQueue, type PriorityQueueStorage } from "./usePriority-Queue";
import * as Nearby from "expo-nearby-connections"; 
import { useAudioPlayer } from "expo-audio";
import { useStorageP2P } from "./useStorage"; 
import { Item } from "types";

const clickSoundSource = require("../assets/bell-sfx.mp3");

export const mergeStates = (oldState: PriorityQueueStorage, incomingState: PriorityQueueStorage): PriorityQueueStorage => {
  const newState = {...oldState};
    
  const allOldState = [...oldState.inProgressItems, ...oldState.waitingItems, ...oldState.pendingItems];
  const allNewState = [...incomingState.inProgressItems, ...incomingState.waitingItems, ...incomingState.pendingItems];

  // This an addition or completion
  if(allNewState.length !== allOldState.length) {
    let findItem = null as Item | null;

    for(const item of allNewState) {
      if(!allOldState.some(i => i.code === item.code)) {
        findItem = item;
        break;
      }
    }

    // no found item so deletion/completion was done 
    if(!findItem) {
      let findDeletedItem = null as Item | null;
      for(const item of allOldState) {
        if(!allNewState.some(i => i.code === item.code)) {
          findDeletedItem = item;
          break;
        }
      }

      if(!findDeletedItem) {
        console.log("No deleted item or added item was found but somehow the state is not synced.");
        return newState;
      }

      // found an item that was completed
      if(incomingState.lastAction?.type === "UPDATE_STATUS") { 
        newState.updateStatus(findDeletedItem.code);
      } else if(incomingState.lastAction?.type === "REMOVE") {
        newState.remove(findDeletedItem.code);
      }  

    } else { 
      newState.add(findItem);
    }

  }
  // this an update to an exisitng item 
  else {
    
    const codeStore = {} as { [key: string]: { old: Item, new: Item } };

    const actionToFind = incomingState.lastAction?.type;

    for(const item of allOldState) {
      codeStore[item.code].old = item;
    }

    for(const item of allNewState) {
      codeStore[item.code].new = item;
    }

    Object.keys(codeStore).forEach((key) => {
      const oldItem = codeStore[key].old;
      const newItem = codeStore[key].new;
      
      if(actionToFind === "UPDATE_STATUS") {
        if(oldItem.status !== newItem.status) {
          newState.updateStatus(newItem.code);
        }
      } else if(actionToFind === "MARK_WAITING") {
        if(oldItem.waiting !== newItem.waiting) {
          newState.markWaiting(newItem.code);
        }
      } else if(actionToFind === "UNMARK_WAITING") {
        if(oldItem.waiting !== newItem.waiting) {
          newState.unmarkWaiting(newItem.code);
        }
      } else if(actionToFind === "UPDATE_BATCH_SIZE") {
        if(oldItem.batchSize !== newItem.batchSize) {
          newState.updateBatchSize(newItem.code, newItem.batchSize);
        }
      }
      
    });

  }
  
  return newState;
};

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
    const unsubscribeStore = usePriorityQueue.subscribe(async (state, prevState) => {
      if (isInternalUpdate.current) {
        isInternalUpdate.current = false;
        return;
      }  

      try {
        await Nearby.sendText(connectedPeerId ?? "", JSON.stringify({
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
 
          if (remoteState.lastUpdated > localState.lastUpdated || localState.lastAction !== remoteState.lastAction) {  
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