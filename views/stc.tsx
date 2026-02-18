import { items, ItemViewType } from "../util/constants"; 
import { usePriorityQueue } from "../hooks/usePriority-Queue"; 
import { View, FlatList } from "react-native"; 
import { FOHTableView } from "../components/FOH/FOHTable";
import React, { useMemo, useCallback } from "react";
import { BOHItem } from "../components/BOH/BOHButtons";
import { useShallow } from "zustand/react/shallow";

export default function Home() {
  const { pendingItems, inProgressItems, waitingItems, history } = usePriorityQueue(
    useShallow((state) => ({
      pendingItems: state.pendingItems,
      inProgressItems: state.inProgressItems,
      waitingItems: state.waitingItems,
      history: state.history,
    }))
  );

  const add = usePriorityQueue(state => state.add);
  const markWaiting = usePriorityQueue(state => state.markWaiting);
  const unmarkWaiting = usePriorityQueue(state => state.unmarkWaiting);
  const updateBatchSize = usePriorityQueue(state => state.updateBatchSize);

  const handleAdd = useCallback((item: ItemViewType, batch: number) => {
    let target = pendingItems.find(i => i.code === item.code) || waitingItems.find(i => i.code === item.code);
    if (target) {
      updateBatchSize(item.code, batch);
    } else {
      add({
        id: Date.now(),
        name: item.name,
        batchSize: batch,
        waiting: false,
        status: "pending",
        createdAt: Date.now(),
        code: item.code,
        chineseName: item.chineseName,
        history: []
      });
    }
  }, [add, updateBatchSize, pendingItems, waitingItems]);

  const handleMarkWaiting = useCallback((code: string) => {
    markWaiting(code);
  }, [markWaiting]);

  const handleUnmarkWaiting = useCallback((code: string) => {
    unmarkWaiting(code);
  }, [unmarkWaiting]);

  const activeItems = useMemo(() => [
    ...inProgressItems,
    ...waitingItems,
    ...pendingItems,
  ], [inProgressItems, waitingItems, pendingItems]);
  
  return (
    <View className={"flex font-sans flex-row"}>
      <View className="h-screen justify-start w-screen flex flex-row flex-1">   
        <FlatList
          keyExtractor={(item) => item.code}
          numColumns={2}  
          data={items} 
          scrollEnabled
          renderItem={({ item }) => (
            <BOHItem
              key={item.code}
              item={item} 
              isFoh={true}
              onClickAdd={(batch: number) => handleAdd(item, batch)} 
            />
          )}
        />   
      </View>
      <View className="h-screen justify-start flex flex-row flex-1"> 
        <FOHTableView 
          items={activeItems}
          history={history.sort((a, b) => b.createdAt - a.createdAt)} 
          markWaiting={handleMarkWaiting}
          unmarkWaiting={handleUnmarkWaiting}
        />
      </View>
    </View>
  );
}

