import './App.css';
import{Routes ,Route} from 'react-router-dom';
import Home from './pages/Home';
import { SocketProvider } from './providers/socket';
import Room from "./pages/room";
import { PeerProvider } from './providers/peer';

function App() {
  return (
    <div className="App">
      <SocketProvider>
        <PeerProvider>
      <Routes>
        <Route path='/' element ={<Home />} />
        <Route path='/room/:roomID' element ={<Room/>} />

      </Routes>
      </PeerProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
