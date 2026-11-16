export const receiptsHistory = {
  title: "Receipts History",
  description:
    "Browse and review your previously processed receipts.",

  filters: {
    allMonths: "All months",    
    allYears: "All years",
    allBusinessTypes: "All Business types"
  },

  card: {
    created: "Created",
    purchaseDate: "Purchase Date",
  },

  actions: {
    viewDetail: "View Detail",
    editReceipt: "Edit Receipt",
  },

  pagination: {
    page: "Page",
    of: "of",
    previous: "Previous",
    next: "Next"
  },

  pending: {
    title: "Pending / Ready for review",
    description:
      "Receipts that are still being extracted, ready for your review, or failed.",
    empty: "No receipts are waiting.",
    file: "File",
    review: "Review",
    status: {
      extracting: "Processing",
      ready: "Ready for review",
      failed: "Extraction failed",
    },
  },
};