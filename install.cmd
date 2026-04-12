:: Script d'installation pour la Webapp Sport

:: Suppression du dossier dist
if exist "dist" (
    rmdir /s /q "dist"
)
:: Suppression du dossier node_modules
if exist "node_modules" (
    rmdir /s /q "node_modules"
)

:: Suppression du fichier package-lock.json
if exist "package-lock.json" (
    del /q "package-lock.json"
)

:: Installation des dépendances npm
npm install