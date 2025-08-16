# Gestión de Agenda Front

Aplicación web para agendar citas con profesionales de manera sencilla.

## Descripción

Gestion Agenda Front es el frontend de una plataforma de reservas. Permite
navegar por la oferta de profesionales, elegir un servicio y reservar una
sesión en los horarios disponibles. El proyecto está construido con [Astro](https://astro.build/)
y componentes de [React](https://react.dev/), utiliza [Tailwind CSS](https://tailwindcss.com/) para
los estilos y se integra con [Firebase](https://firebase.google.com/) (Firestore y Functions)
como backend para persistencia y lógica de negocio.

## Requisitos

- Node.js 18+
- Cuenta y proyecto de Firebase configurado

## Instalación

1. Clonar el repositorio.
2. Instalar dependencias:

```bash
npm install
```

3. Crear un archivo `.env` en la raíz con las variables de configuración de Firebase:

```
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
```

## Uso

### Servidor de desarrollo

```bash
npm run dev
```

El sitio estará disponible en `http://localhost:4321`.

### Compilación y vista previa

```bash
npm run build
npm run preview
```

El resultado de la compilación se genera en la carpeta `dist/`.

## Estructura del proyecto

```
src/
├── assets/        Recursos estáticos
├── components/    Componentes de React como el agendador
├── firebase/      Inicialización de Firebase
├── layouts/       Plantillas base
├── pages/         Rutas de la aplicación
└── styles/        Estilos globales
```
