import type { Item } from "../types/index";
import { useCallback, useState } from "react"; 

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
    if(value.status === "in-progress") {
      copy.inProgressItems.push(value);
    } else if(value.status === "waiting") {
      copy.waitingItems.push(value);
    } else {
      copy.pendingItems.push(value);
    }
    copy.instanceTracker.set(value.code, true);
    setPq(copy);

  };

  const listActive = () => {
    return [...pq.pendingItems, ...pq.inProgressItems, ...pq.waitingItems];
  };

  const listHistory = () => {
    return pq.history;
  };

  const listAll = useCallback(() => { 
    return [...pq.pendingItems, ...pq.inProgressItems, ...pq.waitingItems, ...pq.history].sort((a, b) => a.createdAt - b.createdAt);
  }, [pq]);

  const remove = (code: string) => {
    if (!pq.instanceTracker.get(code)) {
      alert("Item not in queue.");
      return;
    }
    const copy = { ...pq };
 
    if(copy.pendingItems.find((item) => item.code === code)) {
      copy.pendingItems = copy.pendingItems.filter((item) => item.code !== code);
      copy.waitingTracker.delete(code);
      copy.instanceTracker.delete(code); 
      const item  = copy.pendingItems.find((item) => item.code === code);
      copy.history.push(item!);
    } else if(copy.inProgressItems.find((item) => item.code === code)) {
      copy.inProgressItems = copy.inProgressItems.filter((item) => item.code !== code);
      copy.waitingTracker.delete(code);
      copy.instanceTracker.delete(code); 
      const item  = copy.inProgressItems.find((item) => item.code === code);
      copy.history.push(item!);
    } else if(copy.waitingItems.find((item) => item.code === code)) {
      copy.waitingItems = copy.waitingItems.filter((item) => item.code !== code);
      copy.waitingTracker.delete(code);
      copy.instanceTracker.delete(code); 
      const item  = copy.waitingItems.find((item) => item.code === code);
      copy.history.push(item!);
    }

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
      copy.pendingItems.push(target);
    } else if (targetCategory === "in-progress") {
      copy.inProgressItems.push(target);
    } else if (targetCategory === "waiting") {
      copy.waitingItems.push(target);
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
    
    if(copy.pendingItems.find((item) => item.code === code)) {
      console.log("Marking Item as Pending!");
      const target = copy.pendingItems.find((item) => item.code === code);
      target!.waiting = true;
      target!.markedWaitingAt = Date.now();
      copy.pendingItems = copy.pendingItems.filter((item) => item.code !== code);
      copy.waitingItems.push(target!);
    } else {
      console.log("Item is waiting or in-progress");
    }
    
    copy.waitingTracker.set(code, true);
    setPq({ ...copy });
  };

  const updateStatus = (code: string, status?: "pending" | "in-progress" | "completed") => {
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
      copy.waitingTracker.delete(code);
      copy.instanceTracker.delete(code);
      copy.history.push(itemInInProgress);
    } else if(itemInWaiting) {
      copy.waitingItems = copy.waitingItems.filter((item) => item.code !== code);
      itemInWaiting.status = "in-progress";
      itemInWaiting.startedAt = Date.now();
      copy.inProgressItems.push(itemInWaiting);
    }

    setPq({ ...copy });
  };

  const findItem = (name: string) => {
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
