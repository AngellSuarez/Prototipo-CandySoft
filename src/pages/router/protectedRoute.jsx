import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem("access_token");
    const rol = localStorage.getItem("rol");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(rol)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
