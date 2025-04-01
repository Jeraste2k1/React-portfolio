import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Card, Input, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";
const Admin = ({ setToken }) => {
  const [categories, setCategories] = useState([]);
  const [filePreview, setFilePreview] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [files, setFiles] = useState([]);
  const [fileInput, setFileInput] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);

  const navigate = useNavigate();
  const apiUrl = "http://localhost:5000";



  // Charger les catégories au démarrage
  useEffect(() => {
    fetchCategories();
  }, []);
  useEffect(() => {
    console.log("🔄 Mise à jour de l'interface, fichiers :", files);
}, [files]);
useEffect(() => {
  const checkTokenExpiration = () => {
    const token =  sessionStorage.getItem("token");
;
    const expiration = localStorage.getItem("token_expiration");

    if (token && expiration) {
      const now = Date.now();
      if (now >= expiration) {
        toast.warn("⚠️ Session expirée, veuillez vous reconnecter.");
        localStorage.removeItem("token");
        localStorage.removeItem("token_expiration");
        navigate("/login"); // Redirige vers la page de connexion
      }
    }
  };

  // Vérifie toutes les 30 secondes si le token a expiré
  const interval = setInterval(checkTokenExpiration, 30000);

  return () => clearInterval(interval); // Nettoyage à la suppression du composant
}, []);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Mise à jour de l'email (envoi uniquement de newEmail)
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    
    if (!newEmail.trim() || !newEmail.includes("@")) {
      toast.error("❌ Veuillez entrer un email valide.");
      return;
    }
  
    setLoadingEmail(true);
    
    try {
      const response = await axios.post(
        `${apiUrl}/change-email`,
        { newEmail },
        { headers: { Authorization: `Bearer ${ sessionStorage.getItem("token")
}` } }
      );
  
      toast.success(" Email mis à jour !");
      setNewEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "❌ Erreur lors de la mise à jour de l'email.");
    }
  
    setLoadingEmail(false);
  };
  

  // Mise à jour du mot de passe
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
  
    if (!newPassword || newPassword.length < 8) {
      toast.error(" Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error(" Les mots de passe ne correspondent pas.");
      return;
    }
  
    setLoadingPassword(true);
    
    try {
      const response = await axios.post(
        `${apiUrl}/change-password`,
        { newPassword, confirmPassword },
        { headers: { Authorization: `Bearer ${ sessionStorage.getItem("token")
}` } }
      );
  
      toast.success("Mot de passe mis à jour !");
      setNewPassword("");
      setConfirmPassword("");
  
      // ✅ Déconnexion automatique après changement de mot de passe
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      toast.error(" Erreur lors de la mise à jour du mot de passe.");
    }
  
    setLoadingPassword(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${apiUrl}/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error.response?.data || error);
      toast.error("❌ Impossible de charger les catégories.");
    }
  };
  
  

  // Charger les fichiers de la catégorie sélectionnée
  const fetchFiles = async (category) => {
    console.log("Catégorie sélectionnée :", category); // 🔍 Vérification
    try {
      const res = await axios.get(`${apiUrl}/files`, { 
        params: { category } // Envoi en tant que query param
      });
      console.log("Fichiers récupérés :", res.data); // 🔍 Vérification
      setFiles(res.data);
      setSelectedCategory(category); // ✅ Met à jour l'état
    } catch (error) {
      toast.error(" Erreur lors de la récupération des fichiers");
      setErrorMessage("Erreur lors de la récupération des fichiers");
    }
};


