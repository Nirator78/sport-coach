import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WorkoutProvider } from './stores/workoutStore';
import { ClipboardProvider } from './stores/clipboardStore';
import { ThemeProvider } from './stores/themeStore';
import { SettingsProvider } from './stores/settingsStore';
import { ExerciseProvider } from './stores/exerciseStore';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { BuilderPage } from './pages/BuilderPage';
import { PlayerPage } from './pages/PlayerPage';
import { SettingsPage } from './pages/SettingsPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReloadPrompt } from './components/ui/ReloadPrompt';

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SettingsProvider>
          <WorkoutProvider>
            <ExerciseProvider>
            <ClipboardProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/builder/:id?" element={<BuilderPage />} />
                  <Route path="/player/:id" element={<PlayerPage />} />
                  <Route path="/exercises" element={<ExercisesPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Layout>
            </ClipboardProvider>
            <ReloadPrompt />
            </ExerciseProvider>
          </WorkoutProvider>
        </SettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
