import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';
import { body, validationResult } from 'express-validator';
import sanitize from 'sanitize-filename';
import  prisma from './db.js';
import winston from 'winston';

// Configuration des logs
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// ✅ Définit __dirname pour les ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vérification des variables d'environnement
if (!process.env.SECRET_KEY) throw new Error('SECRET_KEY manquant dans .env');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL manquant dans .env');

// Configuration Express
const app = express();
const SECRET_KEY = process.env.SECRET_KEY;
const uploadDir = "uploads";

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // ✅ Autorise uniquement ton frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true // ✅ Permet d'envoyer les cookies et tokens
}));


app.use(express.json());
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});
// ✅ Autorise l'accès aux images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




// Vérification du dossier uploads
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Vérification de la connexion à la base de données
async function checkDbConnection() {
  try {
    await prisma.$connect();
    console.log("Connexion à la base de données réussie !");
  } catch (error) {
    console.error("Erreur de connexion à la base de données :", error);
    process.exit(1);
  }
}
checkDbConnection();

// Vérification et création de l'admin au démarrage
async function initAdmin() {
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash("admin@gmail", 10);
      await prisma.user.create({
        data: {
          email: "admin@gmail.com",
          password: hashedPassword,
          role:"ADMIN"
        }
      });
      console.log(' Admin créer avec succès.');
  }  else {
    console.log('ℹ️ Admin déjà existant.');
  }
}catch (error) {
  console.error('Erreur lors de l\'initialisation de l\'admin:', error);
}
}
initAdmin()

// Middleware d'authentification
function authenticateToken(req, res, next) {
  const authHeader = req.header('Authorization');
  console.log("Authorization header reçu :", authHeader);

  if (!authHeader) return res.status(401).json({ message: 'Accès refusé' });

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log("Erreur de vérification du token :", err.message);
      return res.status(403).json({ message: 'Token invalide' });
    }
    console.log("Utilisateur authentifié :", user);
    req.user = user;
    next();
  });
}



function isAdmin(req, res, next) {
  console.log("Utilisateur authentifié :", req.user);
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Accès interdit' });
  }
  next();
}


// Routes d'authentification
app.post("/login", 
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "❌ Email ou mot de passe invalide." });
    }

    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: "❌ Cet email n'existe pas." });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "❌ Mot de passe incorrect." });
      }

      if (user.role !== "ADMIN") {
        return res.status(403).json({ error: "⛔ Accès refusé, vous n'êtes pas administrateur." });
      }

      const token = jwt.sign({ email: user.email, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
      res.json({ token });
    } catch (error) {
      console.error("❌ Erreur lors de la connexion :", error);
      res.status(500).json({ error: "Erreur serveur, veuillez réessayer plus tard." });
    }
  }
);


// Routes administratives
app.post("/change-password", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    // ✅ Vérification des entrées
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "❌ Le mot de passe doit contenir au moins 8 caractères." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "❌ Les mots de passe ne correspondent pas." });
    }

    // ✅ Vérifier si req.user contient bien un ID
    console.log("Utilisateur authentifié :", req.user);
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "❌ Utilisateur non authentifié." });
    }

    // ✅ Hash du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Mise à jour du mot de passe via l'email (car l'ID est manquant)
    await prisma.user.update({
      where: { email: req.user.email },
      data: { password: hashedPassword }
    });

    res.json({ message: "✅ Mot de passe mis à jour avec succès. Déconnexion en cours..." });
  } catch (error) {
    console.error("❌ Erreur changement mot de passe :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});



app.post("/change-email", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail || !newEmail.includes("@")) {
      return res.status(400).json({ message: "❌ L'email est invalide." });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existingUser) {
      return res.status(400).json({ message: "❌ Cet email est déjà utilisé." });
    }

    // Mettre à jour l'email
    await prisma.user.update({
      where: { id: req.user.id },
      data: { email: newEmail }
    });

    res.json({ message: "✅ Email mis à jour avec succès." });
  } catch (error) {
    console.error("❌ Erreur changement email :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});


// Configuration Multer
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Type de fichier non autorisé'), false);
  }
  cb(null, true);
};

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
console.log("Multer configuré, stockage :", upload.storage);


// Gestion des fichiers
app.post("/upload", authenticateToken, isAdmin, (req, res, next) => {
  upload.array("files", 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "❌ Un ou plusieurs fichiers dépassent la taille limite de 5 Mo." });
      }
    } else if (err) {
      return res.status(500).json({ message: "Erreur serveur lors de l'upload." });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Aucun fichier reçu." });
    }

    const category = await prisma.category.findUnique({ where: { name: req.body.category } });
    if (!category) {
      return res.status(400).json({ message: "Catégorie invalide." });
    }

    const newFiles = await prisma.file.createMany({
      data: req.files.map(file => ({
        filename: file.filename,
        categoryId: category.id,
        published: false
      }))
    });

    res.status(201).json({ message: "Fichiers téléchargés avec succès", files: newFiles });
  } catch (error) {
    console.error("🔥 Erreur upload fichiers :", error);
    res.status(500).json({ message: "Échec de l'upload." });
  }
});








