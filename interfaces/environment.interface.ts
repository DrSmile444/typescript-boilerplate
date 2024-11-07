/* eslint-disable @typescript-eslint/naming-convention */
export interface EnvironmentBaseUrlConfig {
  LOCAL_BASE_URL: string;
  DEV_BASE_URL: string;
  PROD_BASE_URL: string;
}

export interface EnvironmentConfig extends EnvironmentBaseUrlConfig {
  CI: boolean;
}
