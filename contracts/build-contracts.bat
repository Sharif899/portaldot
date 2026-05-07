@echo off
echo.
echo PortalRWA - Building all ink! contracts
echo ========================================
echo.

echo [1/3] Building rwa_token...
cd rwa_token
cargo contract build --release
if %errorlevel% neq 0 (
    echo ERROR: rwa_token build failed
    exit /b 1
)
echo rwa_token built successfully!
echo.
cd ..

echo [2/3] Building marketplace...
cd marketplace
cargo contract build --release
if %errorlevel% neq 0 (
    echo ERROR: marketplace build failed
    exit /b 1
)
echo marketplace built successfully!
echo.
cd ..

echo [3/3] Building zkp_verifier...
cd zkp_verifier
cargo contract build --release
if %errorlevel% neq 0 (
    echo ERROR: zkp_verifier build failed
    exit /b 1
)
echo zkp_verifier built successfully!
echo.
cd ..

echo ========================================
echo All 3 contracts built successfully!
echo.
echo Contract files are in:
echo   contracts\rwa_token\target\ink\
echo   contracts\marketplace\target\ink\
echo   contracts\zkp_verifier\target\ink\
echo.
echo Next step: node deploy.js
echo.
