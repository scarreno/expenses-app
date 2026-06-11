export const receipt = {
  pages: {
    preview: {
      title: "Receipt Preview",
      description: "Review and adjust the extracted items before saving.",
    },

    detail: {
      title: "Receipt Detail",
      description: "Review the original receipt and extracted items.",
    },

    edit: {
      title: "Edit Receipt",
      description:
        "Update the receipt information and adjust extracted items.",
    },
  },

  actions: {
    backToReceipts: "Back to receipts",
    uploadAnotherReceipt: "Upload another receipt",

    addItem: "Add item",
    removeItem: "Remove",

    saveReceipt: "Save receipt",
    savingReceipt: "Saving receipt...",

    saveChanges: "Save Changes",
    savingChanges: "Saving...",

    cancel: "Cancel",
    deleteReceipt: "Delete Receipt",

    selectDate: "Select date",
  },

  file: {
    title: "Receipt File",
    notAvailable: "Receipt file is not available",
  },

  summary: {
    title: "Receipt Summary",

    store: "Store",
    purchaseDate: "Purchase Date",

    totalExtracted: "Total extracted from receipt items",

    unknownStore: "Unknown store",
  },

  items: {
    description: "Description",
    category: "Category",
    quantity: "Quantity",
    unit: "Unit",
    unitPrice: "Unit Price",
    total: "Total",
    actions: "Actions",
  },

  dialogs: {
    delete: {
      title: "Delete receipt?",
      description:
        "This will permanently delete this receipt and its extracted items. This action cannot be undone.",

      actions: {
        cancel: "Cancel",
        confirm: "Delete Receipt",
      },
    },

    discardPreview: {
      title: "Discard receipt preview?",
      description:
        "This will delete the uploaded file and discard all extracted data. This action cannot be undone.",

      actions: {
        keepReviewing: "Keep reviewing",
        discard: "Discard",
      },
    },
  },

  notifications: {
    saved: "Receipt saved successfully",
    saveFailed: "Failed to save receipt",

    updated: "Receipt updated successfully",
    updateFailed: "Failed to update receipt",

    deleted: "Receipt deleted successfully",
    deleteFailed: "Failed to delete receipt",
  },

  errors: {
    cleanupUploadedFile: "Failed to cleanup uploaded file",
    extractReceipt: "Failed to extract receipt",
    unknown: "Unknown error",
  },

  validations: {
    receiptIdRequired: "Receipt ID is required",
    fileRequired: "File is required",
    receiptTypeRequired: "Receipt type is required",
  },
};