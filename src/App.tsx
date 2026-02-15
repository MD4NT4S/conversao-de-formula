import { Converter } from './components/Converter';

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center py-12 px-4 font-sans">
      <div className="w-full max-w-5xl">
        <Converter />
      </div>
    </div>
  );
}

export default App;
