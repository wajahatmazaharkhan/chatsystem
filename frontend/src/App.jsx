import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import './App.css'

function App() {
    useEffect(() => {
        document.documentElement.classList.add("dark");
    }, []);
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;