//Suppression de fichier prévisaliser
const removeFile = (index) => {
  setFileInput((prevFiles) => prevFiles.filter((_, i) => i !== index)); // ✅ Supprime du tableau des fichiers
  setFilePreview(selectedFiles.map(file => URL.createObjectURL(file)));
 // ✅ Supprime de la prévisualisation
};



  // Soumission du formulaire pour ajouter une catégorie
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      toast.warn(" Le nom de la catégorie ne peut pas être vide !");
      return;
    }
    
    try {
      
      await axios.post(
        `${apiUrl}/categories`,
        { name: newCategory },
        {
          headers: {
            "Authorization": `Bearer ${ sessionStorage.getItem("token")
}`,
            "Content-Type": "application/json"
          }
        }
      ).catch(error => {
        console.error("Erreur Axios:", error.response?.data);
      });
      toast.success("✅ Catégorie ajoutée avec succès !");
      setNewCategory("");
      fetchCategories();
    } catch (error) {
      toast.error( "Erreur lors de l'ajout de la catégorie");
    }
  };
  
  
  
  

  // Suppression d'une catégorie (et de ses fichiers associés)
  const deleteCategory = async (categoryName) => {
    const confirmDelete = window.confirm(
      `Voulez-vous vraiment supprimer la catégorie "${categoryName}" ? Tous les fichiers associés seront également supprimés.`
    );
  
    if (!confirmDelete) {
      console.log("🚫 Suppression annulée.");
      return;
    }
  
    try {
      console.log("🗑️ Suppression de la catégorie :", categoryName);
      
      await axios.delete(`${apiUrl}/categories/${categoryName}`, {
        headers: {
          "Authorization": `Bearer ${ sessionStorage.getItem("token")
}`,
          "Content-Type": "application/json"
        }
      });
  
      toast.success("Catégorie supprimée avec succès !");
      fetchCategories(); // ✅ Rafraîchir la liste des catégories
  
      // Réinitialiser la sélection si la catégorie supprimée était sélectionnée
      if (selectedCategory === categoryName) {
        setSelectedCategory("");
        setFiles([]);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de la catégorie:", error);
      setErrorMessage("Erreur lors de la suppression de la catégorie.");
    }
  };
  

  // Gestion de la sélection de fichier et création d'une prévisualisation
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
  
    if (oversizedFiles.length > 0) {
      toast.error(`❌ Certains fichiers dépassent la taille autorisée de 5 Mo :\n- ${oversizedFiles.map(f => f.name).join("\n- ")}`);
      return; // ✅ Empêche l'utilisateur de poursuivre avec des fichiers trop lourds
    }
  
    setFileInput(selectedFiles);
    setFilePreview(prevPreviews => [
      ...prevPreviews, 
      ...selectedFiles.map(file => URL.createObjectURL(file))
    ]); // ✅ Ajoute plusieurs prévisualisations;
  };
  
  // Upload du fichier vers le backend
  const handleFileUpload = async (e) => {
    e.preventDefault();
  
    if (!selectedCategory || !fileInput.length) {
      toast.warn("Veuillez sélectionner une catégorie et des fichiers.");
      return;
    }
  
    setLoading(true);
    try {
      const formData = new FormData();
      fileInput.forEach(file => {
        formData.append("files", file); // ✅ Ajoute plusieurs fichiers
      });
      formData.append("category", selectedCategory);
  
      await axios.post(`${apiUrl}/upload`, formData, {
        headers: {
          "Authorization": `Bearer ${ sessionStorage.getItem("token")
}`
        }
      });
  
      toast.success(" Fichiers téléchargés avec succès !");
      e.target.reset(); // Réinitialise le formulaire
      setFileInput([]); // Réinitialise les fichiers sélectionnés
      setFilePreview([]); // Réinitialise les aperçus
      fetchFiles(selectedCategory);
    } catch (error) {
      console.error("Erreur lors de l'upload :", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message); // ✅ Affiche le message du serveur
      } else {
        setErrorMessage("Erreur lors de l'upload des fichiers.");
      }
    }
  }
    
  

  // Bascule du statut "published" d'un fichier en utilisant son ID
  const togglePublish = async (fileId) => {  // fileId est censé être filename
    console.log("📤 Token envoyé dans le header :",  sessionStorage.getItem("token")
);
    console.log("🔑 Token stocké dans localStorage :",  sessionStorage.getItem("token")
);
  
    try {
      await axios.put(
        `${apiUrl}/files/publish/${fileId}`, // ✅ Utiliser fileId ici
        {},
        { 
          headers: { Authorization: `Bearer ${ sessionStorage.getItem("token")
}` },
          withCredentials: true,
          "Content-Type": "application/json"
        }
      );
      fetchFiles(selectedCategory);
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      setErrorMessage("Erreur lors de la publication du fichier");
    }
  };
  

  // Suppression d'un fichier en utilisant son ID
  const deleteFile = async (fileId) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?");
  
  if (!confirmDelete) {
    console.log("🚫 Suppression annulée.");
    return;
  }

    try {
      console.log("🗑️ Suppression du fichier avec l'ID :", fileId);
      
      await axios.delete(`${apiUrl}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${ sessionStorage.getItem("token")
}` },
      });
      toast.success(" Fichier supprimé avec succès !");
      fetchFiles(selectedCategory);
    } catch (error) {
      toast.error("Erreur lors de la suppression du fichier");
    }
  };
  
  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  console.log("📂 Fichiers stockés dans files :", files);
