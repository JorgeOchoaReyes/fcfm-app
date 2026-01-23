import { Item } from "../types";
import { Ionicons } from "@expo/vector-icons";
import { Timer } from "./Timer";
import { useState } from "react";
import { View, TouchableOpacity, Text }  from "react-native"; 

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


const KDSItemView = ({
  item,
  onDelete,
  updateStatus,
  onRecall,
  itemCompleted = false,
}: {
  item: Item;
  onDelete: (name: string) => void;
  updateStatus: (code: string, status?: "pending" | "in-progress" | "completed") => void;
  itemCompleted: boolean;
  onRecall: (id: number) => void;
}) => {
  const active = (item.status === "in-progress" || item.waiting);
  const completed = itemCompleted;

  return (
    <TouchableOpacity
      className={`flex flex-row justify-around gap-4 m-4 p-6 rounded-3xl border border-slate-500 ${completed ? "bg-slate-200 text-black" : assignBgTheme(item)}`}
      delayPressIn={0} 
      onPress={() => {
        if (completed) {
          onRecall(item.id);
        } else {
          updateStatus(item.code,);
        }
      }}
    >
      <View className="col-span-2 font-semibold"><Text className="text-3xl">{item.name}</Text></View>
      <View className="text-center"><Text className="text-3xl">#{item.batchSize}</Text></View>
      {
        completed ? null : <View className="text-center text-2xl">
          <Timer 
            textSize="text-3xl"
            textColor={active ? "text-white" : "text-black"} 
            startTimestamp={item.createdAt} 
          />
        </View>
      }
      <View className="text-center"><Text className="text-3xl">{item.waiting ? "⚠️" : " "}</Text></View>
      <View className="text-center"><Text className="text-3xl">{item.status}</Text></View>
      <TouchableOpacity onPress={() => {
        if (completed) return;
        onDelete(item.code);
      }} className="text-black">
        <Text>
          <Ionicons name="trash" size={24} color="black" className="cursor-pointer" />
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

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
  return (
    <View className="rounded-2xl bg-slate-50 min-h-120 max-h-120 p-6 shadow-md overflow-auto">
      <TouchableOpacity
        onPress={() => setShowHistory(!showHistory)}
        delayPressIn={0} 
        className="rounded-md cursor-pointer hover:bg-slate-300 bg-slate-200 text-black flex items-center text-sm p-2 align-end ml-auto mb-6">
        <Text>{showHistory ? "Hide Completed" : "Show Completed"}</Text>
      </TouchableOpacity>
      {
        (
          showHistory ? history : items
        ).map((item) => (
          <KDSItemView
            key={item.id}
            item={item}
            onDelete={onDelete}
            updateStatus={onUpdateStatus}
            itemCompleted={item.status === "completed" || item.status === "deleted"}
            onRecall={onRecall}
          />
        ))
      }
    </View>
  );
};