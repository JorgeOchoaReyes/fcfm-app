import {type Item } from "../types/index";
import { getFormattedDate } from "util/constants";
import { create } from "zustand"; 
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PriorityQueueStorage {
  pq: {
    inProgressItems: Item[];
    waitingItems: Item[];
    pendingItems: Item[];
    history: Item[];
    instanceTracker: { [key: string]: boolean };
    waitingTracker: { [key: string]: boolean };
  }; 
  date: string; 
  add: (value: Item) => void;
  listActive: () => Item[]; 
  listHistory: () => Item[];
  listAll: () => Item[]; 
  remove: (code: string) => void 
  recall: (itemId: number) => void; 
  markWaiting: (code: string) => void; 
  findItem: (name: string) => Item | null; 
  updateStatus: (code: string) => void;
}

const getCategory = (item: Item) => {
  if (item.waiting && item.status !== "in-progress") {
    return "waiting";
  } else if (item.status === "in-progress") {
    return "in-progress";
  } else {
    return "pending";
  }
};

export const usePriorityQueue = create<PriorityQueueStorage>()(
  persist(
    (set, get) => ({
      pq: {
        inProgressItems: [],
        waitingItems: [],
        pendingItems: [],
        history: [],
        instanceTracker: {} as { [key: string]: boolean },
        waitingTracker: {} as { [key: string]: boolean }
      }, 
      date: getFormattedDate(), 
      add: (value: Item) => {
        const pq = get().pq; 
        if (pq.instanceTracker[value.code]) {
          alert("Item already in queue.");
          return;
        }
            
        const copy = { ...pq }; 
        if(value.status === "in-progress") {
          copy.inProgressItems.push(value);
        } else if(value.status === "waiting") {
          copy.waitingItems.push(value);
        } else {
          copy.pendingItems.push(value);
        }
        copy.instanceTracker[value.code] = true;

        set({
          pq: copy
        });
      },
      listActive: () => {
        const pq = get().pq; 
        return [...pq.inProgressItems, ...pq.waitingItems, ...pq.pendingItems,];
      },
      listHistory: () => {
        return get().pq.history; 
      },
      listAll: () => {
        const pq = get().pq; 
        return [...pq.inProgressItems, ...pq.waitingItems, ...pq.pendingItems, ...pq.history].sort((a, b) => b.createdAt - a.createdAt);
      },
      remove: (code: string) => {
        const pq = get().pq; 
        if (!pq.instanceTracker[code]) {
          alert("Item not in queue.");
          return;
        }
        const copy = { ...pq };
 
        if(copy.pendingItems.find((item) => item.code === code)) {
          const item = copy.pendingItems.find((item) => item.code === code);
          copy.pendingItems = copy.pendingItems.filter((item) => item.code !== code);
          delete copy.instanceTracker[code];
          delete copy.waitingTracker[code];
          item!.status = "deleted"; 
          copy.history.push(item!);
        } else if(copy.inProgressItems.find((item) => item.code === code)) {
          const item  = copy.inProgressItems.find((item) => item.code === code);
          copy.inProgressItems = copy.inProgressItems.filter((item) => item.code !== code);
          delete copy.instanceTracker[code];
          delete copy.waitingTracker[code];
          copy.history.push(item!);
        } else if(copy.waitingItems.find((item) => item.code === code)) {
          const item = copy.waitingItems.find((item) => item.code === code);
          copy.waitingItems = copy.waitingItems.filter((item) => item.code !== code);
          delete copy.instanceTracker[code];
          delete copy.waitingTracker[code];
          copy.history.push(item!);
        }
        
        set({
          pq: copy
        });

      },
      recall: (itemId: number) => {
        const pq = get().pq; 
        const copy = { ...pq };
        let target = null as Item | null;
        const history = copy.history;

        const findIndex = history.findIndex((item) => item.id === itemId);
        if (findIndex === -1) {
          alert("Item not in queue.");
          return;
        }

        target = history[findIndex];
        if (!target) {
          alert("Item not in queue.");
          return;
        }
        copy.history = history.filter((item) => item.id !== itemId);
        if (target?.code && copy.instanceTracker[target.code]) {
          alert("Item already in queue.");
          return;
        }
        delete target!.completedAt;
        if (target?.status === "completed") {
          target.status = "pending";
        }

        let targetCategory: "in-progress" | "waiting" | "pending" = "pending";
        targetCategory = getCategory(target);  
        if(targetCategory === "pending") {
          copy.pendingItems.push(target);
        } else if (targetCategory === "in-progress") {
          copy.inProgressItems.push(target);
        } else if (targetCategory === "waiting") {
          copy.waitingItems.push(target);
        }

        copy.instanceTracker[target.code] = true;

        set({
          pq: copy
        });
      },
      markWaiting: (code: string) => {
        const pq = get().pq; 
        if (!pq.instanceTracker[code] || pq.waitingTracker[code]) {
          alert(!pq.instanceTracker[code] ? "Item not in queue!" : "Item is already waiting!");
          return;
        }

        const copy = { ...pq };
    
        if(copy.pendingItems.find((item) => item.code === code)) {
          const target = copy.pendingItems.find((item) => item.code === code);
          target!.waiting = true;
          target!.markedWaitingAt = Date.now();
          copy.pendingItems = copy.pendingItems.filter((item) => item.code !== code);
          copy.waitingItems.push(target!);
        } else if(copy.inProgressItems.find((item) => item.code === code)) {
          const target = copy.inProgressItems.find((item) => item.code === code);
          target!.waiting = true;
          target!.markedWaitingAt = Date.now(); 
        } else {
          console.log("Item is waiting or in-progress");
        }
    
        copy.waitingTracker[code] = true;
    
        set({
          pq: copy
        });
      },
      updateStatus: (code: string,) => {
        const pq = get().pq; 
        const copy = { ...pq };
   
        const itemInPending = copy.pendingItems.find((item) => item.code === code);
        const itemInInProgress = copy.inProgressItems.find((item) => item.code === code); 
        const itemInWaiting = copy.waitingItems.find((item) => item.code === code); 

        if(itemInPending) {
          copy.pendingItems = copy.pendingItems.filter((item) => item.code !== code);
          itemInPending.status = "in-progress";
          itemInPending.startedAt = Date.now();
          copy.inProgressItems.push(itemInPending);
        } else if(itemInInProgress) {
          copy.inProgressItems = copy.inProgressItems.filter((item) => item.code !== code);
          itemInInProgress.status = "completed";
          itemInInProgress.completedAt = Date.now();
          delete copy.waitingTracker[code];
          delete copy.instanceTracker[code];
          copy.history.push(itemInInProgress);
        } else if(itemInWaiting) {
          copy.waitingItems = copy.waitingItems.filter((item) => item.code !== code);
          itemInWaiting.status = "in-progress";
          itemInWaiting.startedAt = Date.now();
          copy.inProgressItems.push(itemInWaiting);
        }

        set({
          pq: copy
        });

      },
      findItem: (name: string) => {
        const pq = get().pq; 
        const copy = { ...pq };
   
        const itemInPending = copy.pendingItems.find((item) => item.name === name);
        const itemInInProgress = copy.inProgressItems.find((item) => item.name === name);
        const itemInWaiting = copy.waitingItems.find((item) => item.name === name); 

        if(itemInPending) {
          return itemInPending;
        } else if(itemInInProgress) {
          return itemInInProgress;
        } else if(itemInWaiting) {
          return itemInWaiting;
        }  

        return null;
      }
    }),
    {
      name: "fcfm-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  ),
);
