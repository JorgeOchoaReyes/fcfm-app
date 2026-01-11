import type { Item } from "../types/index";
import { useCallback, useState , useEffect } from "react"; 

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

  head: Node | null = null;
  tail: Node | null = null;

  history: Item[] = [];

  instanceTracker: Map<string, boolean> = new Map();
  waitingTracker: Map<string, boolean> = new Map();

  constructor(head: Node | null = null, tail: Node | null = null, history: Item[] = [], instanceTracker: Map<string, boolean> = new Map(), waitingTracker: Map<string, boolean> = new Map()) {
    this.head = head || null;
    this.tail = tail || null;
    this.history = history;
    this.instanceTracker = instanceTracker;
    this.waitingTracker = waitingTracker;
  }

}

export const usePriorityQueue = () => {
  const [pq, setPq] = useState<PriorityQueue>(new PriorityQueue());

  const [date, setDate] = useState<number>(Date.now());

  const onChangePriorityQueue = async (newPq: PriorityQueue) => {
    const turnLinkedListToArray = (head: Node | null) => {
      const items: Item[] = [];
      let current = head;
      while (current) {
        if (current.value) {
          items.push(current.value);
        }
        current = current.next;
      }
      return items;
    };

    const items = turnLinkedListToArray(newPq.head);
    const pqStorage = {
      linkedList: items,
      history: newPq.history,
      instanceTracker: newPq.instanceTracker,
      waitingTracker: newPq.waitingTracker
    } as PriorityQueueStorage; 

    return pqStorage; 

  };


  const add = (value: Item) => {
    if (pq.instanceTracker.has(value.code)) {
      alert("Item already in queue.");
      return;
    }
    const copy = { ...pq };
    const newNode = new Node(value, copy.tail, null);
    if (copy.tail) {
      copy.tail.next = newNode;
      newNode.prev = copy.tail;
      copy.tail = newNode;
    } else {
      copy.tail = newNode;
      copy.head = newNode;
    }

    copy.instanceTracker.set(value.code, true);
    setPq({ ...copy });
  };

  const listActive = () => {
    const items: Item[] = [];
    let current = pq.head;
    while (current) {
      if (current.value) {
        items.push(current.value);
      }
      current = current.next;
    }
    return items;
  };

  const listHistory = () => {
    return pq.history;
  };

  const listAll = useCallback(() => {
    const items: Item[] = [];
    let current = pq.head;
    while (current) {
      if (current.value) {
        items.push(current.value);
      }
      current = current.next;
    }
    return [...items, ...pq.history].sort((a, b) => a.createdAt - b.createdAt);
  }, [pq]);

  const remove = (code: string) => {
    if (!pq.instanceTracker.get(code)) {
      alert("Item not in queue.");
      return;
    }
    const copy = { ...pq };
    let current = copy.head;
    const history = copy.history;
    while (current) {
      if (current.value?.code === code) {
        if (current === copy.head) {
          copy.head = current.next;
          current.next = null;
          copy.history.push({
            ...current.value,
            status: "deleted"
          });
          if (copy.head) {
            copy.head.prev = null;
          }
          copy.instanceTracker.delete(code);
          copy.waitingTracker.delete(code);

          setPq({ ...copy });
          break;
        }
        if (current === copy.tail) {
          copy.tail = current.prev;
        }
        if (current!.prev) {
          current!.prev!.next = current.next;
        }
        if (current!.next) {
          current!.next!.prev = current.prev;
        }

        current.value!.status = "deleted";

        history.push({
          ...current.value!,
        });

        copy.instanceTracker.delete(code);

        setPq({ ...copy });
        break;
      }
      current = current.next;
    }
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
    let target = null as Node | null;
    const history = copy.history;
    history.forEach((item) => {
      if (item.id === itemId) {
        target = new Node(item, null, null);
      }
    });

    if (!target) {
      alert("Item not in queue.");
      return;
    }

    copy.history = history.filter((item) => item.id !== itemId);

    if (target?.value?.code && copy.instanceTracker.has(target.value.code)) {
      alert("Item already in queue.");
      return;
    }

    delete target!.value!.completedAt;

    if (target.value?.status === "completed") {
      target.value.status = "pending";
    }

    // <--------------------------------- Review ------------------------------> 
    // determine where to insert the recalled item
    const item = target.value!;
    let targetCategory: "in-progress" | "waiting" | "pending" = "pending";

    if (item.status === "in-progress" || item.status === "completed") {
      targetCategory = "in-progress";
    } else if (item.waiting) {
      targetCategory = "waiting";
    }

    // Reset status for active queue
    if (item.status === "completed" && item.waiting) {
      item.status = "in-progress";
    } else if (item.status === "completed") {
      item.status = "pending";
    } else if (item.status === "deleted") {
      item.status = "pending";
    }

    let insertionPoint: Node | null = null;
    let curr = copy.head;

    if (targetCategory === "in-progress") {
      while (curr) {
        if (getCategory(curr.value!) === "in-progress") {
          insertionPoint = curr;
        } else {
          break;
        }
        curr = curr.next;
      }
    } else if (targetCategory === "waiting") {
      while (curr) {
        if (getCategory(curr.value!) === "in-progress") {
          insertionPoint = curr;
        } else {
          break;
        }
        curr = curr.next;
      }
    } else if (targetCategory === "pending") {
      while (curr) {
        const cat = getCategory(curr.value!);
        if (cat === "in-progress" || cat === "waiting") {
          insertionPoint = curr;
        } else {
          break;
        }
        curr = curr.next;
      }
    }

    if (!target || !target.value) return;

    if (!insertionPoint) {
      target.next = copy.head;
      target.prev = null;
      if (copy.head) {
        copy.head.prev = target;
      } else {
        copy.tail = target;
      }
      copy.head = target;
    } else {
      target.prev = insertionPoint;
      target.next = insertionPoint.next;
      if (insertionPoint.next) {
        insertionPoint.next.prev = target;
      } else {
        copy.tail = target;
      }
      insertionPoint.next = target;
    }

    copy.instanceTracker.set(target.value.code, true);
    setPq({ ...copy });

  };

  const markWaiting = (code: string) => {
    if (!pq.instanceTracker.has(code) || pq.waitingTracker.has(code)) {
      alert(!pq.instanceTracker.has(code) ? "Item not in queue!" : "Item is already waiting!");
      return;
    }

    const copy = { ...pq };
    let target = null as Node | null;
    let current = copy.head;

    while (current) {
      if (current.value?.code === code) {
        target = current;
        break;
      }
      current = current.next;
    }

    if (!target || !target.value) return;

    target.value.waiting = true;
    target.value.status = "waiting";
    target.value.markedWaitingAt = Date.now();

    if (target.prev) {
      target.prev.next = target.next;
    } else {
      copy.head = target.next;
    }

    if (target.next) {
      target.next.prev = target.prev;
    } else {
      copy.tail = target.prev;
    }

    let insertionPoint = target.prev;
    while (insertionPoint) {
      if (insertionPoint.value?.waiting || insertionPoint.value?.status === "in-progress") {
        break;
      }
      insertionPoint = insertionPoint.prev;
    }

    if (insertionPoint) {
      target.next = insertionPoint.next;
      target.prev = insertionPoint;
      if (insertionPoint.next) {
        insertionPoint.next.prev = target;
      } else {
        copy.tail = target;
      }
      insertionPoint.next = target;
    } else {
      target.next = copy.head;
      target.prev = null;
      if (copy.head) {
        copy.head.prev = target;
      } else {
        copy.tail = target;
      }
      copy.head = target;
    }

    copy.waitingTracker.set(code, true);
    setPq({ ...copy });
  };

  const updateStatus = (code: string, status?: "pending" | "in-progress" | "completed") => {
    const copy = { ...pq };
    let current = copy.head;
    while (current) {
      if (current.value?.code === code) {
        if (status) current.value.status = status;
        else {
          switch (current.value.status) {
          case "waiting":
          case "pending":
            current.value.status = "in-progress";

            // detach from current pos
            if (current.prev) {
              current.prev.next = current.next;
            } else {
              // if no prev then we must be at head
              copy.head = current.next;
            }
            if (current.next) {
              current.next.prev = current.prev;
            } else {

              // if no next then we are at tail 
              copy.tail = current.prev;
            }

            // now we find the nearets waiitng or in-progress 
            let insertionPoint = current.prev;
            while (insertionPoint) {
              if (insertionPoint?.value?.status === "in-progress") {
                break;
              }
              insertionPoint = insertionPoint.prev;
            }

            if (insertionPoint) {
              current.next = insertionPoint.next;
              current.prev = insertionPoint;
              if (insertionPoint.next) {
                insertionPoint.next.prev = current;
              } else {
                copy.tail = current;
              }
              insertionPoint.next = current;
            } else {
              // if there is no insertionpoint then we are at the head of DLL 
              current.next = copy.head;
              current.prev = null;
              if (copy.head) {
                copy.head.prev = current;
              } else {
                copy.tail = current;
              }
              copy.head = current;
            }

            break;
          case "in-progress":
            current.value.status = "completed";
            current.value.completedAt = Date.now();
            if (current.value.waiting) {
              copy.waitingTracker.delete(code);
            }
            copy.instanceTracker.delete(code);
            if (current === copy.head) {
              copy.head = current.next;
            }
            if (current === copy.tail) {
              copy.tail = current.prev;
            }
            if (current.prev) {
              current.prev.next = current.next;
            }
            if (current.next) {
              current.next.prev = current.prev;
            }
            copy.history.push({
              ...current.value,
            });
            break;
          }
        }
        break;
      }
      current = current.next;
    }
    setPq({ ...copy });
  };

  const findItem = (name: string) => {
    const copy = { ...pq };
    let current = copy.head;
    while (current) {
      if (current.value?.name === name) {
        return current.value;
      }
      current = current.next;
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
