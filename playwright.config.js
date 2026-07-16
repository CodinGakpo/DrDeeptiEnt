import { defineConfig } from '@playwright/test';
import { config } from 'dotenv';

config({ path: './whatsapp-bot/.env' });

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: 'https://i55no616dh.execute-api.ap-south-1.amazonaws.com',
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  },
  reporter: [['list']],
});
