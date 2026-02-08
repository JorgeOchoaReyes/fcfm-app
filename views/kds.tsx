import React, { useMemo } from "react";
import { usePriorityQueue } from "../hooks/usePriority-Queue"; 
import { FlatList, View } from "react-native";
import { KDS } from "../components/BOH/KDS";  
import { items as staticItems } from "../util/constants"; 
import { BOHItem } from "components/BOH/BOHButtons";

export default function Home() {

  const { 
    pq,
    remove, 
    updateStatus,
    add,
    recall,
  } = usePriorityQueue(); 

  const activeItems = useMemo(() => [
    ...pq.inProgressItems,
    ...pq.waitingItems,
    ...pq.pendingItems,
  ], [pq.inProgressItems, pq.waitingItems, pq.pendingItems]);

  const historyItems = useMemo(() => [
    ...pq.history
  ], [pq.history]);
 
  return (
    <View className={"flex font-sans flex-row bg-white"}>
      <View className="h-screen justify-start w-screen flex flex-row flex-1"> 
        <KDS
          items={activeItems}
          history={historyItems}
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
      <View className="h-16 flex-3">
        <FlatList
          keyExtractor={(item) => item.code}
          numColumns={2}  
          data={staticItems} 
          scrollEnabled
          columnWrapperStyle={{ gap: 16 }}
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

