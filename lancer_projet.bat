@echo off
title Lancement du Projet Onyx
echo =======================================================
echo        LANCEMENT SECURISE DE L'APPLICATION ONYX
echo =======================================================
echo.
echo [1/2] Demarrage du Backend NestJS sur le port 5000...
start "Onyx Backend (Port 5000)" cmd /k "cd backend && set NODE_TLS_REJECT_UNAUTHORIZED=0 && npm run start:dev"

echo.
echo [2/2] Demarrage du Frontend Next.js sur le port 3000...
start "Onyx Frontend (Port 3000)" cmd /k "cd frontend && set NODE_TLS_REJECT_UNAUTHORIZED=0 && npm run dev"

echo.
echo =======================================================
echo  Les deux serveurs sont en cours de demarrage...
echo  - Frontend : http://localhost:3000
echo  - Backend  : http://localhost:5000
echo =======================================================
echo.
echo Vous pouvez fermer cette fenetre principale. 
echo Laissez les deux autres fenetres ouvertes pendant que vous utilisez le site.
echo.
pause
