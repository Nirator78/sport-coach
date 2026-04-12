import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WorkoutProvider } from './stores/workoutStore';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { BuilderPage } from './pages/BuilderPage';
import { PlayerPage } from './pages/PlayerPage';

export function App() {
  return (
    <BrowserRouter>
      <WorkoutProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/builder/:id?" element={<BuilderPage />} />
            <Route path="/player/:id" element={<PlayerPage />} />
          </Routes>
        </Layout>
      </WorkoutProvider>
    </BrowserRouter>
  );
}
