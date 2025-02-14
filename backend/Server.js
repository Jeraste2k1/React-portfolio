const express = require("express");
const multer = require("multer");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json()); // Parser le JSON

const DATA_FILE = "data.json";
const SECRET_KEY = "Mon-secret-key"; // 🔒 À garder confidentiel
const ADMIN_FILE = "admin.json"; 

// 📌 Vérifier si l'admin existe, sinon en créer un
if (!fs.existsSync(ADMIN_FILE)) {
  const hashedPassword = bcrypt.hashSync("admin@gmail", 10); // Mot de passe par défaut (à changer après)
  fs.writeFileSync(ADMIN_FILE, JSON.stringify({ email: "admin@gmail.com", password: hashedPassword }));
}

// 📌 Charger l'admin
const loadAdmin = () => JSON.parse(fs.readFileSync(ADMIN_FILE, "utf-8"));

// 📌 Route de connexion (Login)
app.post("/login", async (req, res) => {
  console.log("Requête reçue pour /login");
  console.log("Méthode :", req.method); // Affiche la méthode HTTP (doit être POST)
  
  const { email, password } = req.body;
  
  // Vérification de la présence des données
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe sont requis" });
  }

  console.log("Email:", email);
  console.log("Mot de passe:", password);

  const admin = loadAdmin();

  if (email !== admin.email || !await bcrypt.compare(password, admin.password)) {
    return res.status(401).json({ message: "Email ou mot de passe incorrect" });
  }
  
  const token = jwt.sign({ email: admin.email }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token }); // Vérifie que le token est bien dans la réponse
});


// 📌 Middleware pour protéger les routes
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "Accès refusé" });

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Token invalide ou expiré" });
    req.user = decoded;
    next();
  });
};

// 📌 Route protégée : accès à l'admin uniquement si connecté
app.get("/admin", verifyToken, (req, res) => {
  res.json({ message: "Bienvenue dans l'admin !" });
});

 // 📌 Route pour changer le mot de passe
app.post("/change-password", verifyToken, async (req, res) => {
  const { newPassword } = req.body;
  const admin = loadAdmin();

  // Vérifier que le nouveau mot de passe est valide
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
  }

  // Mettre à jour le mot de passe
  admin.password = await bcrypt.hash(newPassword, 10);
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin));
  res.json({ message: "Mot de passe mis à jour avec succès" });
});


// 📌 Route pour changer l'email de l'admin
app.post("/change-email", verifyToken, async (req, res) => {
  const { newEmail, password } = req.body;
  const admin = loadAdmin();

  // Vérifier si le mot de passe est correct
  if (!await bcrypt.compare(password, admin.password)) {
    return res.status(400).json({ message: "Mot de passe incorrect" });
  }

  // Mettre à jour l'email
  admin.email = newEmail;
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin));
  res.json({ message: "Email mis à jour avec succès" });
});


// 📌 Charger les données depuis le fichier JSON
const loadData = () => {
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ categories: [], files: [] }));
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
};

// 📌 Sauvegarder les données dans le fichier JSON
const saveData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// 📌 Multer - Stockage des fichiers uploadés
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Renommer avec timestamp
  },
});
const upload = multer({ storage });

// 📌 Route pour créer une catégorie
app.post("/categories", (req, res) => {
  const data = loadData();
  const newCategory = { name: req.body.name };
  data.categories.push(newCategory);
  saveData(data);
  res.status(201).json(newCategory);
});

// 📌 Route pour récupérer toutes les catégories
app.get("/categories", (req, res) => {
  const data = loadData();
  res.json(data.categories);
});


// 📌 Route pour uploader un fichier dans une catégorie
app.post("/upload", upload.single("file"), (req, res) => {
  const data = loadData();
  const newFile = { filename: req.file.filename, category: req.body.category, published: false };
  data.files.push(newFile);
  saveData(data);
  res.status(201).json(newFile);
});

// 📌 Route pour récupérer les fichiers par catégorie
app.get("/files/:category", (req, res) => {
  const data = loadData();
  const files = data.files.filter(file => file.category === req.params.category);
  res.json(files);
});
// 📌 Route pour récupérer tous les fichiers
app.get("/files", (req, res) => {
  const data = loadData();
  res.json(data.files); // Retourne tous les fichiers enregistrés
});


// 📌 Route pour publier/dépublier un fichier
app.put("/files/publish/:filename", (req, res) => {
  const data = loadData();
  const file = data.files.find(file => file.filename === req.params.filename);
  if (file) {
    file.published = !file.published; // Bascule l'état de publication
    saveData(data);
    res.json({ message: "Statut mis à jour", file });
  } else {
    res.status(404).json({ error: "Fichier non trouvé" });
  }
});

// 📌 Route pour supprimer un fichier
app.delete("/files/:filename", (req, res) => {
  const data = loadData();
  const fileIndex = data.files.findIndex(file => file.filename === req.params.filename);
  if (fileIndex !== -1) {
    const filePath = path.join("uploads", data.files[fileIndex].filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Supprime le fichier physique
    data.files.splice(fileIndex, 1);
    saveData(data);
    res.json({ message: "Fichier supprimé" });
  } else {
    res.status(404).json({ error: "Fichier non trouvé" });
  }
});

// 📌 Route pour supprimer une catégorie
app.delete("/categories/:name", (req, res) => {
  const data = loadData();
  const categoryName = req.params.name;
  // Chercher la catégorie à supprimer
  const categoryIndex = data.categories.findIndex(cat => cat.name === categoryName);
  if (categoryIndex === -1) {
    return res.status(404).json({ error: "Catégorie non trouvée" });
  }
  // Supprimer la catégorie
  data.categories.splice(categoryIndex, 1);
  // Supprimer également tous les fichiers associés à cette catégorie
  data.files = data.files.filter(file => file.category !== categoryName);
  saveData(data);
  res.json({ message: "Catégorie supprimée avec succès" });
});

// 📌 Servir les fichiers statiques
app.use("/uploads", express.static("uploads"));

// 📌 Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});