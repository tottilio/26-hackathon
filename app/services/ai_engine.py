import ollama
import re  # <--- ESTA ES LA QUE FALTA
import json

def extract_legal_data(text: str):
    """Envía el texto a Ollama para estructurarlo en JSON."""
    # Definimos las instrucciones precisas para la IA
    prompt = f"""
    [INST] Eres un extractor de datos. Responde UNICAMENTE con un objeto JSON.
    No hables, no expliques. Si no sabes un dato, pon "No especificado".

    TEXTO:
    {text[:15000]}

    JSON esperado:
    {{
        "expediente": "",
        "titulo_caso": "",
        "materia": "",
        "partes": {{ "actor": "", "demandado": "" }},
        "resumen": "",
        "fecha_vencimiento": "YYYY-MM-DD",
        "estado": "Activo"
    }}
    [/INST]
    """
    
    response = ollama.chat(model='llama3', messages=[{'role': 'user', 'content': prompt}])
    raw_content = response['message']['content']
    print("--- RESPUESTA CRUDA DE LA IA ---")
    print(raw_content)
    print("-------------------------------")
    try:
        # Buscamos lo que esté entre llaves { } para ignorar texto extra
        match = re.search(r'\{.*\}', raw_content, re.DOTALL)
        if match:
            clean_json = match.group(0)
            return json.loads(clean_json)
        else:
            raise ValueError("No se encontró JSON en la respuesta")
            
    except Exception as e:
        print(f"Error limpiando respuesta: {e}")
        # Devolvemos un objeto por defecto para que no truene el Front-End
        return {
            "expediente": "Error de lectura",
            "titulo_caso": "No disponible",
            "materia": "No disponible",
            "partes": {"actor": "N/A", "demandado": "N/A"},
            "resumen": "La IA no devolvió un formato válido.",
            "fecha_vencimiento": "2026-01-01",
            "estado": "Inactivo"
        }