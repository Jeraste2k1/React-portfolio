import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";


function Home() {
  return (
//    <div
//   id="billboard"
//   className="bg-gray-50 h-screen flex items-center relative"
// >
//   <div className="container mx-auto px-4 lg:px-20">
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center h-full">
//       {/* Colonne de gauche (Texte) */}
//       <div className="relative flex justify-center md:justify-start items-center md:items-start h-full top-40 bottom-36 lg:top-0 lg:bottom-0">
//         <motion.div
//           className="flex flex-col justify-center items-start text-black z-10 p-4 md:p-8"
//           initial={{ opacity: 0, x: -50 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 1 }}
//         >
//           <h1 className="text-4xl md:text-6xl font-bold">
//             Photographer & Film Maker
//           </h1>
//           <h4 className="py-3 text-xl">Los Angeles, USA</h4>
//           <a
//             href="#"
//             className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
//           >
//             Hire me
//           </a>
//         </motion.div>
//       </div>

//       {/* Colonne de droite (Image) */}
//       <div className="relative flex justify-center items-center h-full top-20 md:top-0">
//         <motion.img
//           src="src/assets/img/voiture.jpg"
//           alt="Photographer"
//           className="w-full h-auto object-cover rounded-lg"
//           initial={{ opacity: 0, x: 50 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 1 }}
//         />
//       </div>
//     </div>
//   </div>
// </div>

<section className="container mx-auto px-4 md:px-24">
<div className="row grid grid-cols-1 md:grid-cols-2 gap-10">
<div className="col-md-6 flex justify-center items-center"> 
    <div 
        className="text-content justify-center  my-5 md:-mt-32 " 
        data-aos="fade-in"
      >
        <h1 className="display-1 text-4xl md:text-6xl font-bold">Photographer & Film Maker</h1>
        <h4 className="py-3 text-lg md:text-xl">Cotonou, Bénin</h4>
        <Link to="/portfolio" className="btn bg-black text-white px-5 py-3 rounded hover:bg-gray-800"> Portfolio</Link>
      </div></div>
  <div className="col-md-6 relative">
    <figure className="bannerimg relative">
     
      <img 
        src="img/women_standing_wall.jpg" 
        className="img-fluid w-full h-auto object-cover rounded-lg" 
        alt="photographer"
      />
    </figure>
  </div>
</div>
</section>

  );
}

export default Home;
