import {type Item } from "../types/index";
import { getFormattedDate } from "util/constants";
import { create } from "zustand"; 
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PriorityQueueAction {
  type: "ADD" | "REMOVE" | "RECALL" | "MARK_WAITING" | "UNMARK_WAITING" | "UPDATE_STATUS" | "UPDATE_BATCH_SIZE" | "CLEAR";
  payload: any;
  timestamp: number;
}

interface PriorityQueueStorage { 
    inProgressItems: Item[];
    waitingItems: Item[];
    pendingItems: Item[];
    history: Item[];
    instanceTracker: { [key: string]: boolean };
    waitingTracker: { [key: string]: boolean }; 
  lastUpdated: number;
  date: string; 
  lastAction?: PriorityQueueAction;
  add: (value: Item) => void;
  remove: (code: string) => void 
  recall: (itemId: number) => void; 
  markWaiting: (code: string) => void; 
  updateStatus: (code: string) => void;
  clearPriorityQueue: () => void;
  unmarkWaiting: (code: string) => void;
  updateBatchSize: (code: string, batchSize: number) => void;
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

/**
 * Creates a priority queue for items based on pending, waiting, and in-progress.
 */
export const usePriorityQueue = create<PriorityQueueStorage>()(
  persist(
    (set) => ({ 
      inProgressItems: [],
      waitingItems: [],
      pendingItems: [],
      history: [],
      instanceTracker: {} as { [key: string]: boolean },
      waitingTracker: {} as { [key: string]: boolean }, 
      lastAction: { type: "CLEAR", payload: null, timestamp: Date.now() },
      lastUpdated: Date.now(),
      date: getFormattedDate(), 
      add: (value: Item) => {
        set((state) => {
          if (state.instanceTracker[value.code]) {
            alert("Item already in queue.");
            return state;
          }

          return { 
            ...state,
            inProgressItems: value.status === "in-progress" ? [...state.inProgressItems, value] : state.inProgressItems,
            waitingItems: value.status === "waiting" ? [...state.waitingItems, value] : state.waitingItems,
            pendingItems: (value.status !== "in-progress" && value.status !== "waiting") ? [...state.pendingItems, value] : state.pendingItems,
            instanceTracker: { ...state.instanceTracker, [value.code]: true },
            lastUpdated: Date.now(),
            lastAction: { type: "ADD", payload: value, timestamp: Date.now() }
          };
        });
      },
      remove: (code: string) => {
        set((state) => {
          const newPq = { ...state };
          let removedItem: Item | undefined; 
          if (newPq.pendingItems.some(i => i.code === code)) {
            removedItem = newPq.pendingItems.find(i => i.code === code);
            newPq.pendingItems = newPq.pendingItems.filter(i => i.code !== code);
          } else if (newPq.inProgressItems.some(i => i.code === code)) {
            removedItem = newPq.inProgressItems.find(i => i.code === code);
            newPq.inProgressItems = newPq.inProgressItems.filter(i => i.code !== code);
          } else if (newPq.waitingItems.some(i => i.code === code)) {
            removedItem = newPq.waitingItems.find(i => i.code === code);
            newPq.waitingItems = newPq.waitingItems.filter(i => i.code !== code);
          }

          if (removedItem) {
            const historyItem = { ...removedItem, status: "deleted" as const };
            const { [code]: _, ...instanceTracker } = newPq.instanceTracker;
            const { [code]: __, ...waitingTracker } = newPq.waitingTracker;
            
            return { 
              ...newPq,
              history: [...newPq.history, historyItem].slice(-100),
              instanceTracker,
              waitingTracker,
              lastUpdated: Date.now(),
              lastAction: { type: "REMOVE", payload: code, timestamp: Date.now() }
            };
          }
          return state;
        });
      },
      recall: (itemId: number) => {
        set((state) => { 

          const findIndex = state.history.findIndex((item) => item.id === itemId);
          if (findIndex === -1) {
            alert("Item not in history.");
            return state;
          }

          const target = state.history[findIndex];
          if (state.instanceTracker[target.code]) {
            alert("Item already in queue.");
            return state;
          }

          const newStatus = target.status === "completed"? "pending" : target.status === "deleted"? "pending" : "in-progress" as Item["status"];
          const updatedTarget = { ...target, status: newStatus, completedAt: undefined };
          
          const category = getCategory(updatedTarget);
          const waiting = updatedTarget.waiting;
          return {
            ...state,
            history: state.history.filter((item) => item.id !== itemId),
            inProgressItems: category === "in-progress" ? [...state.inProgressItems, updatedTarget] : state.inProgressItems,
            waitingItems: category === "waiting" ? [...state.waitingItems, updatedTarget] : state.waitingItems,
            pendingItems: category === "pending" ? [...state.pendingItems, updatedTarget] : state.pendingItems,
            instanceTracker: { ...state.instanceTracker, [target.code]: true },
            waitingTracker: { ...state.waitingTracker, [target.code]: waiting },
            lastUpdated: Date.now(),
            lastAction: { type: "RECALL", payload: itemId, timestamp: Date.now() }
          };
        });
      },
      markWaiting: (code: string) => {
        set((state) => {
          const pq = state;
          if (!pq.instanceTracker[code] || pq.waitingTracker[code]) {
            alert(!pq.instanceTracker[code] ? "Item not in queue!" : "Item is already waiting!");
            return state;
          }
          
          const newPq = { ...pq };
          let target: Item | undefined;

          if (newPq.pendingItems.some(i => i.code === code)) {
            target = newPq.pendingItems.find(i => i.code === code);
            newPq.pendingItems = newPq.pendingItems.filter(i => i.code !== code);
            if (target) {
              const updatedTarget = { ...target, waiting: true, markedWaitingAt: Date.now() };
              newPq.waitingItems = [...newPq.waitingItems, updatedTarget];
            }
          } else if (newPq.inProgressItems.some(i => i.code === code)) {
            newPq.inProgressItems = newPq.inProgressItems.map(i => 
              i.code === code ? { ...i, waiting: true, markedWaitingAt: Date.now() } : i
            );
          }

          return { 
            ...newPq,
            waitingTracker: { ...pq.waitingTracker, [code]: true },
            lastUpdated: Date.now(),
            lastAction: { type: "MARK_WAITING", payload: code, timestamp: Date.now() }
          };
        });
      },
      updateStatus: (code: string) => {
        set((state) => {
          const pq = state;
          
          if (pq.pendingItems.some(i => i.code === code)) {
            const item = pq.pendingItems.find(i => i.code === code)!;
            return { 
              ...pq,
              pendingItems: pq.pendingItems.filter(i => i.code !== code),
              inProgressItems: [...pq.inProgressItems, { ...item, status: "in-progress", startedAt: Date.now() }],
              lastUpdated: Date.now(),
              lastAction: { type: "UPDATE_STATUS", payload: code, timestamp: Date.now() }
            };
          } else if (pq.inProgressItems.some(i => i.code === code)) {
            const item = pq.inProgressItems.find(i => i.code === code)!;
            const { [code]: _, ...instanceTracker } = pq.instanceTracker;
            const { [code]: __, ...waitingTracker } = pq.waitingTracker;
            return {
              ...pq,
              inProgressItems: pq.inProgressItems.filter(i => i.code !== code),
              history: [...pq.history, { ...item, status: "completed" as const, completedAt: Date.now() }].slice(-100),
              instanceTracker,
              waitingTracker,
              lastUpdated: Date.now(),
              lastAction: { type: "UPDATE_STATUS", payload: code, timestamp: Date.now() }
            };
          } else if (pq.waitingItems.some(i => i.code === code)) {
            const item = pq.waitingItems.find(i => i.code === code)!;
            return { 
              ...pq,
              waitingItems: pq.waitingItems.filter(i => i.code !== code),
              inProgressItems: [...pq.inProgressItems, { ...item, status: "in-progress", startedAt: Date.now() }],
              lastUpdated: Date.now(),
              lastAction: { type: "UPDATE_STATUS", payload: code, timestamp: Date.now() }
            };
          }

          return state;
        });
      },
      clearPriorityQueue: () => {
        set({ 
          inProgressItems: [],
          waitingItems: [],
          pendingItems: [],
          history: [],
          instanceTracker: {},
          waitingTracker: {},
          lastUpdated: Date.now(),
          lastAction: { type: "CLEAR", payload: null, timestamp: Date.now() }
        });
      },
      unmarkWaiting: (code: string) => {
        set((state) => {
          const pq = state;
          if (!pq.instanceTracker[code] || !pq.waitingTracker[code]) {
            alert(!pq.instanceTracker[code] ? "Item not in queue!" : "Item is not waiting!");
            return state;
          }

          const newPq = { ...pq };
          let target: Item | undefined;

          if (newPq.waitingItems.some(i => i.code === code)) {
            target = newPq.waitingItems.find(i => i.code === code)!;
            newPq.waitingItems = newPq.waitingItems.filter(i => i.code !== code);
          }

          if (target) {
            const { [code]: _, ...remainingWaiting } = pq.waitingTracker;
            return { 
              ...newPq,
              waitingTracker: remainingWaiting,
              pendingItems: [...newPq.pendingItems, { ...target, waiting: false, markedWaitingAt: undefined }], 
              lastUpdated: Date.now(),
              lastAction: { type: "UNMARK_WAITING", payload: code, timestamp: Date.now() }
            };
          }

          return state;
        });
      },
      updateBatchSize: (code: string, batchSize: number) => {
        set((state) => {
          const newPq = { ...state };
          let target: Item | undefined;

          if (newPq.pendingItems.some(i => i.code === code)) {
            target = newPq.pendingItems.find(i => i.code === code)!; 
            newPq.pendingItems = newPq.pendingItems.filter(i => i.code !== code);
          } else if (newPq.waitingItems.some(i => i.code === code)) {
            target = newPq.waitingItems.find(i => i.code === code)!;
            newPq.waitingItems = newPq.waitingItems.filter(i => i.code !== code);
          } else if (newPq.inProgressItems.some(i => i.code === code)) {
            alert("Item is in progress!");
            return state;
          } 

          if (target) {
            const updatedTarget = { ...target, batchSize };
            const category = getCategory(updatedTarget);
            return { 
              ...newPq,
              inProgressItems: category === "in-progress" ? [...newPq.inProgressItems, updatedTarget] : newPq.inProgressItems,
              waitingItems: category === "waiting" ? [...newPq.waitingItems, updatedTarget] : newPq.waitingItems,
              pendingItems: category === "pending" ? [...newPq.pendingItems, updatedTarget] : newPq.pendingItems,
              instanceTracker: { ...newPq.instanceTracker, [target.code]: true },
              lastUpdated: Date.now(),
              lastAction: { type: "UPDATE_BATCH_SIZE", payload: { code, batchSize }, timestamp: Date.now() }
            };
          }

          return state;
        });
      }
    }),
    {
      name: "fcfm-priority-queue",
      storage: createJSONStorage(() => AsyncStorage),
    }
  ),
);
