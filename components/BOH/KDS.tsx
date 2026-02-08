import { useStorageP2P } from "hooks/useStorage";
import { Item } from "../../types"; 
import { Timer } from "../Timer";
import React, { useState, memo } from "react";
import { View, TouchableOpacity, Text, FlatList, Switch }  from "react-native"; 

const assignBgTheme = (item: Item): string => {
  let theme = "";
  switch (item.status) {
  case "pending":
    theme = "text-black bg-white";
    break;
  case "in-progress":
    theme = "bg-yellow-500";
    break;
  case "completed":
    break;
  }
  switch (item.waiting) {
  case true:
    if (item.status !== "in-progress") theme = "bg-red-500 text-white";
    break;
  case false:
    break;
  }
  return theme;
};


const KDSItemView = memo(({
  item, 
  updateStatus,
  onRecall,
  itemCompleted = false,
  showChinese,
}: {
  item: Item;
  onDelete: (name: string) => void;
  updateStatus: (code: string, status?: "pending" | "in-progress" | "completed") => void;
  itemCompleted: boolean;
  showChinese: boolean;
  onRecall: (id: number) => void;
}) => {
  const active = (item.status === "in-progress" || item.waiting);
  const completed = itemCompleted;

  return (
    <TouchableOpacity
      className={`flex flex-row items-center m-1 p-2 rounded-xl border border-slate-500 ${completed ? "bg-slate-200 text-black" : assignBgTheme(item)}`}
      delayPressIn={0} 
      onPress={() => {
        if (completed) {
          onRecall(item.id);
        } else {
          updateStatus(item.code,);
        }
      }}
    >
      <View className="flex-[4] font-semibold"><Text className="text-xl font-bold" numberOfLines={1}>{showChinese ? item.chineseName : item.name}</Text></View>
      <View className="flex-[1] items-center"><Text className="text-xl font-bold">#{item.batchSize}</Text></View>
      <View className="flex-[2] items-center">  
        {
          completed ? <Text className="text-xl font-bold text-slate-400">--:--</Text> : <Timer 
            textSize="text-xl"
            textColor={active ? "text-white" : "text-black"} 
            startTimestamp={item.createdAt} 
          />
        }
      </View>
      <View className="flex-[1] items-center"><Text className="text-xls font-bold">{item.waiting ? "⚠️" : " "}</Text></View>
      <View className="flex-[2] items-center"><Text className="text-xl font-bold capitalize">
        {item.status === "in-progress" ? "cooking" : item.status}
      </Text></View> 
    </TouchableOpacity>
  );
});

interface KDSProps {
  items: Item[];
  history: Item[];
  onRecall: (id: number) => void;
  onDelete: (name: string) => void;
  onUpdateStatus: (code: string, status?: "pending" | "in-progress" | "completed") => void;
}

export const KDS = ({
  items,
  history,
  onDelete,
  onUpdateStatus,
  onRecall,
}: KDSProps) => {
  const [showHistory, setShowHistory] = useState(false);
  const { showChinese, setShowChinese } = useStorageP2P();
  
  return (
    <View className="rounded-2x p-6 overflow-auto w-full">
      <View className="flex flex-row items-center mb-4">
        <Text className="text-2xl font-bold flex-1">{showHistory ? "History" : "Items"}</Text>
        <View className="flex flex-row items-center">
          <Text>Chinese</Text>
          <Switch 
            value={showChinese}
            onValueChange={setShowChinese}
          />
        </View>
        <TouchableOpacity
          onPress={() => setShowHistory(!showHistory)}
          delayPressIn={0} 
          className="rounded-md cursor-pointer hover:bg-slate-300 bg-slate-200 text-black flex items-center text-sm p-2 align-end">
          <Text>{showHistory ? "Hide Completed" : "Show Completed"}</Text>
        </TouchableOpacity> 
      </View>

      <View className="flex flex-row items-center px-4 mb-2 pb-2 border-b border-slate-300">
        <Text className="flex-[4] font-bold text-slate-500 uppercase text-xs">Item</Text>
        <Text className="flex-[1] font-bold text-slate-500 uppercase text-xs text-center">Batch</Text>
        <Text className="flex-[2] font-bold text-slate-500 uppercase text-xs text-center">Time</Text>
        <Text className="flex-[1] font-bold text-slate-500 uppercase text-xs text-center">Wait</Text>
        <Text className="flex-[2] font-bold text-slate-500 uppercase text-xs text-center">Status</Text> 
      </View>
      <FlatList
        data={showHistory ? history : items}
        keyExtractor={(item) => item.code + item.id}
        scrollEnabled
        numColumns={1}
        renderItem={({ item }) => (
          <KDSItemView
            key={item.id}
            item={item}
            showChinese={showChinese}
            onDelete={onDelete}
            updateStatus={onUpdateStatus}
            itemCompleted={item.status === "completed" || item.status === "deleted"}
            onRecall={onRecall}
          />
        )}
      />  
    </View>
  );
};