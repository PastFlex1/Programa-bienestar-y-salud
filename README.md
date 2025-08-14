# Zenith - Aplicación de Meditación y Seguimiento de Hábitos

Zenith es una aplicación web moderna y serena, diseñada para ser tu santuario digital. Ofrece una interfaz de usuario limpia e intuitiva para guiarte a través de sesiones de meditación, ayudarte a construir hábitos positivos y proporcionarte un espacio para la reflexión personal.

## ✨ Características Principales

*   **🧘 Sesiones de Meditación Guiada:** Explora una biblioteca de meditaciones categorizadas para aliviar el estrés, mejorar el sueño, aumentar el enfoque y más.
*   **🎯 Seguimiento de Hábitos:** Define y sigue tus hábitos diarios. Un calendario visual te permite ver tu progreso y mantenerte motivado.
*   **📖 Diario Personal:** Un espacio privado y seguro para registrar tus pensamientos, sentimientos y reflexiones diarias.
*   **📊 Visualización de Progreso:** Gráficos semanales que muestran tus minutos de meditación y los hábitos completados para celebrar tus logros.
*   **👤 Perfil Personalizable:** Elige tu propio avatar y gestiona la información de tu cuenta.
*   **🌐 Soporte Multilenguaje:** Interfaz disponible en Español e Inglés.
*   **🎨 Tema Personalizable:** Elige entre un tema claro, oscuro o el predeterminado del sistema.

## 🚀 Pila Tecnológica

*   **Framework:** [Next.js](https://nextjs.org/) (con App Router)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
*   **UI:** [React](https://reactjs.org/)
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
*   **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/)
*   **Backend y Base de Datos:** [Firebase](https://firebase.google.com/) (Firestore para la base de datos)
*   **IA Generativa:** [Genkit](https://firebase.google.com/docs/genkit) (para futuras integraciones de IA)

---

## 🛠️ Instalación y Puesta en Marcha

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### 1. Requisitos Previos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior) en tu sistema.

### 2. Configuración de Firebase

Este proyecto requiere una conexión a Firebase para funcionar.

1.  **Crea un Proyecto en Firebase:** Ve a la [Consola de Firebase](https://console.firebase.google.com/) y crea un nuevo proyecto.
2.  **Crea una Aplicación Web:** Dentro de tu proyecto de Firebase, crea una nueva aplicación web.
3.  **Obtén tus Claves de Configuración:** Firebase te proporcionará un objeto de configuración (`firebaseConfig`). Copia estas claves.
4.  **Configura Firestore:** En la consola de Firebase, ve a la sección "Firestore Database" y crea una base de datos. Comienza en **modo de prueba** para permitir lecturas y escrituras.

### 3. Configuración del Entorno Local

1.  **Crea el Archivo de Entorno:** En la raíz del proyecto, crea un archivo llamado `.env.local`.
2.  **Añade tus Claves de Firebase:** Pega tus claves de configuración de Firebase en el archivo `.env.local` con el siguiente formato:

    ```bash
    NEXT_PUBLIC_FIREBASE_API_KEY="TU_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="TU_AUTH_DOMAIN"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="TU_PROJECT_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="TU_STORAGE_BUCKET"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="TU_MESSAGING_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="TU_APP_ID"
    ```

    **Importante:** Reemplaza `TU_...` con los valores reales de tu configuración de Firebase.

### 4. Instalación de Dependencias

Abre una terminal en la raíz del proyecto y ejecuta el siguiente comando para instalar todas las dependencias necesarias:

```bash
npm install
```

### 5. Ejecutar la Aplicación

Una vez completada la instalación, inicia el servidor de desarrollo:

```bash
npm run dev
```

¡Listo! Abre tu navegador y visita [http://localhost:3000](http://localhost:3000) para ver la aplicación en funcionamiento.

## 📁 Estructura del Proyecto

```
/src
├── app/                # Rutas de la aplicación (App Router)
│   ├── (auth)/         # Rutas de autenticación
│   ├── (dashboard)/    # Rutas del panel de usuario
│   └── layout.tsx
├── components/         # Componentes reutilizables de React
│   └── ui/             # Componentes de ShadCN/ui
├── context/            # Proveedores de contexto de React (Auth, Theme, etc.)
├── lib/                # Utilidades y configuración de Firebase
└── public/             # Recursos estáticos (imágenes, iconos)
```

## 📜 Scripts Disponibles

*   `npm run dev`: Inicia el servidor de desarrollo.
*   `npm run build`: Compila la aplicación para producción.
*   `npm run start`: Inicia un servidor de producción.
*   `npm run lint`: Ejecuta el linter de código.
