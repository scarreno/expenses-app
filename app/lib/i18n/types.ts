export type SupportedLocale = "en" | "es";

export type Dictionary = {
  common: {
    appName: string;
    signOut: string;
    signedIn: string;
    menu: string;
  };
  navigation: {
    upload: string;
    receipts: string;
    dashboard: string;
    categories: string;
    profile: string;
    settings: string;
  };
  upload: {
    title: string;
    description: string;
    receiptInformation: string;
    receiptInformationDescription: string;
    selectBusinessType: string;
    selectReceiptFile: string;
    uploadReceipt: string;
    receiptTypeMatters: string;
    receiptTypeMattersDescription: string;
  };
};