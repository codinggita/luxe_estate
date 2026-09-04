import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations for various languages
const resources = {
  en: {
    translation: {
      "Shop Men": "Shop Men",
      "Shop Women": "Shop Women",
      "Contact Us": "Contact Us",
      "Luxury Starts and Ends With Us": "Luxury Starts and Ends With Us",
      "Shop Exclusive Products": "Shop Exclusive Products",
      "Curating the Luxe wardrobe...": "Curating the Luxe wardrobe...",
      "Show All": "Show All",
      "Men Collection": "Men Collection",
      "Women Collection": "Women Collection",
      "Tshirts Collection": "Tshirts Collection",
      "Trousers Collection": "Trousers Collection",
      "Shirts Collection": "Shirts Collection"
    }
  },
  hi: {
    translation: {
      "Shop Men": "पुरुषों के लिए खरीदें",
      "Shop Women": "महिलाओं के लिए खरीदें",
      "Contact Us": "संपर्क करें",
      "Luxury Starts and Ends With Us": "लक्ज़री हमसे शुरू होती है",
      "Shop Exclusive Products": "विशेष उत्पाद खरीदें",
      "Curating the Luxe wardrobe...": "अद्भुत वॉर्डरोब तैयार कर रहे हैं...",
      "Show All": "सभी दिखाएं",
      "Men Collection": "पुरुषों का कलेक्शन",
      "Women Collection": "महिलाओं का कलेक्शन",
      "Tshirts Collection": "टी-शर्ट्स कलेक्शन",
      "Trousers Collection": "ट्राउज़र्स कलेक्शन",
      "Shirts Collection": "शर्ट्स कलेक्शन"
    }
  },
  es: {
    translation: {
      "Shop Men": "Comprar Hombres",
      "Shop Women": "Comprar Mujeres",
      "Contact Us": "Contáctenos",
      "Luxury Starts and Ends With Us": "El Lujo Empieza y Termina Con Nosotros",
      "Shop Exclusive Products": "Comprar Productos Exclusivos",
      "Curating the Luxe wardrobe...": "Curando el guardarropa de lujo...",
      "Show All": "Mostrar Todo",
      "Men Collection": "Colección Hombres",
      "Women Collection": "Colección Mujeres",
      "Tshirts Collection": "Colección Camisetas",
      "Trousers Collection": "Colección Pantalones",
      "Shirts Collection": "Colección Camisas"
    }
  },
  fr: {
    translation: {
      "Shop Men": "Acheter Hommes",
      "Shop Women": "Acheter Femmes",
      "Contact Us": "Nous Contacter",
      "Luxury Starts and Ends With Us": "Le Luxe Commence et Finit Avec Nous",
      "Shop Exclusive Products": "Acheter Produits Exclusifs",
      "Curating the Luxe wardrobe...": "Préparation de la garde-robe de luxe...",
      "Show All": "Afficher Tout",
      "Men Collection": "Collection Hommes",
      "Women Collection": "Collection Femmes",
      "Tshirts Collection": "Collection T-shirts",
      "Trousers Collection": "Collection Pantalons",
      "Shirts Collection": "Collection Chemises"
    }
  },
  de: {
    translation: {
      "Shop Men": "Männer Shoppen",
      "Shop Women": "Frauen Shoppen",
      "Contact Us": "Kontaktiere Uns",
      "Luxury Starts and Ends With Us": "Luxus Beginnt und Endet Mit Uns",
      "Shop Exclusive Products": "Exklusive Produkte Shoppen",
      "Curating the Luxe wardrobe...": "Kuratierung der Luxus-Garderobe...",
      "Show All": "Alles Anzeigen",
      "Men Collection": "Männer Kollektion",
      "Women Collection": "Frauen Kollektion",
      "Tshirts Collection": "T-Shirts Kollektion",
      "Trousers Collection": "Hosen Kollektion",
      "Shirts Collection": "Hemden Kollektion"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('preferredLanguage') || "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

window.i18next = i18n;

export default i18n;
