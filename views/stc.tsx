import { ItemController } from "../components/item-controller"; 
import { items } from "../util/constants"; 
import { usePriorityQueue } from "../hooks/usePriority-Queue"; 
import { View, Text } from "react-native"; 

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
      className={`flex min-h-screen items-center justify-center font-sans`}
    >
      <View className="flex min-h-screen w-full flex-col items-center justify-between">
        <View className="px-4 py-8 min-h-screen">
          <View className="text-2xl font-semibold text-center my-4 text-black">
            <Text>Steam Table Controllers</Text>
          </View>
          <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </View>
  );
}

