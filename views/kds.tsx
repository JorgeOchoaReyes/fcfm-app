import { usePriorityQueue } from "../hooks/usePriority-Queue"; 
import { View } from "react-native";
import { KDS } from "../components/KDS"; 

export default function Home() {

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
    <View className={"flex font-sans"}>
      <View className="flex flex-col h-screen justify-between"> 
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
  );
}

