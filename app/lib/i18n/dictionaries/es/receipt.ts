export const receipt = {
  pages: {
    preview: {
      title: "Vista Previa del Recibo",
      description:
        "Revisa y ajusta los artículos extraídos antes de guardar.",
    },

    detail: {
      title: "Detalle del Recibo",
      description:
        "Revisa el recibo original y los artículos extraídos.",
    },

    edit: {
      title: "Editar Recibo",
      description:
        "Actualiza la información del recibo y ajusta los artículos extraídos.",
    },
  },

  actions: {
    backToReceipts: "Volver a recibos",
    uploadAnotherReceipt: "Subir otro recibo",

    addItem: "Agregar artículo",
    removeItem: "Eliminar",

    saveReceipt: "Guardar recibo",
    savingReceipt: "Guardando recibo...",

    saveChanges: "Guardar Cambios",
    savingChanges: "Guardando...",

    cancel: "Cancelar",
    deleteReceipt: "Eliminar Recibo",

    selectDate: "Seleccionar fecha",
  },

  file: {
    title: "Archivo del Recibo",
    notAvailable: "El archivo del recibo no está disponible",
  },

  summary: {
    title: "Resumen del Recibo",

    store: "Tienda",
    purchaseDate: "Fecha de Compra",

    totalExtracted: "Total extraído de los artículos del recibo",

    unknownStore: "Tienda desconocida",
  },

  items: {
    description: "Descripción",
    category: "Categoría",
    quantity: "Cantidad",
    unit: "Unidad",
    unitPrice: "Precio Unitario",
    total: "Total",
    actions: "Acciones",
  },

  dialogs: {
    delete: {
      title: "¿Eliminar recibo?",
      description:
        "Esto eliminará permanentemente este recibo y los artículos extraídos asociados. Esta acción no se puede deshacer.",

      actions: {
        cancel: "Cancelar",
        confirm: "Eliminar Recibo",
      },
    },

    discardPreview: {
      title: "¿Descartar vista previa del recibo?",
      description:
        "Esto eliminará el archivo cargado y descartará todos los datos extraídos. Esta acción no se puede deshacer.",

      actions: {
        keepReviewing: "Seguir revisando",
        discard: "Descartar",
      },
    },
  },

  notifications: {
    saved: "Recibo guardado correctamente",
    saveFailed: "No fue posible guardar el recibo",

    updated: "Recibo actualizado correctamente",
    updateFailed: "No fue posible actualizar el recibo",

    deleted: "Recibo eliminado correctamente",
    deleteFailed: "No fue posible eliminar el recibo",
  },

  errors: {
    cleanupUploadedFile: "No fue posible eliminar el archivo cargado",
    extractReceipt: "No fue posible procesar el recibo",
    unknown: "Error desconocido",
  },

  validations: {
    receiptIdRequired: "El ID del recibo es obligatorio",
    fileRequired: "Debe seleccionar un archivo",
    receiptTypeRequired: "Debe seleccionar un tipo de recibo",
  },
};