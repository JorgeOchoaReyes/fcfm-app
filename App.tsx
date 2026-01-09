import { ScreenContent } from 'components/ScreenContent';
import { StatusBar } from 'expo-status-bar';
import KDS from 'views/kds';
import STC from 'views/stc';
import './global.css';

export default function App() {
  return (
    <>
      <ScreenContent title="Home" path="./views/kds">
        <KDS />
        {/* <STC /> */}
      </ScreenContent> 
      <StatusBar style="auto" />
    </>
  );
}
