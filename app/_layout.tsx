import { useEffect } from "react";
import { Stack, useRouter, usePathname } from "expo-router";
import { TouchableOpacity, PermissionsAndroid, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NearbyStatusBadge from "../components/NearbyStatusBadge";
import { useStorageP2P } from "../hooks/useStorage";

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
  const { clearStorageDaily } = useStorageP2P();
  const returnFunctiton = () => {
    router.navigate("/");
  };

  useEffect(() => {
    requestLocationNeabyDevicesPermission(); 
  }, []);

  useEffect(() => { 
    setInterval(() => {
      clearStorageDaily();
    }, 60 * 1000);
  }, [clearStorageDaily]);

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
        <TouchableOpacity onPress={() => returnFunctiton()}><Ionicons name="arrow-back" size={24} color="black" /></TouchableOpacity>
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
