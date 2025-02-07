import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { Card, CardBody, Input, Button, Typography, Spinner } from "@material-tailwind/react";

function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);  
      navigate("/admin");
    } catch (err) {
      console.error("Erreur lors de la connexion:", err.response ? err.response.data : err.message);
      setError("Identifiants incorrects");
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
            <Input type={showPassword ? "text" : "password"} label="Mot de passe" value={password} 
            onChange={(e) => setPassword(e.target.value)} required className="w-full pr-10" />
             <button  type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" >
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

