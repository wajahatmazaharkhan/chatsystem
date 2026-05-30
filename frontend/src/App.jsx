import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import './App.css'

function App() {
    useEffect(() => {
        document.documentElement.classList.add("dark");
    }, []);
    return <AppRoutes />;
}

export default App;