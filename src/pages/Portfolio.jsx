import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios"; // Pour appeler l'API backend

function Portfolio() {
  const [categories, setCategories] = useState([]); // Liste des catégories avec images
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  // Charger les catégories et les images publiées depuis le backend
  useEffect(() => {
    axios.get("http://localhost:5000/categories")
      .then(res => {
        const categoriesData = res.data;
  
        axios.get("http://localhost:5000/files") // Récupérer tous les fichiers
          .then(filesRes => {
            const files = filesRes.data;
  
            // Associer les fichiers aux catégories
            const categoriesWithFiles = categoriesData.map(category => ({
              ...category, 
              images: files.filter(file => file.category === category.name && file.published) // Filtrer les fichiers publiés
            }));
  
            setCategories(categoriesWithFiles);
            console.log("Données chargées :", categoriesWithFiles); // Debug
          })
          .catch(err => console.error("Erreur lors de la récupération des fichiers :", err));
      })
      .catch(err => console.error("Erreur lors de la récupération des catégories :", err));
  }, []);
  

  const displayedImages = selectedCategory
    ? categories.find((cat) => cat.name === selectedCategory)?.images || []
    : categories.flatMap((cat) => cat.images);

  return (
    <section className="container mx-auto p-8 pt-20">
      <motion.div
        className="text-start"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-4xl font-bold relative inline-block">
          Portfolio
          <span className="absolute left-0 bottom-[-5px] w-2/3 h-1 bg-black"></span>
        </h1>
      </motion.div>

      <div className="flex flex-col md:flex-row mt-10 gap-8">
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-2xl font-semibold">Explorez nos catégories</h2>
          <p className="text-gray-600">
            Découvrez une collection soigneusement organisée de photographies dans différentes catégories telles que Portraits, Événements, Nature et plus encore.
          </p>
        </div>
        <div className="md:w-1/2 grid gap-4">
          <div className="mt-10 md:mt-0">
            <div className="justify-end mb-4">
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white"
                >
                  Voir les catégories
                </button>
              )}
            </div>

            {!selectedCategory && (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4">
    {categories.map((category) => (
      <div
        key={category.name}
        className="relative cursor-pointer group"
        onClick={() => setSelectedCategory(category.name)}
      >
        <img
          src={`http://localhost:5000/uploads/${category.images[0]?.filename}`}
          alt={category.name}
          className="w-full h-40 object-cover"  // Hauteur fixée à 10rem (h-40)
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <span className="text-white font-bold text-xl">{category.name}</span>
        </div>
      </div>
    ))}
  </div>
)}

{selectedCategory && (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
    {displayedImages.map((image, index) => (
     <div
     key={index}
     className="flex items-center justify-center overflow-hidden rounded-lg cursor-pointer"
     onClick={() => setZoomedImage(image.filename)}
   >
     <img
       src={`http://localhost:5000/uploads/${image.filename}`}
       alt={image.filename}
       className="w-full h-auto object-contain"
       loading="lazy"
     />
   </div>
    ))}
  </div>
)}

          </div>

          {zoomedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="relative">
                <img
                  src={`http://localhost:5000/uploads/${zoomedImage}`}
                  alt={zoomedImage}
                  className="max-w-full max-h-screen"
                />
                <button
                  onClick={() => setZoomedImage(null)}
                  className="absolute top-4 right-4 text-blue-100 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Portfolio;
