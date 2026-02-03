import type { ItemViewType } from "../../util/constants";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"; 

export interface ItemControllerProps {
  id?: string;
  children?: React.ReactNode;
  item: ItemViewType;
  onClickAdd: (batch: number) => void;
}

export function BOHItem({
  item, 
  onClickAdd, 
}: ItemControllerProps) {
  return (
    <View className={"w-[200px] mx-auto my-1"}>
      <View className="bg-red-500  rounded-2xl shadow-lg overflow-hidden">
        <View className="px-4 flex items-center py-2 text-center relative">
          <View className="flex flex-row justify-between items-center"> 
            <Text className="text-white text-lg font-bold">{item.name}</Text> 
          </View>  
        </View>
        <View className="">
          <View className="rounded-lg overflow-hidden">
            <View style={styles.table}> 
              <View style={styles.row}>
                {[1, 2, 3].map((n) => (
                  <View key={n} style={styles.cell}>  
                    <TouchableOpacity
                      style={
                        n === 1 ? styles.redButtonFirst : 
                          n === 3 ? styles.redButtonLast : 
                            styles.redButton
                      }
                      onPress={() => onClickAdd(n)}
                      delayPressIn={0} 
                    >
                      <Text style={styles.buttonText}>{n}</Text>
                    </TouchableOpacity>
                  </View>
                ))} 
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
  },
  center: {
    alignItems: "center",
  },
  redButton: {
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",       
    borderTopWidth: 1,  
    borderLeftWidth: 1, 
    borderRightWidth: 1, 
    borderColor: "red",  
    height: 30, 
    alignItems: "center",
  }, 
  redButtonFirst: {
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",       
    borderTopWidth: 1,   
    borderRightWidth: 1, 
    borderColor: "red",  
    height: 30, 
    alignItems: "center",
  }, 
  redButtonLast: {
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",       
    borderTopWidth: 1,  
    borderLeftWidth: 1,  
    borderColor: "red",  
    height: 30, 
    alignItems: "center",
  }, 
  buttonText: {
    color: "black",
    fontWeight: "bold",
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