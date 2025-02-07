import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Card, Input, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";


const Admin = ({ setToken }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [files, setFiles] = useState([]);
  const [fileInput, setFileInput] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
const [loadingPassword, setLoadingPassword] = useState(false);
const [showForm,setShowForm]=useState(false);
const [showPassword, setShowPassword] = useState(false);
const [showPasword, setShowPasword] = useState(false);
 
  const navigate = useNavigate();
  const apiUrl =  "http://localhost:5000";

  // Charger les catégories au démarrage
  useEffect(() => {
    fetchCategories();
  }, []);

const [newEmail, setEmail] = useState("");
const [newPassword, setNewPassword] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");


const handleUpdateEmail = async () => {
  if (!newEmail || !password) {
    alert("Veuillez entrer un email et votre mot de passe !");
    return;
  }
  setLoadingEmail(true);
  try {
    const response = await axios.post("http://localhost:5000/change-email", 
      { newEmail, password }, 
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    alert(response.data.message);
    setEmail("");
    setPassword("");
  } catch (error) {
    console.error("Erreur lors du changement d'email :", error);
    alert(error.response?.data?.message || "Erreur !");
  }
  setLoadingEmail(false);
};



const handleUpdatePassword = async () => {
  if (!newPassword || !confirmPassword) {
    alert("Veuillez entrer et confirmer votre nouveau mot de passe !");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("Les mots de passe ne correspondent pas !");
    return;
  }

  setLoadingPassword(true);
  try {
    const response = await axios.post("http://localhost:5000/change-password", 
      { newPassword }, 
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    alert(response.data.message);
    setNewPassword("");
    setConfirmPassword("");
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe :", error);
    alert(error.response?.data?.message || "Erreur !");
  }
  setLoadingPassword(false);
};



  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${apiUrl}/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
      setErrorMessage("Erreur lors de la récupération des catégories");
    }
  };

  // Charger les fichiers de la catégorie sélectionnée
  const fetchFiles = async (category) => {
    try {
      setSelectedCategory(category);
      const res = await axios.get(`${apiUrl}/files/${category}`);
      setFiles(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des fichiers:", error);
      setErrorMessage("Erreur lors de la récupération des fichiers");
    }
  };

  // Soumission du formulaire pour ajouter une catégorie
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await axios.post(`${apiUrl}/categories`, { name: newCategory });
      setNewCategory("");
      fetchCategories();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie:", error);
      setErrorMessage("Erreur lors de l'ajout de la catégorie");
    }
  };


   // Suppression d'une catégorie (et de ses fichiers associés)
   const deleteCategory = async (categoryName) => {
    if (
      window.confirm(
        `Voulez-vous vraiment supprimer la catégorie "${categoryName}" ? Tous les fichiers associés seront également supprimés.`
      )
    ) {
      try {
        await axios.delete(`${apiUrl}/categories/${categoryName}`);
        fetchCategories();
        if (selectedCategory === categoryName) {
          setSelectedCategory("");
          setFiles([]);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la catégorie:", error);
        setErrorMessage("Erreur lors de la suppression de la catégorie");
      }
    }
  };
  // Gestion de la sélection de fichier et création d'une prévisualisation
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFileInput(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  // Upload du fichier vers le backend
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !fileInput) {
      alert("Veuillez sélectionner une catégorie et un fichier.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const formData = new FormData();
      formData.append("file", fileInput);
      formData.append("category", selectedCategory);
      await axios.post(`${apiUrl}/upload`, formData);
      setFileInput(null);
      setFilePreview(null);
      fetchFiles(selectedCategory);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      setErrorMessage("Erreur lors de l'upload du fichier");
    } finally {
      setLoading(false);
    }
  };

  // Bascule du statut "published" d'un fichier
  const togglePublish = async (filename) => {
    try {
      await axios.put(`${apiUrl}/files/publish/${filename}`);
      fetchFiles(selectedCategory);
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      setErrorMessage("Erreur lors de la publication du fichier");
    }
  };

  // Suppression d'un fichier
  const deleteFile = async (filename) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce fichier ?")) {
      try {
        await axios.delete(`${apiUrl}/files/${filename}`);
        fetchFiles(selectedCategory);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        setErrorMessage("Erreur lors de la suppression du fichier");
      }
    }
  };
  

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };


  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-3/4 p-6 space-y-6">
      {/* Entête et Déconnexion */}
      <div className="flex justify-between items-center">
        <Typography variant="h3" className="font-bold">Admin Panel</Typography>
        
      </div>
                                                                                                      
      {errorMessage && (
        <Typography variant="small" color="red" className="text-center">
          {errorMessage}
        </Typography>
      )}
  
      {/* Ajout de catégorie */}
      <Card className="p-6 shadow-lg bg-white rounded-lg">
        <form onSubmit={handleCategorySubmit} className="flex flex-col md:flex-row gap-3">
          <Input label="Nouvelle catégorie" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} required className="w-full md:w-auto" />
          <Button type="submit" color="blue" className="py-2 px-4 font-semibold">Ajouter Catégorie</Button>
        </form>
      </Card>
  
      {/* Liste des catégories */}
      <Card className="p-6 shadow-lg bg-white rounded-lg">
        <Typography variant="h5" className="font-semibold text-gray-700">Catégories</Typography>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center gap-2">
              <Button color={selectedCategory === cat.name ? "blue" : "gray"} onClick={() => fetchFiles(cat.name)}>
                {cat.name}
              </Button>
              <Button color="red" size="sm" onClick={() => deleteCategory(cat.name)}>x</Button>
            </div>
          ))}
        </div>
      </Card>
  
      {/* Upload fichier */}
      {selectedCategory && (
        <Card className="p-6 shadow-lg bg-white rounded-lg">
          <Typography variant="h5" className="font-semibold text-gray-700">
            Uploader un fichier dans la catégorie {selectedCategory}
          </Typography>
          <form onSubmit={handleFileUpload} className="flex flex-col space-y-3">
            <input type="file" onChange={handleFileChange} className="border p-2 rounded" />
            {filePreview && (
              <img src={filePreview} alt="Prévisualisation" className="w-40 h-40 object-cover rounded mt-2" />
            )}
            <Button type="submit" color="green" disabled={loading} className="w-full py-2 font-semibold">
              {loading ? "Uploading..." : "Uploader"}
            </Button>
          </form>
        </Card>
      )}
  
      {/* Affichage des fichiers */}
      {selectedCategory && (
        <Card className="p-6 shadow-lg bg-white rounded-lg">
          <Typography variant="h5" className="font-semibold text-gray-700">
            Fichiers de la catégorie {selectedCategory}
          </Typography>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {files.map((file) => (
              <div key={file.filename} className="border p-3 rounded-lg shadow-md bg-gray-50">
                <img src={`http://localhost:5000/uploads/${file.filename}`} alt={file.filename} className="w-full h-40 object-cover rounded mb-2" />
                <Typography variant="small" className="mb-2">{file.filename}</Typography>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button color="blue" onClick={() => togglePublish(file.filename)}>
                    {file.published ? "Dépublier" : "Publier"}
                  </Button>
                  <Button color="red" onClick={() => deleteFile(file.filename)}>Supprimer</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
    {/* Sidebar */}
    <div className="w-full md:w-1/4 bg-gray-100 p-6 shadow-lg flex flex-col">
      <Button color="red" className="mb-4" onClick={handleLogout}>Déconnexion</Button>
      <Button color="blue" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Masquer" : "Changer vos informations"}
      </Button>

      {showForm && (
  <div className="mt-6 space-y-6">
    {/* Formulaire de changement d'email */}
    <Card className="p-4 shadow-md bg-white max-w-sm md:max-w-md overflow-hidden">
      <Typography variant="h5">Modifier l'email</Typography>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdateEmail();
        }}
        className="space-y-3 flex flex-col"
      >
        <Input
          label="Nouvel email"
          value={newEmail}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
        <div className="relative w-full">
            <Input type={showPassword ? "text" : "password"} label="Mot de passe" value={password} 
            onChange={(e) => setPassword(e.target.value)} required className="w-full pr-10" />
             <button  type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        <Button
          type="submit"
          color="blue"
          disabled={loadingEmail}
          className="w-full py-2 font-semibold"
        >
          {loadingEmail ? "Mise à jour..." : "Changer l'email"}
        </Button>
      </form>
    </Card>

    {/* Formulaire de changement de mot de passe */}
    <Card className="p-4 shadow-md bg-white max-w-sm md:max-w-md overflow-hidden">
      <Typography variant="h5">Modifier le mot de passe</Typography>
      <form className="flex flex-col space-y-3 mt-2" onSubmit={handleUpdatePassword}>
          <div className="relative w-full">
          <Input
          type={showPasword ? "text" : "password"}
          label="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required className="w-full pr-10" />
             <button  type="button" onClick={() => setShowPasword(!showPasword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" >
            {showPasword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        <Input
          type="password"
          label="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full"
        />
        <Button type="submit" color="blue" className="w-full">
          Changer le mot de passe
        </Button>
      </form>
    </Card>
  </div>
)}

    </div>
    </div>
  );
  
};

export default Admin;
