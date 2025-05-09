/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Define process.env for browser environment
interface Process {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  };
}

declare const process: Process;
