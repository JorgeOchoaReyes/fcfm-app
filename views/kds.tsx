import { usePriorityQueue } from "../hooks/usePriority-Queue"; 
import { FlatList, View } from "react-native";
import { KDS } from "../components/BOH/KDS";  
import { items } from "../util/constants"; 
import { BOHItem } from "components/BOH/BOHButtons";

export default function Home() {

  const { 
    pq,
    remove, 
    updateStatus,
    add,
    recall,
  } = usePriorityQueue(); 
 
  return (
    <View className={"flex font-sans flex-row bg-white"}>
      <View className="h-screen justify-start w-screen flex flex-row flex-1"> 
        <KDS
          items={[
            ...pq.inProgressItems,
            ...pq.waitingItems,
            ...pq.pendingItems,
          ]}
          history={[
            ...pq.history
          ]}
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
        <FlatList
          keyExtractor={(item) => item.code}
          numColumns={2}  
          data={items} 
          scrollEnabled
          renderItem={({ item }) => { 
            return <BOHItem
              key={item.code}
              item={item}
              onClickAdd={(batch: number) => {
                add({
                  id: Date.now(),
                  name: item.name,
                  batchSize: batch,
                  waiting: false,
                  status: "in-progress",
                  createdAt: Date.now(),
                  code: item.code,
                  chineseName: item.chineseName
                });
              }} 
            />;
          }}
        />   
      </View>
    </View>
  );
}

