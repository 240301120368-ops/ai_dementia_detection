import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { TestProvider } from './context/TestContext';

// Import page components
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import DataEntry from './pages/DataEntry';
import Profile from './pages/Profile';
import Results from './pages/Results';
import PonyLanding from './pages/PonyLanding';
import CinematicLanding from './pages/CinematicLanding';

// Import test components
import MemoryTest from './pages/MemoryTest';
import AttentionTest from './pages/AttentionTest';
import ClockDrawingTest from './pages/ClockDrawingTest';
import VisualSpatialTest from './pages/VisualSpatialTest';

// Import custom cursor
import CustomCursor from './components/CustomCursor';

function App() {
  return (
    <TestProvider>
      <CustomCursor />
      <Routes>
        <Route path="/" element={<PonyLanding />} />
        <Route path="/legacy-home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Assessment Test Routes */}
        <Route path="/test/memory" element={<MemoryTest />} />
        <Route path="/test/attention" element={<AttentionTest />} />
        <Route path="/test/clock-drawing" element={<ClockDrawingTest />} />
        <Route path="/test/visual-spatial" element={<VisualSpatialTest />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/results" element={<Results />} />
        <Route path="/data-entry" element={<DataEntry />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/agency" element={<PonyLanding />} />
      </Routes>
    </TestProvider>
  );
}

export default App;
