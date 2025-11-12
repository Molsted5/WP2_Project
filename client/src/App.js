import './App.css';
import SpaceStation from './components/SpaceStation';

//const ws = new WebSocket('ws://localhost:3500');
//ws={ws

function App() {
  return (
    <div className="App">
      <h1>Space Station Tracker</h1>
      <SpaceStation/>
    </div>
  );
}

export default App;
