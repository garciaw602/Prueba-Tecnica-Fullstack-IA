<img src="https://github.com/garciaw602/Prueba-Tecnica-Fullstack-IA/blob/main/Full%20IA.gif" alt="GIF Prueba" width="1000" style="margin-bottom: 10px;">
# 👤 Persona Management Pro
### Prueba Técnica Full-Stack - Wilson García

Una plataforma sofisticada e intuitiva para el control de registros civiles, diseñada con altos estándares de **UI/UX**, capacidades multi-idioma y persistencia de datos.

---

## 🚀 Demo en Vivo
Puedes probar la aplicación desplegada en Vercel haciendo clic en el siguiente enlace:
👉 **[https://prueba-tecnica-fullstack-ia.vercel.app/#/](https://prueba-tecnica-fullstack-ia.vercel.app/#/)**

---

## ✨ Características Principales

*   **Formularios Inteligentes**: Separación lógica entre Registro Básico (Form A) y Extendido (Form B).
*   **Soporte Multi-idioma**: Cambio dinámico entre Español e Inglés (ES/EN).
*   **Modo Oscuro/Claro**: Interfaz adaptable con transiciones suaves.
*   **Búsqueda en Tiempo Real**: Filtrado instantáneo por nombre o documento en el listado consolidado.
*   **Persistencia de Datos**: Simulación de API con `localStorage` y retrasos asíncronos para una experiencia real.
*   **Validaciones Avanzadas**: 
    *   Bloqueo de caracteres numéricos en nombres/ciudades.
    *   Bloqueo de letras en campos de documentos.
    *   Validación de unicidad de documento (Backend-style).
    *   Requerimientos condicionales en el formulario extendido.

---

## 🛠️ Stack Tecnológico

*   **Frontend**: [React 19](https://react.dev/)
*   **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
*   **Enrutamiento**: [React Router 7](https://reactrouter.com/)
*   **Bundler**: [Vite 6](https://vitejs.dev/)
*   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
*   **Despliegue**: [Vercel](https://vercel.com/)

---

## 💻 Instalación y Configuración Local

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

### 1. Requisitos Previos
Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).

### 2. Clonar el Repositorio
git clone <url-del-repositorio>
cd persona-management-pro

### 3. Instalar Dependencias
npm install


### 4. Ejecutar en Modo Desarrollo
npm run dev
La aplicación estará disponible en `http://localhost:5173`.

### 5. Construir para Producción
npm run build

Esto generará los archivos optimizados en la carpeta `/dist`.



## 📁 Estructura del Proyecto

*   `/src` (Conceptualmente la raíz en este entorno):
    *   `App.tsx`: Componente principal con lógica de estado y rutas.
    *   `/components`: Componentes reutilizables (FormBase, PersonaTable, Toast).
    *   `/services`: Lógica de "API" y persistencia en `localStorage`.
    *   `types.ts`: Definiciones de interfaces de TypeScript.
    *   `index.html`: Punto de entrada HTML con configuración de Tailwind.

---

## 👤 Autor
**Wilson García**

