import type { ItemViewType } from "../util/constants";
import { LED } from "./led";
import { Timer } from "./timer";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export interface ItemControllerProps {
  id?: string;
  children?: React.ReactNode;
  item: ItemViewType;
  waiting: boolean;
  onClickAdd: (batch: number) => void;
  onClickMarkWaiting: (name: string) => void;
  timestampStarted?: number;
}

export function ItemController({
  item,
  waiting,
  onClickAdd,
  onClickMarkWaiting,
  timestampStarted,
}: ItemControllerProps) {
  return (
    <View className={"w-full max-w-sm mx-auto"}>
      <View className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <View className="bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-center relative">
          <Text className="text-white text-2xl font-bold mb-2">{item.name}</Text>
          <View className="inline-block bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            <Text>{item.code}</Text>
          </View>
        </View>
        <View className="p-2">
          <View className=" rounded-lg overflow-hidden">
            <View style={styles.table}>
      {/* Header row */}
      <View style={styles.row}>
        {[1, 2, 3].map((n) => (
          <View key={n} style={styles.cell}>
            <TouchableOpacity
              style={styles.redButton}
              onPress={() => onClickAdd(n)}
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
          >
            <Text style={styles.buttonText}>W</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Label row */}
      <View style={styles.row}>
        <View style={styles.cell}>
          <Text style={styles.headerText}>#1 Srv</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.headerText}>#2 Srv</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.headerText}>#3 Srv</Text>
        </View>
      </View>

      {/* Data row */}
      <View style={styles.row}>
        <View style={styles.cell}>
          <Text style={styles.valueText}>{item.batchServings[1]}</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.valueText}>{item.batchServings[2]}</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.valueText}>{item.batchServings[3]}</Text>
        </View>
      </View>
    </View>
          </View>
          {
            timestampStarted ? <View className="mt-5"><Timer startTimestamp={timestampStarted} /></View> : null
          }
          <Text className="text-center text-gray-900 font-semibold mt-6">
            Cook time: {item.cookTime}
          </Text>
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
    paddingHorizontal: 16,
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
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  valueText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
});