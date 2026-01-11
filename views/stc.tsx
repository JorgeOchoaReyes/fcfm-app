import { ItemController } from "../components/item-controller"; 
import { items } from "../util/constants"; 
import { usePriorityQueue } from "../hooks/usePriority-Queue"; 
import { View, Text } from "react-native";
import { KDS } from "../components/kds"; 

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
    <View
      className={"flex min-h-screen font-sans max-w-full"}
    >
      <View className="flex flex-col justify-between">
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
        <View className="grid grid-cols-3 gap-4 flex-1">
          {
            items.map(item => {
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
            })
          }
        </View> 
      </View>
    </View>
  );
}