// Gestion des catégories
app.post("/categories", authenticateToken, isAdmin, async (req, res) => {

  console.log("Données reçues:", req.body); // 🔍 Vérifie les données envoyées

  try {
    const { name } = req.body;

    if (!name || name.length < 3) {
      return res.status(400).json({ message: "Le nom doit contenir au moins 3 caractères." });
    }

    const existingCategory = await prisma.category.findUnique({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ message: "Cette catégorie existe déjà" });
    }

    const newCategory = await prisma.category.create({
      data: { name }
    });

    console.log("Catégorie enregistrée :", newCategory); // 🔍 Vérifie si Prisma insère bien les données
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Erreur création catégorie:", error);
    res.status(500).json({ message: "Erreur lors de l'ajout de la catégorie" });
  }
});


// Routes publiques
app.get('/admin', async (req, res) => {
  try {
      const admin = await prisma.user.findFirst({
          where: { role: 'ADMIN' }, // Assure-toi que le champ 'role' existe
      });

      if (!admin) {
          return res.status(404).json({ error: "Admin not found" });
      }

      res.json(admin);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    logger.error('Erreur récupération catégories:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.get("/files", async (req, res) => {
  try {
    const { category } = req.query;

    // Vérifier si la catégorie existe
    const categoryRecord = await prisma.category.findUnique({
      where: { name: category },
      include: { files: true } // ✅ Charge aussi les fichiers associés
    });

    if (!categoryRecord) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    console.log("📂 Fichiers envoyés au frontend :", categoryRecord.files);
    res.json(categoryRecord.files); // ✅ Envoie les fichiers liés à la catégorie
  } catch (error) {
    console.error("❌ Erreur récupération fichiers :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});



// Gestion publication
app.put("/files/publish/:filename", authenticateToken, isAdmin, async (req, res) => {
  try {
    const filename = sanitize(req.params.filename);
    console.log("🔄 Demande de publication pour :", filename); 

    const file = await prisma.file.findUnique({ where: { filename } });

    if (!file) {
      console.log("❌ Fichier non trouvé :", filename);
      return res.status(404).json({ message: "Fichier non trouvé" });
    }

    console.log("✅ Fichier trouvé :", file);
    const updatedFile = await prisma.file.update({
      where: { filename },
      data: { published: !file.published }
    });

    console.log("✅ Fichier mis à jour :", updatedFile);
    res.json(updatedFile);
  } catch (error) {
    console.error("❌ Erreur changement statut fichier:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});



// Suppression fichier
app.delete("/files/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const fileId = parseInt(req.params.id, 10);
    
    if (isNaN(fileId)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const file = await prisma.file.findUnique({ where: { id: fileId } });

    if (!file) {
      return res.status(404).json({ message: "Fichier non trouvé" });
    }

    await prisma.file.delete({ where: { id: fileId } });

    const filePath = path.join(uploadDir, file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "Fichier supprimé" });
  } catch (error) {
    logger.error("Erreur suppression fichier:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// Suppression catégorie
app.delete("/categories/:name", authenticateToken, isAdmin, async (req, res) => {
  try {
    const categoryName = sanitize(req.params.name);
    
    // Vérifier si la catégorie existe
    const category = await prisma.category.findUnique({
      where: { name: categoryName }
    });

    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    // ✅ Supprimer les fichiers liés AVEC categoryId
    await prisma.file.deleteMany({ where: { categoryId: category.id } });

    // ✅ Supprimer la catégorie
    await prisma.category.delete({ where: { id: category.id } });

    res.json({ message: "Catégorie supprimée" });
  } catch (error) {
    console.error("🔥 Erreur suppression catégorie:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

// Démarrage serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
});