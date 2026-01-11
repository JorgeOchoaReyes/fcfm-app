import STC from "views/stc";
import "../global.css";
import { SafeAreaView } from "react-native-safe-area-context"; 



export default function App() {
  return (
    <SafeAreaView className="flex-1">    
      <STC /> 
    </SafeAreaView>
  );
}
