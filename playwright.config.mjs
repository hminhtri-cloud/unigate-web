import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir:'./tests/browser',timeout:90000,fullyParallel:false,workers:1,use:{baseURL:'http://127.0.0.1:3001',headless:true,trace:'retain-on-failure'},webServer:{command:'npm start',url:'http://127.0.0.1:3001/api/health',reuseExistingServer:true,timeout:30000} });
