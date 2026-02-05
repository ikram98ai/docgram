import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthGuard } from "./components/auth/auth-guard";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import Providers from "./pages/providers";
import { AppLayout } from "./components/app-layout";

function App() {
  return (
    <Router>
      <Providers>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected Routes */}
            <Route element={<AuthGuard />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/search" element={<SearchPage />} />
            </Route>
          </Routes>
        </AppLayout>
      </Providers>{" "}
    </Router>
  );
}

export default App;
