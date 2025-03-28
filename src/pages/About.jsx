import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import photo from "../assets/img/richly logo.jpg"

function About() {
  return (
    <section  className="container mx-auto px-5 my-2 py-2 pt-16 md:my-16 md:py-5">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Colonne gauche */}
      <div>
        <figure data-aos="zoom-in-left">
          <img
            src={photo}
            className="w-full h-auto md:w-2/3 md:h-[30rem] object-cover rounded-lg mx-auto"
            alt="photographer"
          />
        </figure>
      </div>

      {/* Colonne droite */}
      
      <div>
  <motion.div
    className="text-content m-2 p-2 md:m-5 md:p-5"
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 1 }}
  >
    {/* En-tête de section */}
    <div className="relative">
      <h2 className="section-title text-3xl font-bold">A Propos</h2>
      <span className="absolute left-0 bottom-[-5px] w-1/6 h-1 bg-black"></span>
    </div>

    {/* Description */}
    <div className="description mt-4 text-gray-700">
      <p className="mb-4">
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book.
      </p>
      <p>
        Nec eget condimentum etiam leo. Morbi at eget fusce feugiat volutpat et
        volutpat malesuada. Suspendisse nisi, quam neque in leo sollicitudin.
        Quam neque in leo consectetur.
      </p>
    </div>

    {/* Bouton */}
    <div className="btn-left mt-6">
      <Link to="/Portfolio"
        className="btn bg-black text-white px-5 py-3 rounded hover:bg-gray-800"
      >
        Voir mon portfolio
      </Link>
    </div>
  </motion.div>
</div>

    </div>
</section>

  
  );
}

export default About;
