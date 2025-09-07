export {};

declare global {
  interface Window {
    deferredPrompt: any;
    showInstallNotification: () => void;
  }
}