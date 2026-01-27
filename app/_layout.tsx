import { useEffect } from "react";
import { Stack, useRouter, usePathname } from "expo-router";
import { TouchableOpacity, PermissionsAndroid, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NearbyStatusBadge from "../components/NearbyStatusBadge";
import { useStorageP2P } from "../hooks/useStorage";
import * as Nearby from "expo-nearby-connections";
import { usePriorityQueue } from "../hooks/usePriority-Queue";

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
  const { clearStorageDaily, preferredPeerId, setConnectedPeer, setIsConnected, setDeviceName } = useStorageP2P();
  const { clearPriorityQueue } = usePriorityQueue(); 
  const returnFunctiton = () => {
    router.navigate("/");
  };

  useEffect(() => {
    requestLocationNeabyDevicesPermission(); 
  }, []);

  useEffect(() => { 
    setInterval(() => {
      // clearStorageDaily();
      // clearPriorityQueue();
    }, 60 * 1000);
  }, [clearStorageDaily, clearPriorityQueue]);

  useEffect(() => {
    const inviteSub = Nearby.onInvitationReceived( async (event) => { 
      alert(`Handshake initiated with ${event.peerId} - ${event.name}`);
      if (!preferredPeerId || event.peerId === preferredPeerId) {
        await Nearby.acceptConnection(event.peerId);
        setIsConnected(true);
        setConnectedPeer(event.peerId);
        setDeviceName(event.name);
      } else {
        if(event.name === "BOH" || event.name === "FOH") {
          await Nearby.acceptConnection(event.peerId);
          setIsConnected(true);
          setConnectedPeer(event.peerId);
          setDeviceName(event.name);
        }
      }
    }); 
  
    const disconnectSub = Nearby.onDisconnected(() => { 
      setIsConnected(false);
      setConnectedPeer(null);
      setDeviceName("");
      alert("Disconnected");
    });
  
    const payloadSub = Nearby.onTextReceived((event) => {
      const incomingData = JSON.parse(event.text); 
    });
   
    return () => {  
      disconnectSub();
      inviteSub();
      payloadSub();
      Nearby.stopDiscovery();
      Nearby.stopAdvertise();
    };
  }, []);
  

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
