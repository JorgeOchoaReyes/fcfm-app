import { Stack , useRouter } from "expo-router";  
import { TouchableOpacity, PermissionsAndroid } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";

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
  const returnFunctiton = () => {
    router.navigate("/");
  };

  useEffect(() => {
    requestLocationNeabyDevicesPermission();
  }, []);

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
