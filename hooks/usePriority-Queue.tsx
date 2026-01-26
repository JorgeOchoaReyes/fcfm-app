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
  clearPriorityQueue: () => void;
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
        const { pq } = get();
        if (pq.instanceTracker[value.code]) {
          alert("Item already in queue.");
          return;
        }

        set((state) => ({
          pq: {
            ...state.pq,
            inProgressItems: value.status === "in-progress" ? [...state.pq.inProgressItems, value] : state.pq.inProgressItems,
            waitingItems: value.status === "waiting" ? [...state.pq.waitingItems, value] : state.pq.waitingItems,
            pendingItems: (value.status !== "in-progress" && value.status !== "waiting") ? [...state.pq.pendingItems, value] : state.pq.pendingItems,
            instanceTracker: { ...state.pq.instanceTracker, [value.code]: true }
          }
        }));
      },
      listActive: () => {
        const { pq } = get();
        return [...pq.inProgressItems, ...pq.waitingItems, ...pq.pendingItems];
      },
      listHistory: () => get().pq.history,
      listAll: () => {
        const { pq } = get();
        return [...pq.inProgressItems, ...pq.waitingItems, ...pq.pendingItems, ...pq.history].sort((a, b) => b.createdAt - a.createdAt);
      },
      remove: (code: string) => {
        const { pq } = get();
        if (!pq.instanceTracker[code]) {
          alert("Item not in queue.");
          return;
        }

        set((state) => {
          const newPq = { ...state.pq };
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
            const { [code]: _, ...remainingInstances } = newPq.instanceTracker;
            const { [code]: __, ...remainingWaiting } = newPq.waitingTracker;
            
            return {
              pq: {
                ...newPq,
                history: [...newPq.history, historyItem],
                instanceTracker: remainingInstances,
                waitingTracker: remainingWaiting
              }
            };
          }
          return state;
        });
      },
      recall: (itemId: number) => {
        const { pq } = get();
        const findIndex = pq.history.findIndex((item) => item.id === itemId);
        if (findIndex === -1) {
          alert("Item not in history.");
          return;
        }

        const target = pq.history[findIndex];
        if (pq.instanceTracker[target.code]) {
          alert("Item already in queue.");
          return;
        }

        set((state) => {
          const updatedTarget = { ...target, status: target.status === "completed" ? ("pending" as const) : target.status };
          delete updatedTarget.completedAt;
          
          const category = getCategory(updatedTarget);
          return {
            pq: {
              ...state.pq,
              history: state.pq.history.filter((item) => item.id !== itemId),
              inProgressItems: category === "in-progress" ? [...state.pq.inProgressItems, updatedTarget] : state.pq.inProgressItems,
              waitingItems: category === "waiting" ? [...state.pq.waitingItems, updatedTarget] : state.pq.waitingItems,
              pendingItems: category === "pending" ? [...state.pq.pendingItems, updatedTarget] : state.pq.pendingItems,
              instanceTracker: { ...state.pq.instanceTracker, [target.code]: true }
            }
          };
        });
      },
      markWaiting: (code: string) => {
        const { pq } = get();
        if (!pq.instanceTracker[code] || pq.waitingTracker[code]) {
          alert(!pq.instanceTracker[code] ? "Item not in queue!" : "Item is already waiting!");
          return;
        }

        set((state) => {
          const newPq = { ...state.pq };
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
            pq: {
              ...newPq,
              waitingTracker: { ...state.pq.waitingTracker, [code]: true }
            }
          };
        });
      },
      updateStatus: (code: string) => {
        set((state) => {
          const newPq = { ...state.pq };
          
          if (newPq.pendingItems.some(i => i.code === code)) {
            const item = newPq.pendingItems.find(i => i.code === code)!;
            return {
              pq: {
                ...newPq,
                pendingItems: newPq.pendingItems.filter(i => i.code !== code),
                inProgressItems: [...newPq.inProgressItems, { ...item, status: "in-progress", startedAt: Date.now() }]
              }
            };
          } 
          
          if (newPq.inProgressItems.some(i => i.code === code)) {
            const item = newPq.inProgressItems.find(i => i.code === code)!;
            const { [code]: _, ...remainingInstances } = newPq.instanceTracker;
            const { [code]: __, ...remainingWaiting } = newPq.waitingTracker;
            return {
              pq: {
                ...newPq,
                inProgressItems: newPq.inProgressItems.filter(i => i.code !== code),
                history: [...newPq.history, { ...item, status: "completed", completedAt: Date.now() }],
                instanceTracker: remainingInstances,
                waitingTracker: remainingWaiting
              }
            };
          }

          if (newPq.waitingItems.some(i => i.code === code)) {
            const item = newPq.waitingItems.find(i => i.code === code)!;
            return {
              pq: {
                ...newPq,
                waitingItems: newPq.waitingItems.filter(i => i.code !== code),
                inProgressItems: [...newPq.inProgressItems, { ...item, status: "in-progress", startedAt: Date.now() }]
              }
            };
          }

          return state;
        });
      },
      findItem: (name: string) => {
        const { pq } = get();
        return pq.pendingItems.find((i) => i.name === name) ||
               pq.inProgressItems.find((i) => i.name === name) ||
               pq.waitingItems.find((i) => i.name === name) || null;
      },
      clearPriorityQueue: () => {
        set({
          pq: {
            inProgressItems: [],
            waitingItems: [],
            pendingItems: [],
            history: [],
            instanceTracker: {},
            waitingTracker: {}
          }
        });
      }
    }),
    {
      name: "fcfm-priority-queue",
      storage: createJSONStorage(() => AsyncStorage),
    }
  ),
);
