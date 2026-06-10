import type { Dictionary } from "../types";

export const es: Dictionary = {
  common: {
    appName: "Expenses MVP",
    signOut: "Cerrar sesión",
    signedIn: "Sesión iniciada",
    menu: "Menú",
  },
  navigation: {
    upload: "Subir",
    receipts: "Recibos",
    dashboard: "Dashboard",
    categories: "Categorías",
    profile: "Perfil",
    settings: "Configuración",
  },
  upload: {
    title: "Subir recibo",
    description: "Sube un recibo y deja que la IA extraiga los detalles.",
    receiptInformation: "Información del recibo",
    receiptInformationDescription:
      "Selecciona el tipo de negocio y sube el archivo del recibo.",
    selectBusinessType: "Seleccionar tipo de negocio",
    selectReceiptFile: "Seleccionar archivo",
    uploadReceipt: "Subir recibo",
    receiptTypeMatters: "El tipo de recibo importa",
    receiptTypeMattersDescription:
      "Seleccionar el tipo correcto mejora la precisión de extracción y clasificación de categorías.",
  },
};