import { KDS } from "../components/KDS";
import { usePriorityQueue } from "../hooks/usePriority-Queue"; 
import { View, Text } from "react-native";

export default function Main() {

  const {
    add,
    listActive,
    listAll,
    listHistory,
    remove,
    markWaiting,
    findItem,
    updateStatus,
    recall,
    pq
  } = usePriorityQueue(); 

  return (
    <View className={"flex min-h-screen items-center justify-center font-sans bg-slate-100"}>
      <View className="flex min-h-screen w-full flex-col items-center justify-between">
        <View className="px-4 py-8 min-h-screen">
          <KDS
            items={listActive()}
            history={listHistory()}
            onRecall={(id: number) => {
              recall(id);
            }}
            onDelete={(code: string) => {
              remove(code);
            }}
            onUpdateStatus={(code: string, status?: "pending" | "in-progress" | "completed") => {
              updateStatus(code,);
            }}
          />
        </View>
      </View>
    </View>
  );
}
