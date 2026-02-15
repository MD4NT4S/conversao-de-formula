import { Converter } from './components/Converter';

function App() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center py-10 px-4 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-slate-900/40 pointer-events-none" />
      <div className="relative z-10 w-full flex justify-center">
        <Converter />
      </div>
    </div>
  );
}

export default App;
