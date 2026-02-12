import { PermissionsAndroid } from "react-native";
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

export const usePermissions = () => {
  useEffect(() => { 
    requestLocationNeabyDevicesPermission(); 
  }, []);   
};