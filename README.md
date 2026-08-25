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

## Modo multiusuario (Supabase)

Para activar cuentas, roles y sincronización entre dispositivos, crea un proyecto en Supabase, ejecuta [`supabase/schema.sql`](supabase/schema.sql) en su SQL Editor y copia `.env.example` a `.env.local` con la URL y la clave pública `anon` del proyecto. En Vercel añade las mismas variables de entorno y vuelve a desplegar.

Las cuentas nuevas reciben el rol `client`. Convierte la primera en `admin` con la instrucción comentada al final del archivo SQL. El administrador puede consultar usuarios y cambiar sus roles; los clientes solo pueden leer y modificar sus propios datos.
