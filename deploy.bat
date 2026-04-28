@echo off
color 0b
echo =======================================================
echo     Preparando el despliegue a Firebase Hosting...
echo =======================================================
echo.

IF NOT EXIST "firebase.exe" (
    echo Descargando Firebase CLI... Esto puede demorar unos minutos dependiendo de tu conexion.
    curl -# -o firebase.exe https://firebase.tools/bin/win/latest
    echo Descarga completada.
    echo.
) ELSE (
    echo Firebase CLI ya se encuentra descargado.
    echo.
)

echo Paso 1: Iniciando sesion...
echo Se abrira una ventana de tu navegador. Por favor, selecciona tu cuenta de Google y dale a "Permitir".
echo.
firebase.exe login

echo.
echo Paso 2: Subiendo tu pagina a internet...
echo.
firebase.exe deploy --only hosting

echo.
echo =======================================================
echo ¡Despliegue finalizado con exito!
echo Tu aplicacion ya esta disponible en:
echo https://taller-1c6c3.web.app
echo =======================================================
echo Ya puedes cerrar esta ventana.
pause
