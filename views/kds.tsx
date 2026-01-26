import { usePriorityQueue } from "../hooks/usePriority-Queue"; 
import { Text, View } from "react-native";
import { KDS } from "../components/KDS"; 
import { useStorageP2P } from "../hooks/useStorage";

export default function Home() {

  const {
    listActive,
    listHistory,
    remove, 
    updateStatus,
    recall,
  } = usePriorityQueue(); 

  const { dateOfStorage } = useStorageP2P();

  return (
    <View className={"flex font-sans bg-white h-screen"}>
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
      <View className="h-16 flex-1">
        <Text>New Table</Text>
      </View>
    </View>
  );
}

