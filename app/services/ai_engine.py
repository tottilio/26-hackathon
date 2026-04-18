import json
import re
import google.generativeai as genai

# Configuración de la API Key
# Sustituye 'TU_LLAVE_AQUÍ' por la llave que me pasaste antes
genai.configure(api_key="TU_LLAVE_AQUÍ")

def extract_legal_data(text):
    # Usamos la versión Flash: es la más rápida y gratuita
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    Eres un experto analista legal. Extrae la información del texto y devuélvela estrictamente en formato JSON.
    
    Estructura JSON:
    {{
        "expediente": "Número de expediente",
        "titulo_caso": "Parte Actora vs Parte Demandada",
        "materia": "Materia legal (ej. Civil, Amparo, Familiar)",
        "partes": {{ "actor": "Nombre", "demandado": "Nombre" }},
        "resumen": "Resumen ejecutivo del documento",
        "fecha_vencimiento": "YYYY-MM-DD",
        "estado": "Activo"
    }}

    Si falta un dato, pon "No especificado". No escribas nada más que el JSON.

    TEXTO A ANALIZAR:
    {text[:30000]}
    """

    try:
        # Llamada a la API de Google
        response = model.generate_content(prompt)
        raw_content = response.text
        
        # Limpieza por si la IA pone ```json ... ```
        match = re.search(r'\{.*\}', raw_content, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return json.loads(raw_content)

    except Exception as e:
        print(f"Error con Gemini: {e}")
        # Retorno de seguridad para no romper tu flujo
        return {
            "expediente": "ERROR_API",
            "titulo_caso": "Error de procesamiento",
            "materia": "N/A",
            "partes": {"actor": "N/A", "demandado": "N/A"},
            "resumen": "Hubo un problema con la conexión a la nube.",
            "fecha_vencimiento": "2026-01-01",
            "estado": "Inactivo"
        }