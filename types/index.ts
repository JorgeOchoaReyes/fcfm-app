export interface StatusEvent {
  id: string; 
  timestamp: number; 
  type: "mark-in-progress" | "mark-waiting" | "mark-completed" | "mark-deleted" | "item-added";
  completedBy: "BOH" | "FOH";
}

export interface Item {
  id: number;
  name: string;
  code: string;
  batchSize: number;
  chineseName: string;

  waiting: boolean;
  status: "pending" | "waiting" | "in-progress" | "completed" | "deleted";

  createdAt: number;

  markedWaitingAt?: number;
  startedAt?: number;
  deletedAt?: number;
  completedAt?: number;

  history?: StatusEvent[];
}
