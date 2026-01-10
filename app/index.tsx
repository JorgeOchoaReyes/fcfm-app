import KDS from 'views/kds'; 
import STC from 'views/stc';
import '../global.css';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';



export default function App() {
  return (
    <SafeAreaView className="flex-1">   
      <ScrollView> 
        <STC />
      </ScrollView>
    </SafeAreaView>
  );
}
