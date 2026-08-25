# DeudasApp

Aplicación web para registrar deudas personales entre contactos. Los datos se guardan únicamente en el navegador mediante `localStorage`.

## Funciones

- Registrar, liquidar y consultar deudas.
- Ver el balance con cada persona y el historial filtrable.
- Enviar recordatorios por WhatsApp.
- Exportar e importar una copia de seguridad JSON.

## Desarrollo

```bash
npm install
npm run dev
```

Abre la dirección que indique Vite (normalmente `http://localhost:3000`). Para verificar el proyecto ejecuta `npm test` y `npm run build`.

## Datos y privacidad

No hay servidor ni base de datos: borrar los datos del navegador los elimina. Exporta un JSON desde **Ajustes** antes de cambiar de equipo o navegador.
