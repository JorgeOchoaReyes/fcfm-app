import { useCallback, useEffect, useRef } from "react";
import { usePriorityQueue, type PriorityQueueStorage } from "./usePriority-Queue";
import * as Nearby from "expo-nearby-connections"; 
import { useAudioPlayer } from "expo-audio";
import { useStorageP2P } from "./useStorage";  

const clickSoundSource = require("../assets/bell-sfx.mp3");

export const mergeStates = (oldState: PriorityQueueStorage, incomingState: PriorityQueueStorage): PriorityQueueStorage => {
  // Create a base for the new state from local state (data only)
  const newState = {
    ...oldState,
    inProgressItems: [...oldState.inProgressItems],
    waitingItems: [...oldState.waitingItems],
    pendingItems: [...oldState.pendingItems],
    history: [...oldState.history],
    instanceTracker: { ...oldState.instanceTracker },
    waitingTracker: { ...oldState.waitingTracker },
  };

  const incomingItems = [
    ...incomingState.inProgressItems,
    ...incomingState.waitingItems,
    ...incomingState.pendingItems,
  ];

  const incomingItemMap = new Map(incomingItems.map(i => [i.code, i]));
  const localItemMap = new Map([
    ...oldState.inProgressItems,
    ...oldState.waitingItems,
    ...oldState.pendingItems,
  ].map(i => [i.code, i]));

  // 1. Process Updates and Additions from Remote
  incomingItems.forEach(remoteItem => {
    const localItem = localItemMap.get(remoteItem.code);
    
    if (localItem) {
      // It exists locally, update it if the remote one is newer or has different status/data
      // For simplicity, we trust the remote update if we received it
      // Remove from all local lists first to handle potential status changes
      newState.pendingItems = newState.pendingItems.filter(i => i.code !== remoteItem.code);
      newState.waitingItems = newState.waitingItems.filter(i => i.code !== remoteItem.code);
      newState.inProgressItems = newState.inProgressItems.filter(i => i.code !== remoteItem.code);
      
      // Add to the correct list based on remote status
      if (remoteItem.status === "in-progress") {
        newState.inProgressItems.push(remoteItem);
      } else if (remoteItem.status === "waiting" || remoteItem.waiting) {
        newState.waitingItems.push(remoteItem);
      } else {
        newState.pendingItems.push(remoteItem);
      }
      
      newState.waitingTracker[remoteItem.code] = remoteItem.waiting;
    } else {
      // Addition: Item only in remote
      // Check if this specific instance (by ID) is in our local history
      const inLocalHistory = newState.history.some(h => h.id === remoteItem.id);
      // Also check if there's a collision with an active item of the same code but different ID
      // If there is, we might want to keep both if they are different orders, but the current 
      // system architecture seems to rely on 'code' being unique for active items.
      const codeCollision = newState.instanceTracker[remoteItem.code];

      if (!inLocalHistory && !codeCollision) {
        // Add it
        if (remoteItem.status === "in-progress") {
          newState.inProgressItems.push(remoteItem);
        } else if (remoteItem.status === "waiting" || remoteItem.waiting) {
          newState.waitingItems.push(remoteItem);
        } else {
          newState.pendingItems.push(remoteItem);
        }
        
        newState.instanceTracker[remoteItem.code] = true;
        newState.waitingTracker[remoteItem.code] = remoteItem.waiting;
      }
    }
  });

  // 2. Process Deletions/Completions from Remote
  // If an item is in our local active items but in remote history, it was removed/completed remotely.
  const localItems = [
    ...oldState.inProgressItems,
    ...oldState.waitingItems,
    ...oldState.pendingItems,
  ];

  localItems.forEach(localItem => {
    // Check if this specific instance was completed remotely
    const remoteHistoryItem = incomingState.history.find(h => h.id === localItem.id);
    const isStillActiveRemote = Array.from(incomingItemMap.values()).some(i => i.id === localItem.id);
    
    if (remoteHistoryItem && !isStillActiveRemote) {
      // Remove from local active lists
      newState.pendingItems = newState.pendingItems.filter(i => i.code !== localItem.code);
      newState.waitingItems = newState.waitingItems.filter(i => i.code !== localItem.code);
      newState.inProgressItems = newState.inProgressItems.filter(i => i.code !== localItem.code);
      
      // Add to local history if not already there
      const existingHistoryIndex = newState.history.findIndex(h => h.id === localItem.id);
      if (existingHistoryIndex === -1) {
        newState.history.push(remoteHistoryItem);
      } else {
        // Update with remote version if it has a more recent timestamp
        const localHItem = newState.history[existingHistoryIndex];
        if ((remoteHistoryItem.completedAt || 0) > (localHItem.completedAt || 0)) {
          newState.history[existingHistoryIndex] = remoteHistoryItem;
        }
      }
      
      delete newState.instanceTracker[localItem.code];
      delete newState.waitingTracker[localItem.code];
    }
  });

  // 3. Merge History to ensure both sides have the same history items
  incomingState.history.forEach(remoteHItem => {
    const localHItem = newState.history.find(h => h.id === remoteHItem.id);
    const isLocallyActive = Array.from(localItems).some(i => i.id === remoteHItem.id);
    
    if (!localHItem && !isLocallyActive) {
      newState.history.push(remoteHItem);
    }
  });

  // Limit history and sort by completion time
  newState.history = newState.history
    .sort((a, b) => (b.completedAt || b.deletedAt || 0) - (a.completedAt || a.deletedAt || 0))
    .slice(0, 100);

  newState.lastUpdated = Math.max(oldState.lastUpdated, incomingState.lastUpdated);
  newState.lastAction = incomingState.lastAction;

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
          const remoteState = payload.state as PriorityQueueStorage;
          const localState = usePriorityQueue.getState();

          // Only merge if remote has a different action or is newer
          // We use JSON.stringify for lastAction to catch any property change in the action payload
          const remoteActionStr = JSON.stringify(remoteState.lastAction);
          const localActionStr = JSON.stringify(localState.lastAction);

          if (remoteState.lastUpdated > localState.lastUpdated || remoteActionStr !== localActionStr) {
            const mergedState = mergeStates(localState, remoteState);

            // Verify if anything actually changed after merge
            if (JSON.stringify(mergedState) !== JSON.stringify(localState)) {
              if (Object.keys(mergedState.instanceTracker).length > Object.keys(localState.instanceTracker).length) { 
                await playSFX(); 
              }
              
              isInternalUpdate.current = true;
              usePriorityQueue.setState(mergedState);
            }
          } else {  
            console.log("Local is newer or identical, ignoring remote sync.");
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