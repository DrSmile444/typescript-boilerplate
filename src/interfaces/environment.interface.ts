/* eslint-disable @typescript-eslint/naming-convention */
export interface EnvironmentBaseUrlConfig {
  // Base URL
  LOCAL_BASE_URL: string;
  DEV_BASE_URL: string;
  PROD_BASE_URL: string;
  // API
  LOCAL_API_BASE_URL: string;
  DEV_API_BASE_URL: string;
  PROD_API_BASE_URL: string;
}

export interface EnvironmentConfig extends EnvironmentBaseUrlConfig {
  CI: boolean;
}
