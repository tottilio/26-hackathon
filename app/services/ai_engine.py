import json
import re
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Configuración de la API Key
# Sustituye 'TU_LLAVE_AQUÍ' por la llave que me pasaste antes
load_dotenv()
genai.configure(api_key=os.getenv("API_KEY"))

def extract_legal_data(text):
    # Usamos la versión Flash: es la más rápida y gratuita
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # El prompt es la clave: le pedimos explícitamente el JSON
    prompt = f"""
    Analiza el siguiente texto legal y extrae la información ÚNICAMENTE en este formato JSON:
    {{
        "expediente": "número",
        "titulo_caso": "actor vs demandado",
        "materia": "civil/amparo/etc",
        "partes": {{ "actor": "nombre", "demandado": "nombre" }},
        "resumen": "máximo 3 oraciones",
        "fecha_vencimiento": "YYYY-MM-DD",
        "estado": "Activo"
    }}

    IMPORTANTE: No escribas nada más, solo el objeto JSON.
    Texto: {text[:15000]}
    """

    try:
        # Llamada directa sin configuraciones extra que den error
        response = model.generate_content(prompt)
        res_text = response.text

        # Limpiamos el texto por si la IA agrega basura (```json ... ```)
        json_match = re.search(r'\{.*\}', res_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        
        return json.loads(res_text)

    except Exception as e:
        print(f"Error en Gemini: {e}")
        # Retorno de emergencia para que tu sistema no truene
        return {
            "expediente": "N/A",
            "titulo_caso": "Error de procesamiento",
            "materia": "N/A",
            "partes": {"actor": "N/A", "demandado": "N/A"},
            "resumen": "Hubo un problema al conectar con la IA.",
            "fecha_vencimiento": "N/A",
            "estado": "Inactivo"
        }