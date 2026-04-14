import { useState, useEffect } from 'react';
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

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1200);
    const t2 = setTimeout(onDone, 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#0f172a] transition-opacity duration-500 ${fading ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      <img
        src="/logo.svg"
        alt="Home Workout"
        className="mb-5 h-40 w-40 drop-shadow-lg"
        style={{ animation: 'splashLogo 0.5s ease-out' }}
      />
      <p className="mb-6 text-3xl font-bold tracking-tight text-white">Home Workout</p>
      <div className="flex gap-2">
        <span className="h-2 w-2 animate-bounce rounded-full bg-green-500" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-green-400" style={{ animationDelay: '160ms' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-green-300" style={{ animationDelay: '320ms' }} />
      </div>
      <style>{`
        @keyframes splashLogo {
          from { transform: scale(0.75); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
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
    </>
  );
}
