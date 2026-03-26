import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { BalloonProvider, useBalloonContext } from './contexts/BalloonContext';
import { AuthProvider } from './contexts/AuthContext';
import { AdminLogin, JudgeLogin } from './components/AdminLogin';
import { AdminPage } from './pages/AdminPage';
import { OperationsPage } from './pages/OperationsPage';
import { VolunteerPage } from './pages/VolunteerPage';
import { PublisherPage } from './pages/PublisherPage';
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
          🔒 <span>Admin Configuration</span>
        </Link>
        <Link to="/ops" className="btn-menu">
          🔑 <span>Judge / Staff Entry</span>
        </Link>
        <Link to="/volunteer" className="btn-menu">
          🚀 <span>Volunteer Dashboard</span>
        </Link>
        <Link to="/publisher" className="btn-menu">
          📢 <span>Publisher Dashboard</span>
        </Link>
        <Link to="/public" className="btn-menu">
          📺 <span>Public Display</span>
        </Link>
      </div>
    </div>
  </div>
);

// Loading component
const LoadingScreen = () => (
  <div className="container flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
      <h2 className="text-gradient">Loading...</h2>
      <p style={{ color: 'var(--text-muted)' }}>Connecting to database</p>
    </div>
  </div>
);

// App wrapper that checks loading state
const AppContent = () => {
  const { loading } = useBalloonContext();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={
        <AdminLogin>
          <AdminPage />
        </AdminLogin>
      } />
      <Route path="/ops" element={
        <JudgeLogin>
          <OperationsPage />
        </JudgeLogin>
      } />
      {/* Volunteer is PUBLIC - no login required */}
      <Route path="/volunteer" element={<VolunteerPage />} />
      <Route path="/publisher" element={<PublisherPage />} />
      <Route path="/public" element={<PublicPage />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BalloonProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </BalloonProvider>
    </AuthProvider>
  );
}

export default App;
