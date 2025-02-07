import React from "react";

function Contact() {
  // Remplace "1234567890" par ton numéro de téléphone international sans espaces ni zéros initiaux
  const whatsappNumber = "59257219";
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <section className="container mx-auto p-8 flex flex-col items-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md mt-10">
        <h2 className="text-3xl font-bold mb-4 text-center">Contactez-moi</h2>
        <p className="text-gray-600 mb-6 text-center">
          Pour toute demande ou information, n'hésitez pas à me contacter via WhatsApp.
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-full block text-center font-semibold transition duration-200"
        >
          Envoyer un message sur WhatsApp
        </a>
      </div>
    </section>
  );
}

export default Contact;
