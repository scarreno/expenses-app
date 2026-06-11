export const settings = {
  title: "Settings",
  description:
    "Manage application preferences and display options.",

  application: {
    title: "Application Settings",
    description:
      "Configure how language, dates and currency are displayed.",
  },

  language: {
    label: "Language",
    description:
      "Choose the language used by the application interface.",

    options: {
      english: "English",
      spanish: "Spanish",
    },
  },

  regionalFormat: {
    label: "Regional Format",
    description:
      "Select the regional format used for dates and numbers.",

    options: {
      spanishChile: "Spanish (Chile)",
      englishUs: "English (US)",
    },
  },

  dateFormat: {
    label: "Date Format",
    description:
      "Choose how receipt dates are displayed across the app.",
  },

  currency: {
    label: "Currency",
    description:
      "Changing the currency updates symbols and formatting only. Existing receipt amounts are not converted.",

    options: {
      clp: "Chilean Peso (CLP)",
      usd: "US Dollar (USD)",
      eur: "Euro (EUR)",
    },
  },

  actions: {
    save: "Save Settings",
    saving: "Saving...",
  },

  notifications: {
    saved: "Settings saved",
    saveFailed: "Failed to save settings",
  },
};