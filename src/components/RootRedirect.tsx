import { Navigate } from "react-router-dom";
import { useAuth } from "../Auth/Context/AuthContext";

const RootRedirect = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />;
};

export default RootRedirect;
