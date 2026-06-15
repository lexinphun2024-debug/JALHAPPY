import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ElderlyModeProvider } from './context/ElderlyModeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ClaimCoach from './pages/ClaimCoach';
import SequencingOptimizer from './pages/SequencingOptimizer';
import RejectionHelp from './pages/RejectionHelp';
import PolicyDecoder from './pages/PolicyDecoder';

export default function App() {
  return (
    <ElderlyModeProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/claim-coach" element={<ClaimCoach />} />
              <Route path="/sequencing" element={<SequencingOptimizer />} />
              <Route path="/rejection-help" element={<RejectionHelp />} />
              <Route path="/policy-decoder" element={<PolicyDecoder />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ElderlyModeProvider>
  );
}