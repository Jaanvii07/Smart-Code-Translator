import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";

function AppLayout({ children }) {
  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

function App() {
  return (
    <div className="h-screen w-full bg-black text-[#E4E4E7]">
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HomePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HistoryPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;