import { ItemController } from "../components/Item-Controller"; 
import { items } from "../util/constants"; 
import { usePriorityQueue } from "../hooks/usePriority-Queue"; 
import { View, FlatList } from "react-native";

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
        <View className="flex flex-row pb-10 overflow-auto">  
          <FlatList
            keyExtractor={(item) => item.code}
            numColumns={4}  
            data={items} 
            scrollEnabled
            renderItem={({ item }) => {
              const itemWaiting = pq.waitingTracker.has(item.code);
              const itemInQueue = findItem(item.name);
              return <ItemController
                key={item.code}
                item={item}
                onClickAdd={(batch: number) => {
                  add({
                    id: Date.now(),
                    name: item.name,
                    batchSize: batch,
                    waiting: false,
                    status: "pending",
                    createdAt: Date.now(),
                    code: item.code
                  });
                }}
                waiting={itemWaiting}
                onClickMarkWaiting={(code: string) => {
                  markWaiting(code);
                }}
                timestampStarted={itemInQueue?.createdAt}
              />;
            }}
          />  
        </View>
      </View>
    </View>
  );
}

