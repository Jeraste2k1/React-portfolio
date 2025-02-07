import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import Login from './pages/Login';
import Admin from "./pages/Admin";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          await axios.get("http://localhost:5000/admin", {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (error) {
          console.error("Erreur de validation du token :", error);
          setToken(null);
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
    };
    checkAuth();
  }, [token]);

  return (
    <Router>
      <div className=" ">
        <Header />
        <div className="flex-1 pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/admin" element={token ? <Admin setToken={setToken} /> : <Navigate to="/login" />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
