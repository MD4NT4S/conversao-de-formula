import { Converter } from './components/Converter';

function App() {
  return (
    <div className="min-h-screen w-full bg-white text-[#191A23] font-sans overflow-x-hidden selection:bg-[#B9FF66] selection:text-black">
      <div className="w-full min-h-screen flex flex-col items-center justify-start pt-12 pb-24 px-4 md:px-8">
        <Converter />
      </div>
    </div>
  );
}

export default App;
