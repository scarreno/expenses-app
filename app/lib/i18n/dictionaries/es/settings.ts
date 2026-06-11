export const settings = {
  title: "Configuración",
  description:
    "Administra las preferencias y opciones de visualización de la aplicación.",

  application: {
    title: "Configuración de la Aplicación",
    description:
      "Configura cómo se muestran el idioma, las fechas y la moneda.",
  },

  language: {
    label: "Idioma",
    description:
      "Selecciona el idioma utilizado por la interfaz de la aplicación.",

    options: {
      english: "Inglés",
      spanish: "Español",
    },
  },

  regionalFormat: {
    label: "Formato Regional",
    description:
      "Selecciona el formato regional utilizado para fechas y números.",

    options: {
      spanishChile: "Español (Chile)",
      englishUs: "Inglés (Estados Unidos)",
    },
  },

  dateFormat: {
    label: "Formato de Fecha",
    description:
      "Define cómo se mostrarán las fechas de los recibos en toda la aplicación.",
  },

  currency: {
    label: "Moneda",
    description:
      "Cambiar la moneda solo modifica los símbolos y el formato de visualización. Los montos existentes no se convierten.",

    options: {
      clp: "Peso Chileno (CLP)",
      usd: "Dólar Estadounidense (USD)",
      eur: "Euro (EUR)",
    },
  },

  actions: {
    save: "Guardar Configuración",
    saving: "Guardando...",
  },

  notifications: {
    saved: "Configuración guardada",
    saveFailed: "No fue posible guardar la configuración",
  },
};