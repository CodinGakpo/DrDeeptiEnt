import { defineConfig } from '@playwright/test';
import { config } from 'dotenv';

config({ path: './whatsapp-bot/.env' });

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'https://dajok90ftf.execute-api.us-east-1.amazonaws.com',
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  },
  reporter: [['list']],
});
