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
      const date = new Date();
      date.setHours(date.getHours()); 
      const isNewDay = dateOfStorage !== date.getDate();
      if (isNewDay) { 
        setDateOfStorage(date.getDate());
        clearPriorityQueue();
      }
    }, 60 * 60 * 1000);
    return () => clearInterval(intervalId); 

  }, [dateOfStorage, setDateOfStorage, clearPriorityQueue]);

  
  useEffect(() => {
    if(!dateOfStorage || dateOfStorage !== new Date().getDate()) {
      setDateOfStorage(new Date().getDate());
    }
  }, []);

};