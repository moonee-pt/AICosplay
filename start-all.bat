@echo off

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
echo Error: Node.js not found. Please install Node.js 16+ first.
echo You can download it from https://nodejs.org/
pause
exit /b 1
)

REM Check if backend dependencies are installed
if not exist backend\node_modules (
echo Installing backend dependencies...
cd backend
npm install
if %errorlevel% neq 0 (
echo Failed to install backend dependencies. Check network or npm configuration.
pause
exit /b 1
)
cd ..
)

REM Check if frontend dependencies are installed
if not exist node_modules (
echo Installing frontend dependencies...
npm install
if %errorlevel% neq 0 (
echo Failed to install frontend dependencies. Check network or npm configuration.
pause
exit /b 1
)
)

REM Start backend service
start "Backend Proxy Service" cmd /k "cd backend && npm start"

REM Wait 2 seconds for backend to start
timeout /t 2 >nul

REM Start frontend service
start "Frontend Dev Server" cmd /k "npm run dev"

REM Display completion message
echo.
echo Services started successfully!
echo Frontend will be available at http://localhost:5173/
echo Backend proxy is running at http://localhost:3000/
echo To stop the services, close the command windows.
echo Press any key to exit this window...
pause >nul