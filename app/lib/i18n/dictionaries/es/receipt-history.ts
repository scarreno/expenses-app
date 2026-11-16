export const receiptsHistory = {
  title: "Historial de Recibos",
  description:
    "Explora y revisa tus recibos procesados anteriormente.",

  filters: {
    allMonths: "Todos los meses",
    allYears: "Todos los años",
    allBusinessTypes: "Todos los tipos de negocio"
  },

  card: {
    created: "Creado",
    purchaseDate: "Fecha de Compra",
  },

  actions: {
    viewDetail: "Ver Detalle",
    editReceipt: "Editar Recibo",
  },

  pagination: {
    page: "Página",
    of: "de",
    previous: "Anterior",
    next: "Siguiente"
  },

  pending: {
    title: "Pendientes / Listos para revisar",
    description:
      "Recibos que se están extrayendo, listos para tu revisión, o con error.",
    empty: "No hay recibos en espera.",
    file: "Archivo",
    review: "Revisar",
    status: {
      extracting: "Procesando",
      ready: "Listo para revisar",
      failed: "Extracción fallida",
    },
  },
};