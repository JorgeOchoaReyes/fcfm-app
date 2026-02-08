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
  const {  
    preferredPeerId, 
    setConnectedPeerId, 
    setConnectedPeerName, 
    setIsConnected, 
    connectedPeerId 
  } = useStorageP2P();
  const { clearPriorityQueue } = usePriorityQueue(); 
  const returnFunctiton = () => {
    router.navigate("/");
  };

  useEffect(() => {
    requestLocationNeabyDevicesPermission(); 
  }, []);

  useEffect(() => {  
    const intervalId = setInterval(() => { 
    }, 30 * 60 * 1000 );
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const inviteSub = Nearby.onInvitationReceived(async (event) => {  
      if (!preferredPeerId || event.peerId === preferredPeerId || ["BOH", "FOH"].includes(event.name)) {
        console.log("Accepting invitation from:", event.name);
        try {
          await Nearby.acceptConnection(event.peerId); 
        } catch (e) {
          alert("Error accepting connection: " + e);
        }
      }  
    });
  
    const disconnectSub = Nearby.onDisconnected(() => { 
      setIsConnected(false);
      setConnectedPeerId(null);
      setConnectedPeerName("");
      alert("Disconnected");
    });   
 
    const textSub = Nearby.onTextReceived((event) => {
      console.log("📩 New Message Received:", event.text);
      try {
        const data = JSON.parse(event.text); 
        alert(`Sync received from ${event.peerId}`);
      } catch (e) {
        console.error("Failed to parse incoming sync text", e);
      }
    });

    return () => {  
      disconnectSub();
      inviteSub();
      textSub();
      Nearby.stopDiscovery();
      Nearby.stopAdvertise();
    };
  }, [preferredPeerId, connectedPeerId]);
  

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
