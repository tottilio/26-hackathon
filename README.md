# ⚖️ LEIA - (Expedientes Legales e Inteligencia Artificial)

* IMPORTANTE CAMBIARSE A LA RAMA fronted

## ## Inspiration
La gestión de expedientes legales suele ser un proceso lento, manual y lleno de burocracia. Nos inspiramos en la necesidad de abogados y estudiantes de derecho de procesar grandes volúmenes de documentos PDF de forma instantánea. Queríamos crear una herramienta que no solo almacenara archivos, sino que "entendiera" el contenido legal para ofrecer resúmenes ejecutivos y clasificaciones automáticas mediante Inteligencia Artificial.

## What it does
Es una plataforma integral que permite la digitalización y análisis de documentos jurídicos:
* **Carga Inteligente:** Interfaz de arrastrar y soltar (drag & drop) para expedientes PDF.
* **Análisis con IA:** Extracción automática de metadatos clave como el **título del caso**, la **materia** (Civil, Mercantil, Penal) y un **resumen ejecutivo** procesado por **Gemini 2.5**.
* **Dashboard Dinámico:** Visualización en tiempo real de los casos procesados, permitiendo una gestión fluida de la información.
* **Persistencia en la Nube:** Almacenamiento seguro en **MongoDB Atlas**, garantizando que la información esté disponible en cualquier momento.

## How we built it
Construimos una arquitectura de tres capas diseñada para la agilidad y escalabilidad:
* **Frontend:** Desarrollado con **HTML5, JavaScript (ES6+) y Tailwind CSS**. Implementamos una lógica de renderizado dinámico mediante el mapeo de objetos JSON para actualizar la interfaz sin recargar la página.
* **Backend:** Un motor asíncrono basado en **FastAPI (Python)** que orquestra la comunicación entre la IA y la base de datos.
* **Inteligencia Artificial:** Integración con el modelo **Google Gemini** para el procesamiento de lenguaje natural (NLP) y estructuración de datos no formateados.
* **Base de Datos:** Implementamos una base de datos NoSQL con **MongoDB Atlas** para manejar documentos legales de forma flexible.

## Challenges we ran into
* **Sincronización de Estado:** Lograr que el frontend mostrara los datos inmediatamente después de la subida (POST) sin necesidad de refrescar la pantalla, lo cual resolvimos encadenando peticiones asíncronas entre endpoints.
* **Seguridad de Credenciales:** Enfrentamos el reto de proteger nuestras API Keys, aprendiendo a implementar archivos `.env` y configurar correctamente el `.gitignore` para evitar filtraciones en el repositorio.
* **Procesamiento de Archivos:** La gestión de archivos binarios (PDF) y su conversión a formatos legibles para la IA fue un desafío técnico que superamos optimizando los extractores en Python.

## Accomplishments that we're proud of
* **Flujo End-to-End:** Lograr que un archivo viaje desde la computadora del usuario, sea analizado por una IA en segundos y termine guardado permanentemente en la nube.
* **Arquitectura Limpia:** Separar completamente la lógica del backend del diseño del frontend, permitiendo un mantenimiento más sencillo.
* **Persistencia Real:** Haber configurado exitosamente una base de datos remota que mantiene la información viva entre sesiones.

## What we learned
Este proyecto fue un entrenamiento intensivo en:
* **Manejo de Git:** Aprendimos a gestionar ramas, limpiar el historial y utilizar archivos de configuración de forma profesional.
* **Ingeniería de Prompts:** Cómo estructurar instrucciones para que una IA devuelva datos en formatos JSON estrictos y útiles para un sistema legal.
* **Integración de Stack:** La importancia de que el Front, el Back y la DB hablen el mismo idioma para evitar errores de conexión.

## What's next for Untitled..
* **Búsqueda Semántica:** Implementar búsqueda avanzada basada en el contexto del caso y no solo en palabras clave.
* **Exportación de Reportes:** Generar síntesis legales descargables para facilitar el trabajo fuera de la plataforma.
* **Módulo de Plazos:** Integrar un sistema de alertas automáticas basado en las fechas detectadas por la IA dentro de los documentos.

---

### 🛠️ Tech Stack
* **Lenguajes:** Python, JavaScript
* **Frameworks:** FastAPI, Tailwind CSS
* **IA:** Google Gemini 2.5
* **DB:** MongoDB Atlas
* **Herramientas:** Git, Dotenv, Uvicorn
