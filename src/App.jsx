import './App.css'
import Election from './Election';

function App() {
  return (
    <div className="App">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-center text-xl">Decentralized Voting App</h1>
      </header>
        <Election />
    </div>
  );
}

export default App
