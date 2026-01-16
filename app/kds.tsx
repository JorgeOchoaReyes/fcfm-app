import "../global.css";
import KDS from "views/kds";
import { SafeAreaView } from "react-native-safe-area-context"; 



export default function App() {
  return (
    <SafeAreaView className="flex-1">    
      <KDS /> 
    </SafeAreaView>
  );
}
