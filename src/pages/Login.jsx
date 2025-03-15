import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";  // Importer axios
import { Card, CardBody, Input, Button, Typography, Spinner } from "@material-tailwind/react";

function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    console.log("Envoi des identifiants :", { email, password }); // 🔍 Vérifie avant l'envoi
  
    try {
      const response = await axios.post(`${apiUrl}/login`, { email, password }, {
        headers: { "Content-Type": "application/json" }
      });
      const token=response.data.token;
      console.log("Réponse du serveur:", response.data);
  
      if (token) {
        const decodedToken = JSON.parse(atob(token.split(".")[1])); // Décode le token
      localStorage.setItem("token", token);
      localStorage.setItem("token_expiration", decodedToken.exp * 1000);   
    setToken(token);
      navigate("/admin");
      } else {
        setError(response.data.error || "Connexion réussie, mais aucun token reçu.");
      }
    } catch (err) {
      console.error("Erreur lors de la connexion:", err.response?.data?.error || err.message);
      setError(err.response?.data?.error || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardBody>
          <Typography variant="h4" color="blue-gray" className="text-center font-bold">
            Connexion Admin
          </Typography>

          {error && (
            <Typography variant="small" color="red" className="text-center mt-2">
              {error}
            </Typography>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative w-full">
              <Input
                type={showPassword ? "text" : "password"}
                label="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <Button type="submit" color="blue" fullWidth disabled={loading}>
              {loading ? <Spinner className="h-5 w-5" /> : "Se connecter"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default Login;
