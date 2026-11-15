import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        federation({
            name: 'appstartHost',
            remotes: {
                schedulesMfe: {
                    type: 'module',
                    name: 'schedulesMfe',
                    entry: 'http://localhost:5174/remoteEntry.js',
                    entryGlobalName: 'schedulesMfe',
                    shareScope: 'default',
                },
                suppliesMfe: {
                    type: 'module',
                    name: 'suppliesMfe',
                    entry: 'http://localhost:5175/remoteEntry.js',
                    entryGlobalName: 'suppliesMfe',
                    shareScope: 'default',
                },
                bpaMfe: {
                    type: 'module',
                    name: 'bpaMfe',
                    entry: 'http://localhost:5176/remoteEntry.js',
                    entryGlobalName: 'bpaMfe',
                    shareScope: 'default',
                },
                analyticsMfe: {
                    type: 'module',
                    name: 'analyticsMfe',
                    entry: 'http://localhost:5177/remoteEntry.js',
                    entryGlobalName: 'analyticsMfe',
                    shareScope: 'default',
                },
                recordsMfe: {
                    type: 'module',
                    name: 'recordsMfe',
                    entry: 'http://localhost:5178/remoteEntry.js',
                    entryGlobalName: 'recordsMfe',
                    shareScope: 'default',
                },
                templatesMfe: {
                    type: 'module',
                    name: 'templatesMfe',
                    entry: 'http://localhost:5180/remoteEntry.js',
                    entryGlobalName: 'templatesMfe',
                    shareScope: 'default',
                },
                telehealthMfe: {
                    type: 'module',
                    name: 'telehealthMfe',
                    entry: 'http://localhost:5181/remoteEntry.js',
                    entryGlobalName: 'telehealthMfe',
                    shareScope: 'default',
                },
                // Exemplo de configuração de um MFE remoto chamado "demoMfe"
                demoMfe: {
                    type: 'module',
                    name: 'demoMfe',
                    entry: 'http://localhost:5179/remoteEntry.js',
                    entryGlobalName: 'demoMfe',
                    shareScope: 'default',
                },
            },
            shared: {
                react: { singleton: true },
                'react-dom': { singleton: true }
            },
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(import.meta.dirname, './src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            // 1. ESPECÍFICO: Desvia chamadas da rota para o servidor do MFE
            '/api/v1/schedules': {
                target: 'http://localhost:5174',
                rewrite: (path) => path.replace('/api/v1/schedules', '/api/v1'),
                changeOrigin: true,
                secure: false,
            },
            '/api/v1/supplies': {
                target: 'http://localhost:5175',
                rewrite: (path) => path.replace('/api/v1/supplies', '/api/v1'),
                changeOrigin: true,
                secure: false,
            },
            '/api/v1/bpa': {
                target: 'http://localhost:5176',
                rewrite: (path) => path.replace('/api/v1/bpa', '/api/v1'),
                changeOrigin: true,
                secure: false,
            },
            '/api/v1/analytics': {
                target: 'http://localhost:5177',
                rewrite: (path) => path.replace('/api/v1/analytics', '/api/v1'),
                changeOrigin: true,
                secure: false,
            },
            '/api/v1/records': {
                target: 'http://localhost:5178',
                rewrite: (path) => path.replace('/api/v1/records', '/api/v1'),
                changeOrigin: true,
                secure: false,
            },
            '/api/v1/templates': {
                target: 'http://localhost:5180',
                rewrite: (path) => path.replace('/api/v1/templates', '/api/v1'),
                changeOrigin: true,
                secure: false,
            },
            '/api/v1/telehealth': {
                target: 'http://localhost:5181',
                rewrite: (path) => path.replace('/api/v1/telehealth', '/api/v1'),
                changeOrigin: true,
                secure: false,
            },
            //Exemplo de proxy para o MFE de demo
            '/api/v1/demo': {
                target: 'http://localhost:5179',
                rewrite: (path) => path.replace('/api/v1/demo', '/api/v1'),
                changeOrigin: true,
                secure: false,
            },
            // 2. GENÉRICO: Mantém todo o restante das requisições (auth, login, etc) na sua API principal
            '/api': {
                target: process.env.API_BASE_URL || 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            },
            '/health': {
                target: process.env.API_BASE_URL || 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
});
