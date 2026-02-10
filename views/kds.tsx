import React, { useMemo, useCallback } from "react";
import { usePriorityQueue } from "../hooks/usePriority-Queue"; 
import { FlatList, View } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { KDS } from "../components/BOH/KDS";  
import { items as staticItems, ItemViewType } from "../util/constants"; 
import { BOHItem } from "../components/BOH/BOHButtons";

export default function Home() {
  const [isMenuCollapsed, setIsMenuCollapsed] = React.useState(false);
  const { pendingItems, inProgressItems, waitingItems, history } = usePriorityQueue(
    useShallow((state) => ({
      pendingItems: state.pq.pendingItems,
      inProgressItems: state.pq.inProgressItems,
      waitingItems: state.pq.waitingItems,
      history: state.pq.history,
    }))
  );

  const remove = usePriorityQueue((state) => state.remove);
  const updateStatus = usePriorityQueue((state) => state.updateStatus);
  const add = usePriorityQueue((state) => state.add);
  const recall = usePriorityQueue((state) => state.recall);

  const handleAdd = useCallback((item: ItemViewType, batch: number) => {
    add({
      id: Date.now(),
      status: "pending",
      batchSize: batch,
      code: item.code,
      name: item.name,
      chineseName: item.chineseName,
      waiting: false,
      createdAt: Date.now(),
      history: []
    });
  }, [add]);

  const handleRemove = useCallback((code: string) => {
    remove(code);
  }, [remove]);

  const handleRecall = useCallback((id: number) => {
    recall(id);
  }, [recall]);

  const handleUpdateStatus = useCallback((code: string) => {
    updateStatus(code);
  }, [updateStatus]);

  const activeItems = useMemo(() => [
    ...inProgressItems,
    ...waitingItems,
    ...pendingItems,
  ], [inProgressItems, waitingItems, pendingItems]);
 
  return (
    <View className={"flex font-sans flex-row bg-white"}>
      <View className="h-screen justify-start flex flex-row flex-1"> 
        <KDS
          items={activeItems}
          history={history}
          onRecall={handleRecall}
          onDelete={handleRemove}
          onUpdateStatus={(code: string) => handleUpdateStatus(code)}
          isMenuCollapsed={isMenuCollapsed}
          onToggleMenu={() => setIsMenuCollapsed(!isMenuCollapsed)}
        /> 
      </View>
      {!isMenuCollapsed && (
        <View className="h-screen flex-6">
          <FlatList
            keyExtractor={(item) => item.code}
            numColumns={2}  
            data={staticItems} 
            scrollEnabled
            columnWrapperStyle={{ gap: 10 }}
            renderItem={({ item }) => (
              <BOHItem
                key={item.code}
                item={item}
                isFoh={false}
                onClickAdd={(batch: number) => handleAdd(item, batch)}
              />
            )}
          />   
        </View>
      )}
    </View>
  );
}

