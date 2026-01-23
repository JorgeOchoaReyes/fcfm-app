import { Stack , useRouter } from "expo-router";  
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";


export default function RootLayout() {
  const router = useRouter();
  const returnFunctiton = () => {
    router.navigate("/");
  };

  return <>
    <Stack
      screenOptions={{ 
        headerLeft: () => <TouchableOpacity onPress={() => returnFunctiton()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>,
        title: "",
        headerStyle: {
          backgroundColor: "#f31e29",
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="stc" />
      <Stack.Screen name="kds" />
    </Stack>
  </>;
}
