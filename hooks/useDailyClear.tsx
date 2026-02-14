import { useEffect } from "react";
import { useStorageP2P } from "./useStorage";
import { usePriorityQueue } from "./usePriority-Queue";

/**
 * Clears the priority queue and the date of storage when the day changes.
**/
export const useDailyClear = () => {
  const dateOfStorage = useStorageP2P(state => state.dateOfStorage); 
  const setDateOfStorage = useStorageP2P(state => state.setDateOfStorage);
  const clearPriorityQueue = usePriorityQueue(state => state.clearPriorityQueue);

  useEffect(() => {  
    const intervalId = setInterval(() => {  
      const isNewDay = dateOfStorage !== new Date().getDate();
      if (isNewDay) { 
        setDateOfStorage(new Date().getDate());
        clearPriorityQueue();
      }
    }, 60 * 60 * 1000);
    return () => clearInterval(intervalId); 
  }, [dateOfStorage, setDateOfStorage, clearPriorityQueue]);

};