import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const API_BASE_URL = "https://react-portfolio-bqbn.onrender.com";

function Portfolio() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    const fetchCategoriesAndFiles = async () => {
      try {
        const { data: categoriesData } = await axios.get(`${API_BASE_URL}/categories`);
        
        const categoriesWithFiles = await Promise.all(
          categoriesData.map(async (category) => {
            try {
              const { data: files } = await axios.get(`${API_BASE_URL}/files`, {
                params: { category: category.name }
              });

              console.log(`📂 Fichiers pour ${category.name}:`, files);

              return { ...category, images: files.filter((file) => file.published) };

            } catch (error) {
              console.error("Erreur lors de la récupération des fichiers :", error);
              return { ...category, images: [] };
            }
          })
        );

        setCategories(categoriesWithFiles);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
      }
    };

    fetchCategoriesAndFiles();
  }, []);

  // Trouver la catégorie sélectionnée
  const categoryObj = categories.find((cat) => cat.name === selectedCategory);
  const displayedImages = categoryObj ? categoryObj.images : categories.flatMap((cat) => cat.images);

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
            Découvrez une collection soigneusement organisée de photographies dans différentes catégories telles que
            Portraits, Événements, Nature et plus encore.
          </p>
        </div>
        <div className="md:w-1/2 grid gap-4">
          <div className="mt-10 md:mt-0">
            <div className="justify-end mb-4">
              {selectedCategory && (
                <button onClick={() => setSelectedCategory(null)} className="px-4 py-2 rounded-lg bg-blue-500 text-white">
                  Voir toutes les catégories
                </button>
              )}
            </div>

            {/* Affichage des catégories */}
            {!selectedCategory && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.name}
                    className="relative cursor-pointer group"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.images.length > 0 ? (
                      <img
                        src={`${API_BASE_URL}/uploads/${category.images[0].filename}`}
                        alt={category.name}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Pas d'image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <span className="text-white font-bold text-xl">{category.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Affichage des images d'une catégorie sélectionnée */}
            {selectedCategory && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {displayedImages.map((image, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center overflow-hidden rounded-lg cursor-pointer"
                    onClick={() => setZoomedImage(image.filename)}
                  >
                    <img
                      src={`${API_BASE_URL}/uploads/${image.filename}`}
                      alt={image.filename}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Affichage en grand des images (zoom) */}
          {zoomedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="relative">
                <img src={`${API_BASE_URL}/uploads/${zoomedImage}`} alt={zoomedImage} className="max-w-full max-h-screen" />
                <button
                  onClick={() => setZoomedImage(null)}
                  className="absolute top-4 right-4 text-white text-2xl font-bold"
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
