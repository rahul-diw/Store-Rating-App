import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import StoreDetail from "./pages/StoreDetail";
import StoreOwnerDashboard from "./pages/StoreOwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";


function ProtectedRoute({ allowedRole, children }) {
  const { user, loading } = useAuth();

  // Wait until saved login information is loaded
  if (loading) {
    return null;
  }

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User has a different role
  if (user.role !== allowedRole) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "store_owner") {
      return <Navigate to="/store-owner" replace />;
    }

    return <Navigate to="/user" replace />;
  }

  return children;
}


function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* CUSTOMER */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/store/:id"
        element={
          <ProtectedRoute allowedRole="user">
            <StoreDetail />
          </ProtectedRoute>
        }
      />


      {/* STORE OWNER */}
      <Route
        path="/store-owner"
        element={
          <ProtectedRoute allowedRole="store_owner">
            <StoreOwnerDashboard />
          </ProtectedRoute>
        }
      />


      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />


      {/* 404 */}
      <Route
        path="*"
        element={<h1>404 - Page Not Found</h1>}
      />
    </Routes>
  );
}

export default App;