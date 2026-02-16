import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ExcelConverter from './pages/ExcelConverter';
import ImageConverter from './pages/ImageConverter';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/excel-to-latex" element={<ExcelConverter />} />
        <Route path="/image-to-latex" element={<ImageConverter />} />
      </Routes>
    </Router>
  );
}

export default App;
