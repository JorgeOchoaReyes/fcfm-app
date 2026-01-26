import type { ItemViewType } from "../util/constants";
import { LED } from "./LED";
import { Timer } from "./Timer";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface ItemControllerProps {
  id?: string;
  children?: React.ReactNode;
  item: ItemViewType;
  waiting: boolean;
  onClickAdd: (batch: number) => void;
  onClickMarkWaiting: (name: string) => void;
  timestampStarted?: number;
  status?: "pending" | "in-progress" | "completed" | "waiting" | "deleted" | null;
}

export function ItemController({
  item,
  waiting,
  onClickAdd,
  onClickMarkWaiting,
  timestampStarted,
  status,
}: ItemControllerProps) {
  return (
    <View className={"w-[260px] mx-auto my-5"}>
      <View className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <View className="bg-red-500 px-4 py-2 text-center relative">
          <View className="flex flex-row justify-between items-center"> 
            <Text className="text-white text-lg font-bold mb-2">{item.name}</Text>
            <View className="flex items-center w-16 bg-green-600 w-content px-4 py-1 rounded-full text-sm font-semibold">
              <Text className="text-white font-bold">{item.code}</Text>
            </View>
          </View> 
          <View className="flex flex-row items-center"> 
            <Ionicons name="time" size={16} color="white" />
            <Text className="text-center text-white font-semibold text-sm">
              {item.cookTime}
            </Text>
          </View>
        </View>
        <View className="p-2">
          <View className=" rounded-lg overflow-hidden">
            <View style={styles.table}> 
              <View style={styles.row}>
                {[1, 2, 3].map((n) => (
                  <View key={n} style={styles.cell}>  
                    <TouchableOpacity
                      style={styles.redButton}
                      onPress={() => onClickAdd(n)}
                      delayPressIn={0} 
                    >
                      <Text style={styles.buttonText}>{n}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={[styles.cell, styles.center]}>
                  <LED state={waiting ? "on" : "off"} pulse={waiting} />
                  <TouchableOpacity
                    style={[styles.warningButton, { marginTop: 8 }]}
                    onPress={() => onClickMarkWaiting(item.code)}
                    delayPressIn={0} 
                  >
                    <Text style={styles.buttonText}>W</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Label row */}
              {/* <View style={styles.row}>
                <View style={styles.cell}>
                  <Text style={styles.headerText}>#1</Text>
                </View>
                <View style={styles.cell}>
                  <Text style={styles.headerText}>#2</Text>
                </View>
                <View style={styles.cell}>
                  <Text style={styles.headerText}>#3</Text>
                </View>
                <View style={styles.cell}>
                  <Text style={styles.headerText}></Text>
                </View>
              </View> */}

              {/* Data row */}
              {/* <View style={styles.row}>
                <View style={styles.cell}>
                  <Text style={styles.valueText}>{item.batchServings[1].toFixed(0)}</Text>
                </View>
                <View style={styles.cell}>
                  <Text style={styles.valueText}>{item.batchServings[2].toFixed(0)}</Text>
                </View>
                <View style={styles.cell}>
                  <Text style={styles.valueText}>{item.batchServings[3].toFixed(0)}</Text>
                </View>
                <View style={styles.cell}>
                  <Text style={styles.valueText}></Text>
                </View>
              </View> */}
            </View>
          </View>
          {
            timestampStarted ? <View className="mt-1 flex flex-row justify-center items-center">
              <Text className="text-gray-900 font-semibold">
                {
                  status === "pending" ? "Pending: " : 
                    status === "in-progress" ? "Cooking: " : 
                      status === "completed" ? "Completed: " : 
                        status === "waiting" ? "Waiting: " : 
                          status === "deleted" ? "Deleted: " : ""
                }  
              </Text>
              <Timer startTimestamp={timestampStarted} /></View> : null
          }
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  cell: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  center: {
    alignItems: "center",
  },
  redButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  warningButton: {
    backgroundColor: "#f59e0b",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  headerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  valueText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
});