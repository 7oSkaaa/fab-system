import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { BalloonProvider } from './contexts/BalloonContext';
import { AdminPage } from './pages/AdminPage';
import { OperationsPage } from './pages/OperationsPage';
import { VolunteerPage } from './pages/VolunteerPage';
import { PublicPage } from './pages/PublicPage';

const HomePage = () => (
  <div className="container flex flex-col items-center justify-center" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
    {/* Hero */}
    <div className="animate-float card animate-glow" style={{
      padding: '2rem 3rem',
      marginBottom: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', margin: 0, marginBottom: '0.5rem' }}>
        🎈 <span className="text-gradient">FAB System</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', margin: 0 }}>First Accepted Balloon Tracking</p>
    </div>

    {/* Navigation Card */}
    <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
      <h2 style={{ marginTop: 0, marginBottom: 'var(--space-md)', fontSize: '1.2rem' }}>
        Choose an option
      </h2>

      <div className="flex flex-col gap-sm">
        <Link to="/admin" className="btn-menu">
          ⚙️ <span>Admin Configuration</span>
        </Link>
        <Link to="/ops" className="btn-menu">
          👨‍⚖️ <span>Judge / Staff Entry</span>
        </Link>
        <Link to="/volunteer" className="btn-menu">
          🚀 <span>Volunteer Dashboard</span>
        </Link>
        <Link to="/public" className="btn-menu">
          📺 <span>Public Display</span>
        </Link>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <BalloonProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/ops" element={<OperationsPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/public" element={<PublicPage />} />
        </Routes>
      </BrowserRouter>
    </BalloonProvider>
  );
}

export default App;
