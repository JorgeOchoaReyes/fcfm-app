import type { ItemViewType } from "../../util/constants";
import { LED } from "../LED"; 
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface ItemControllerProps {
  id?: string;
  children?: React.ReactNode;
  item: ItemViewType;
  waiting: boolean;
  onClickAdd: (batch: number) => void;
  onClickMarkWaiting: (name: string) => void;
}

export function ItemController({
  item,
  waiting,
  onClickAdd,
  onClickMarkWaiting, 
}: ItemControllerProps) {
  return (
    <View className={"w-[200px] mx-auto my-5"}>
      <View className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <View className="bg-red-500 px-4 py-2 text-center relative">
          <View className="flex flex-row justify-between items-center"> 
            <Text className="text-white text-sm font-bold mb-2">{item.name}</Text>
            <View className="flex items-center w-10 bg-green-600 w-content px-1 py-1 rounded-full text-sm font-semibold">
              <Text className="text-white text-md font-bold">{item.code}</Text>
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
            </View>
          </View> 
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
    display: "flex",
    justifyContent: "center",      
    borderRadius: 24,
    width: 30,
    height: 30, 
    alignItems: "center",
  },
  warningButton: {
    backgroundColor: "#f59e0b",  
    display: "flex",
    justifyContent: "center",      
    borderRadius: 24,
    width: 30,
    height: 30, 
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
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