console.log("📢 Catégorie sélectionnée pour affichage :", selectedCategory);


  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-3/4 p-6 space-y-6">
        {/* Entête et Déconnexion */}
        <div className="flex justify-between items-center">
          <Typography variant="h3" className="font-bold">Admin Panel</Typography>
        </div>

        {errorMessage && <div className="error-message red">{errorMessage}</div>}


        {/* Ajout de catégorie */}
        <Card className="p-6 shadow-lg bg-white rounded-lg">
          <form onSubmit={handleCategorySubmit} className="flex flex-col md:flex-row gap-3">
            <Input
              label="Nouvelle catégorie"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              required
              className="w-full md:w-auto"
            />
            <Button type="submit" color="blue" className="py-2 px-4 font-semibold">
              Ajouter Catégorie
            </Button>
          </form>
        </Card>

        {/* Liste des catégories */}
        <Card className="p-6 shadow-lg bg-white rounded-lg">
          <Typography variant="h5" className="font-semibold text-gray-700">
            Catégories
          </Typography>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {categories.map((cat) => (
              <div key={cat.name} className="relative w-full">
              <Button
                color={selectedCategory === cat.name ? "blue" : "gray"}
                onClick={() => fetchFiles(cat.name)}
                className="relative w-full flex justify-center items-center"
              >
                {cat.name}
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-whit hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ Empêche le clic sur la croix de déclencher `fetchFiles`
                    deleteCategory(cat.name);
                  }}
                >
                  ✕
                </button>
              </Button>
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
              <input type="file" multiple onChange={handleFileChange} className="border p-2 rounded" />
              {fileInput.length > 0 && (
    <p className="text-gray-700 font-semibold">
      Fichiers sélectionnés : {fileInput.length}
    </p>
  )}
              {filePreview.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-2">
    {filePreview.map((preview, index) => (
        
        <div key={index} className="relative group">
        <img
        src={preview}
        alt={`Prévisualisation ${index + 1}`}
        className="w-40 h-40 object-cover rounded"
      />
      <button
      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
      onClick={() => removeFile(index)}
    >
      ✕
    </button>
    </div>

    ))}
  </div>
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
                <div key={file.id} className="border p-3 rounded-lg shadow-md bg-gray-50">
                 <img
  src={`${apiUrl}/uploads/${file.filename}`}
  alt={file.filename}
  className="w-full h-40 object-cover rounded mb-2"
/>

                  <Typography variant="small" className="mb-2">
                    {file.filename}
                  </Typography>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                  <Button color="blue" onClick={() => togglePublish(file.filename)}>  
                      {file.published ? "Dépublier" : "Publier"}
                  </Button>

                    <Button color="red" onClick={() => deleteFile(file.id)}>
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
      {/* Sidebar */}
      <div className="w-full md:w-1/4 bg-gray-100 p-6 shadow-lg flex flex-col">
        <Button color="red" className="mb-4" onClick={handleLogout}>
          Déconnexion
        </Button>
        <Button color="blue" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Masquer" : "Changer vos informations"}
        </Button>

        {showForm && (
          <div className="mt-6 space-y-6">
            {/* Formulaire de changement d'email */}
            <Card className="p-4 shadow-md bg-white max-w-sm md:max-w-md overflow-hidden">
  <Typography variant="h5">Modifier l'email</Typography>
  <form onSubmit={handleUpdateEmail} className="space-y-3 flex flex-col">
    <Input
      label="Nouvel email"
      value={newEmail}
      onChange={(e) => setNewEmail(e.target.value)}
      required
      className="w-full"
    />
    <Button type="submit" color="blue" disabled={loadingEmail} className="w-full">
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
      type={showPasswordUpdate ? "text" : "password"}
      label="Nouveau mot de passe"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      required
      className="w-full"
    />
    <button
                    type="button"
                    onClick={() => setShowPasswordUpdate(!showPasswordUpdate)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPasswordUpdate ? <EyeOff size={20} /> : <Eye size={20} />}
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
    
    <Button type="submit" color="blue" disabled={loadingPassword} className="w-full">
      {loadingPassword ? "Mise à jour..." : "Changer le mot de passe"}
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



