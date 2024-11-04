import './App.css';
import { Game } from  './components/Game.tsx'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h2>Tiny Fantasy Maps</h2>
        <Game />
      </header>
    </div>
  );
}

export default App;
