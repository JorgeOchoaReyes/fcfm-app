import { ItemController } from "../components/Item-Controller"; 
import { items } from "../util/constants"; 
import { usePriorityQueue } from "../hooks/usePriority-Queue"; 
import { View, FlatList, Text } from "react-native"; 

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
    <View className={"flex font-sans flex-row"}>
      <View className="h-screen justify-start w-screen flex flex-row flex-1"> 
        <FlatList
          keyExtractor={(item) => item.code}
          numColumns={2}  
          data={items} 
          scrollEnabled
          renderItem={({ item }) => { 
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
              waiting={itemInQueue?.waiting ?? false}
              onClickMarkWaiting={(code: string) => {
                markWaiting(code);
              }}
              timestampStarted={itemInQueue?.createdAt}
              status={itemInQueue?.status ?? null}
            />;
          }}
        />   
      </View>
      <View className="h-16 flex-1">
        <Text>New Table</Text>
      </View>
    </View>
  );
}

