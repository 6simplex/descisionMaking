export declare global {
  interface Window {
    __rDashboard__: {
      appUrl: string;
      serverUrl: string;
      securityUrl: string;
      logoutUrl: string;
      baseUrl: string;
      // for local
      // REV_trans: { [key: string]: any };
    };
  }
}
