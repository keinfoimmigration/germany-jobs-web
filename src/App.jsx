import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Testimonials from './pages/Testimonials';
import CheckStatus from "./pages/CheckStatus";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobdetail" element={<JobDetail />} />
                  <Route path="/testimonials" element={<Testimonials />} />
                  <Route path="/checkstatus" element={<CheckStatus />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
