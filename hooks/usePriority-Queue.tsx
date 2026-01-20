import type { Item } from "../types/index";
import { useCallback, useState } from "react"; 

class Node {
  next: Node | null = null;
  prev: Node | null = null;

  value: Item | null = null;

  constructor(value: Item | null, prev: Node | null = null, next: Node | null = null) {
    this.next = next;
    this.prev = prev;
    this.value = value;
  }
}

class PriorityQueueStorage {
  linkedList: Item[] = [];
  history: Item[] = [];
  instanceTracker: Map<string, boolean> = new Map();
  waitingTracker: Map<string, boolean> = new Map();
}

class PriorityQueue { 

  pendingItems: Item[] = [];
  inProgressItems: Item[] = [];
  waitingItems: Item[] = [];

  history: Item[] = [];

  instanceTracker: Map<string, boolean> = new Map();
  waitingTracker: Map<string, boolean> = new Map();

  constructor(pendingItems: Item[] = [], inProgressItems: Item[] = [], waitingItems: Item[] = [], history: Item[] = [], instanceTracker: Map<string, boolean> = new Map(), waitingTracker: Map<string, boolean> = new Map()) {
    this.history = history;
    this.instanceTracker = instanceTracker;
    this.waitingTracker = waitingTracker;
    this.pendingItems = pendingItems;
    this.inProgressItems = inProgressItems;
    this.waitingItems = waitingItems;
  }

}

const insertFn = (arr: Item[], item: Item, index: number) => {
  const copy = [...arr];
  copy.splice(index, 0, item);
  return copy;
};

const removeFn = (arr: Item[], index: number) => {
  const copy = [...arr];
  copy.splice(index, 1);
  return copy;
};

export const usePriorityQueue = () => {
  const [pq, setPq] = useState<PriorityQueue>(new PriorityQueue());

  const [date, setDate] = useState<number>(Date.now());

  const onChangePriorityQueue = async (newPq: PriorityQueue) => {
    setPq(newPq);
  };  


  const add = (value: Item) => {
    if (pq.instanceTracker.has(value.code)) {
      alert("Item already in queue.");
      return;
    }
    
    const copy = { ...pq }; 
    copy.items.push(value);
    copy.instanceTracker.set(value.code, true);
    setPq(copy);

  };

  const listActive = () => {
    return pq.items;
  };

  const listHistory = () => {
    return pq.history;
  };

  const listAll = useCallback(() => { 
    return [...pq.items, ...pq.history].sort((a, b) => a.createdAt - b.createdAt);
  }, [pq]);

  const remove = (code: string) => {
    if (!pq.instanceTracker.get(code)) {
      alert("Item not in queue.");
      return;
    }
    const copy = { ...pq };
 
    const findIndex = copy.items.findIndex((item) => item.code === code);
    if (findIndex === -1) {
      alert("Item not in queue.");
      return;
    }
    copy.items = removeFn(copy.items, findIndex);
    copy.instanceTracker.delete(code);
    setPq(copy);
  };

  const getCategory = (item: Item) => {
    if (item.waiting && item.status !== "in-progress") {
      return "waiting";
    } else if (item.status === "in-progress") {
      return "in-progress";
    } else {
      return "pending";
    }
  };

  const recall = (itemId: number) => {
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

    if (target?.code && copy.instanceTracker.has(target.code)) {
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
      copy.items.push(target);
    } else if (targetCategory === "in-progress") {
      if(copy.items[0].status !== "in-progress") {
        copy.items.unshift(target);
      } 
      else if(copy.items[copy.items.length - 1].status === "in-progress") {
        copy.items.push(target);
      } 
      else {
        for(let i = 0; i < copy.items.length; i++) {
          if(copy.items[i].status !== "in-progress" ) {
            copy.items.splice(i, 0, target);
            break;
          }
        }
      }
    } else if (targetCategory === "waiting") {
      if(copy.items[0].status === "pending") {
        copy.items.unshift(target);
      } 
      else if(copy.items[copy.items.length - 1].status === "in-progress") {
        copy.items.push(target);
      } 
      else if(copy.items[copy.items.length - 1].status === "waiting") {
        copy.items.push(target);
      } 
      else {
        for(let i = 0; i < copy.items.length; i++) {
          if(copy.items[i].status === "in-progress" && copy.items[i+1].status === "pending") {
            copy.items.splice(i, 0, target);
            break;
          } else if (copy.items[i].status === "in-progress" && (i+1 === copy.items.length)) {
            copy.items.push(target);
            break;
          } else if (copy.items[i].status === "waiting" && copy.items[i+1].status === "pending") {
            copy.items.splice(i, 0, target);
            break;
          } 
        }
      }
    }

    copy.instanceTracker.set(target.code, true);
    setPq({ ...copy });

  };

  const markWaiting = (code: string) => {
    if (!pq.instanceTracker.has(code) || pq.waitingTracker.has(code)) {
      alert(!pq.instanceTracker.has(code) ? "Item not in queue!" : "Item is already waiting!");
      return;
    }

    const copy = { ...pq };
    let target = null as Item | null;
    
    const findIndex = copy.items.findIndex((item) => item.code === code);
    if (findIndex === -1) {
      alert("Item not in queue.");
      return;
    }
    target = copy.items[findIndex]; 

    target.waiting = true;
    target.status = "waiting";
    target.markedWaitingAt = Date.now();

    for(let i = 0; i < copy.items.length; i++) {
      if(copy.items[i].code === code) {
        copy.items.splice(i, 1);
        break;
      }
    }

    if(copy.items[0].status === "pending") {
      copy.items.unshift(target);
    } else if(copy.items[copy.items.length - 1].status === "in-progress" || copy.items[copy.items.length - 1].status === "waiting"  ) {
      copy.items.push(target);
    } else {
      for(let i = 0; i < copy.items.length; i++) {
        if(copy.items[i].status === "in-progress" && copy.items[i+1].status === "pending") {
          copy.items.splice(i, 0, target);
          break;
        } else if (copy.items[i].status === "in-progress" && (i+1 === copy.items.length)) {
          copy.items.push(target);
          break;
        } else if (copy.items[i].status === "waiting" && copy.items[i+1].status === "pending") {
          copy.items.splice(i, 0, target);
          break;
        } 
      }
    }

    copy.waitingTracker.set(code, true);
    setPq({ ...copy });
  };

  const updateStatus = (code: string, status?: "pending" | "in-progress" | "completed") => {
    const copy = { ...pq };
    let current = copy.head;
   


    setPq({ ...copy });
  };

  const findItem = (name: string) => {
    const copy = { ...pq };
    const findIndex = copy.items.findIndex((item) => item.name === name);
    if (findIndex === -1) {
      alert("Item not in queue.");
      return;
    }
    return copy.items[findIndex];
  };

  return {
    pq: pq,
    add,
    remove,
    listAll,
    listActive,
    listHistory,
    markWaiting,
    recall,
    findItem,
    updateStatus
  };
};
