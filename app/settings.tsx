import Settings from "views/connection";
import "../global.css";
import { SafeAreaView } from "react-native-safe-area-context"; 

export default function App() {
  return (
    <SafeAreaView className="flex-1">    
      <Settings /> 
    </SafeAreaView>
  );
}