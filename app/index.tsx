import "../global.css";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";

export default function App() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen />
      <SafeAreaView style={styles.container}>    
        <TouchableOpacity onPress={() => router.push("/kds")} style={styles.bigButtonBOH}>
          <Text style={styles.buttonText}>BOH</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/stc")} style={styles.bigButtonFOH}>
          <Text style={styles.buttonText}>FOH</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/settings")} style={styles.bigButtonSettings}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </SafeAreaView> 
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,  
  },
  bigButtonFOH: { 
    height: "30%",
    width: "20%",
    backgroundColor: "green",
    borderRadius: 10,
    alignItems: "center", 
    justifyContent: "center",
  },
  bigButtonBOH: { 
    height: "30%",
    width: "20%",
    backgroundColor: "blue",
    borderRadius: 10,
    alignItems: "center", 
    justifyContent: "center",
  },
  bigButtonSettings: { 
    height: "30%",
    width: "20%",
    backgroundColor: "gray",
    borderRadius: 10,
    alignItems: "center", 
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});