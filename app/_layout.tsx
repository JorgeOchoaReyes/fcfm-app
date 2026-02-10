import { useEffect } from "react";
import { Stack, useRouter, usePathname } from "expo-router";
import { TouchableOpacity, PermissionsAndroid, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NearbyStatusBadge from "../components/NearbyStatusBadge";
import { useStorageP2P } from "../hooks/useStorage";
import * as Nearby from "expo-nearby-connections";
import { usePriorityQueue } from "../hooks/usePriority-Queue";
import { useStoreSync } from "../hooks/useSyncHook";

const requestLocationNeabyDevicesPermission = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple(
      [
        PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES, 
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, 
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, 
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, 
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,  
      ],
    );  
    const grantedAll = Object.values(granted).every((item) => item === "granted"); 
    if (grantedAll) {
      console.log("You can use locaiton, camera, and nearby devices");
    } else {
      console.log("Locaiton, camera, and nearby devices permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
};

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const setConnectedPeerId = useStorageP2P(state => state.setConnectedPeerId);
  const setConnectedPeerName = useStorageP2P(state => state.setConnectedPeerName);
  const setIsConnected = useStorageP2P(state => state.setIsConnected);
  const connectedPeerId = useStorageP2P(state => state.connectedPeerId);
  
  const { clearPriorityQueue, lastUpdated } = usePriorityQueue(); 

  useStoreSync(connectedPeerId);

  const returnFunctiton = () => {
    router.navigate("/");
  };

  useEffect(() => { 
    requestLocationNeabyDevicesPermission(); 
  }, []);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {  
  //     const today = new Date().toISOString().split("T")[0];
  //     const timestampToDate = new Date(lastUpdated).toISOString().split("T")[0];
  //     if (timestampToDate !== today) {
  //       clearPriorityQueue();
  //     }
  //   }, 60 * 60 * 1000);
  //   return () => clearInterval(intervalId);
  // }, [lastUpdated]);

  useEffect(() => {
    const inviteSub = Nearby.onInvitationReceived(async (event) => {  
      if (["BOH", "FOH"].includes(event.name)) { 
        try {
          await Nearby.acceptConnection(event.peerId); 
        } catch (e) {
          console.error("Error accepting connection at _layout:", e);
        }
      }  
    });
  
    const disconnectSub = Nearby.onDisconnected(() => { 
      setIsConnected(false);
      setConnectedPeerId(null);
      setConnectedPeerName("");
    });    

    return () => {  
      disconnectSub();
      inviteSub(); 
    };
  }, [setIsConnected, setConnectedPeerId, setConnectedPeerName]);
  

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
        <TouchableOpacity onPress={() => returnFunctiton()}><Ionicons name="arrow-back" size={32} color="black" /></TouchableOpacity>
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
