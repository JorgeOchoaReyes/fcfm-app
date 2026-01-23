import { ItemController } from "../components/Item-Controller"; 
import { items } from "../util/constants"; 
import { usePriorityQueue } from "../hooks/usePriority-Queue"; 
import { View, FlatList } from "react-native";
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
      <View className="flex flex-col h-screen justify-between w-screen">
        {/* <View className="flex flex-col h-screen justify-between"> 
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
        </View> */} 
        <FlatList
          keyExtractor={(item) => item.code}
          numColumns={4}  
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
    </View>
  );
}

