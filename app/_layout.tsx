import { Stack, useRouter, usePathname } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NearbyStatusBadge from "../components/NearbyStatusBadge";
import { useStorageP2P } from "../hooks/useStorage"; 
import { useStoreSync } from "../hooks/useSyncHook"; 
import { useReconnect } from "../hooks/useReconnect";
import { useDailyClear } from "hooks/useDailyClear";
import { usePermissions } from "hooks/usePermissions";

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname(); 
  const connectedPeerId = useStorageP2P(state => state.connectedPeerId);    

  usePermissions();
  useStoreSync(connectedPeerId);
  useReconnect();
  useDailyClear();

  const returnFn = () => {
    if (router.canDismiss()) {
      router.dismissAll();
    } else {
      router.replace("/");
    }
  };

  return <>
    <NearbyStatusBadge />
    {
      pathname !== "/" &&
      <View style={  {
        position: "absolute",
        top: 20, 
        left: 16,
        zIndex: 9999, 
        elevation: 5,
      }}> 
        <TouchableOpacity onPress={() => returnFn()}><Ionicons name="arrow-back" size={32} color="black" /></TouchableOpacity>
      </View>
    }
    <Stack
      screenOptions={{  
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="stc" />
      <Stack.Screen name="kds" />
    </Stack>
  </>;
}
