import { items } from "../util/constants"; 
import { usePriorityQueue } from "../hooks/usePriority-Queue"; 
import { View, FlatList } from "react-native"; 
import { FOHTableView } from "../components/FOH/FOHTable";
import React from "react";
import { BOHItem } from "../components/BOH/BOHButtons";

export default function Home() {

  const {
    add,
    markWaiting,
    unmarkWaiting,
    updateBatchSize,
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
            return <BOHItem
              key={item.code}
              item={item} 
              onClickAdd={(batch: number) => { 
                let target = null;
                if(pq.pendingItems.find(i => i.code === item.code)){
                  target = pq.pendingItems.find(i => i.code === item.code);
                }else if(pq.waitingItems.find(i => i.code === item.code)){
                  target = pq.waitingItems.find(i => i.code === item.code);
                }
                if(target){
                  updateBatchSize(item.code, batch);
                  return;
                }
                add({
                  id: Date.now(),
                  name: item.name,
                  batchSize: batch,
                  waiting: false,
                  status: "pending",
                  createdAt: Date.now(),
                  code: item.code,
                  chineseName: item.chineseName
                });
              }} 
            />;
          }}
        />   
      </View>
      <View className="h-16 flex-1">
        <FOHTableView 
          items={[
            ...pq.inProgressItems,
            ...pq.waitingItems,
            ...pq.pendingItems,
          ]}
          history={[
            ...pq.history
          ]} 
          markWaiting={(code: string) => {
            markWaiting(code);
          }}
          unmarkWaiting={(code: string) => {
            unmarkWaiting(code);
          }}
        />
      </View>
    </View>
  );
}

