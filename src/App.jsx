import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Admin from "./pages/Admin";

const API_BASE_URL = "http://localhost:5000";


function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    const checkAuth = async () => {
      const expiration = localStorage.getItem("token_expiration");
      
      // Si l'utilisateur est sur une page publique, on ne vérifie pas le token
      const isPublicPage = ["/", "/about", "/portfolio", "/contact", "/login"].includes(window.location.pathname);
      if (isPublicPage) return;
  
      // Vérifier si le token est expiré
      if (!token || (expiration && Date.now() >= expiration)) {
        console.log("🔴 Token expiré, déconnexion...");
        handleLogout();
        return;
      }
  
      try {
        await axios.get(`${API_BASE_URL}/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Erreur de validation du token :", error);
        handleLogout();
      }
    };
  
    checkAuth();
    const interval = setInterval(checkAuth, 30000); // Vérifie toutes les 30 secondes
  
    return () => clearInterval(interval);
  }, [token]);
  

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiration");
    setToken(null);
    window.location.href = "/login"; // ✅ Redirige vers la page de connexion
  };

  return (
    <Router>
      
      <div className=" ">
    <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />

        <Header />
        <div className="flex-1 pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/admin" element={token ? <Admin setToken={setToken} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
