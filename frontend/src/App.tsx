import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { ReportPage } from './pages/ReportPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { SheltersPage } from './pages/SheltersPage';
import { ShelterDetailPage } from './pages/ShelterDetailPage';
import { ShelterApplyPage } from './pages/ShelterApplyPage';
import { AdoptionPipelinePage } from './pages/AdoptionPipelinePage';
import { ChatPage } from './pages/ChatPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPage } from './pages/AdminPage';
import { ShelterDashboardPage } from './pages/ShelterDashboardPage';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/reports/:id" element={<ReportDetailPage />} />
                <Route path="/shelters" element={<SheltersPage />} />
                <Route path="/shelters/:id" element={<ShelterDetailPage />} />
                <Route path="/shelters/apply" element={<ShelterApplyPage />} />
                <Route path="/shelter/dashboard" element={<ShelterDashboardPage />} />
                <Route path="/pipeline" element={<AdoptionPipelinePage />} />
                <Route path="/messages" element={<ChatPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
            <PwaInstallPrompt />
            <BottomNav />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
