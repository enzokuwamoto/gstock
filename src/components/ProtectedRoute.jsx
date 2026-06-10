import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && userProfile) {
    if (!allowedRoles.includes(userProfile.role)) {
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
}
