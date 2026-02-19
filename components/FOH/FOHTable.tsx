import React, { memo , useState } from "react";
import { Item } from "../../types"; 
import { Timer } from "../Timer";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity, Text, FlatList }  from "react-native"; 

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

const textTheme = (item: Item): string => {
  let theme = "";
  switch (item.status) {
  case "pending":
    theme = "text-black";
    break;
  case "in-progress":
    theme = "text-white";
    break;
  case "completed":
    theme = "text-black";
    break;
  }
  switch (item.waiting) {
  case true:
    if (item.status !== "in-progress" && item.status !== "completed") theme = "text-white";
    break;
  case false:
    break;
  } 
  return theme;
};

const KDSItemView = memo(({
  item,
  itemCompleted = false,
  onPress,
  unmarkWaiting,
  remove,
}: {
  item: Item;
  itemCompleted: boolean; 
  onPress: () => void;
  unmarkWaiting: (code: string) => void;
  remove: (code: string) => void;
}) => { 
  const completed = itemCompleted;

  return (
    <TouchableOpacity
      onPress={
        item.waiting ? () => unmarkWaiting(item.code) : () => onPress()
      }
      delayPressIn={0}
      className={`flex flex-row items-center p-2 rounded-xl ${(completed || item.status === "deleted") ? "bg-slate-200 text-black" : assignBgTheme(item)}`}
    >
      <View className="flex-[1] items-center font-bold"><Text className={`text-2xl font-bold ${textTheme(item)}`} numberOfLines={1}>{item.code}</Text></View>
      <View className="flex-[2] items-center"><Text className={`text-2xl font-bold ${textTheme(item)}`}>#{item.batchSize}</Text></View>
      <View className="flex-[2] items-center">
        {
          (completed || item.status === "deleted") ? <Text className="text-xl text-slate-400">--:--</Text> : <Timer 
            textSize="text-2xl"
            textColor={textTheme(item)} 
            startTimestamp={item.createdAt} 
          />
        }
      </View>
      <View className="flex-[1] items-center"><Text className={"text-2xl"}>{item.waiting ? "⚠️" : " "}</Text></View>
      <View className="flex-[2] items-center"><Text className={`text-xl capitalize ${textTheme(item)}`}>{item.status === "in-progress" ? "cooking" : item.status}</Text></View>
      {
        !(completed || item.status === "deleted") && (
          <TouchableOpacity
            onPress={() => remove(item.code)}
            delayPressIn={0}
            className="flex-[1] items-center"
          >
            <Ionicons name="trash" size={24} color={
              item.waiting ? "white" : "red"
            } />
          </TouchableOpacity>)
      }
    </TouchableOpacity>
  );
});

interface FOHTableViewProps {
  items: Item[];
  history: Item[]; 
  markWaiting: (code: string) => void;
  unmarkWaiting: (code: string) => void;
  remove: (code: string) => void;
}

export const FOHTableView = ({
  items,
  history, 
  markWaiting,
  unmarkWaiting,
  remove
}: FOHTableViewProps) => {
  const [showHistory, setShowHistory] = useState(false);
  return (
    <View className="rounded-2x p-6 flex-1 w-full h-[90vh]">
      <View className="flex flex-row items-center mb-4">
        <Text className="text-2xl font-bold flex-1">{showHistory ? "History" : "Items"}</Text>
        <TouchableOpacity
          onPress={() => setShowHistory(!showHistory)}
          delayPressIn={0} 
          className="rounded-md cursor-pointer hover:bg-slate-300 bg-slate-200 text-black flex items-center text-sm p-2 align-end">
          <Text>{showHistory ? "Hide Completed" : "Show Completed"}</Text>
        </TouchableOpacity> 
      </View> 
      <View className="flex flex-row items-center px-4 mb-2 pb-2 border-b border-slate-300">
        <Text className="flex-[1] font-bold text-slate-500 uppercase text-xs">Item</Text>
        <Text className="flex-[2] font-bold text-slate-500 uppercase text-xs text-center">Batch</Text>
        <Text className="flex-[2] font-bold text-slate-500 uppercase text-xs text-center">Time</Text>
        <Text className="flex-[1] font-bold text-slate-500 uppercase text-xs text-center">Wait</Text>
        <Text className="flex-[2] font-bold text-slate-500 uppercase text-xs text-center">Status</Text> 
        <Text className="flex-[1] font-bold text-slate-500 uppercase text-xs text-center">Delete</Text>
      </View>
      <FlatList
        data={showHistory ? history : items}
        keyExtractor={(item) => item.code}
        scrollEnabled
        numColumns={1}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <KDSItemView
            key={item.id}
            item={item} 
            itemCompleted={item.status === "completed"} 
            onPress={() => markWaiting(item.code)}
            unmarkWaiting={unmarkWaiting}
            remove={remove}
          />
        )}
      />  
    </View>
  );
};