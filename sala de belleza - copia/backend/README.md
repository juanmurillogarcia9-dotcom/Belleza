# Backend del Salón Esther

## Configuración

1. Instala las dependencias con `npm install`.
2. Copia `.env.example` como `.env` y configura `MONGO_URI` y un `JWT_SECRET` largo y privado.
3. Define `ESTILISTA_REGISTRATION_CODE` con un código que solo se comparta con estilistas autorizados.
4. Inicia el servidor con `npm start`.

El registro de clientes está disponible sin código. El registro de estilistas se rechaza desde el servidor si no se envía el código configurado, y también se deshabilita cuando `ESTILISTA_REGISTRATION_CODE` no está definido. No publiques el archivo `.env`.

Las cuentas nuevas guardan contraseñas cifradas con bcrypt. Si hay cuentas antiguas con contraseñas en texto plano, se convierten a hash cuando inician sesión correctamente.

Los estilistas pueden administrar el catálogo y las especialidades de su perfil. Al registrar un cliente desde el panel, asigna una contraseña inicial para que esa persona pueda entrar y cambiarla en «Mi perfil».
