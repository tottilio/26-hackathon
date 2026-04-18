import ollama
import json

def extract_legal_data(text: str):
    """Envía el texto a Ollama para estructurarlo en JSON."""
    # Definimos las instrucciones precisas para la IA
    prompt = f"""
    Eres un asistente legal experto. Analiza el texto y devuelve un JSON con:
    - nombre_caso, materia, numero_expediente, resumen_breve, 
      etapa_procesal_siguiente, fecha_limite (DD/MM/YYYY).
    Si no encuentras un dato, usa "No especificado".
    
    TEXTO: {text[:24000]}  # Limitamos caracteres para no saturar el modelo
    """
    
    # Llamamos al modelo local (asegúrate de tenerlo descargado)
    response = ollama.chat(model='llama3', messages=[{'role': 'user', 'content': prompt}])
    content = response['message']['content']
    
    # Intentamos limpiar el texto para obtener solo el objeto JSON
    try:
        start = content.find('{')
        end = content.rfind('}') + 1
        return json.loads(content[start:end])
    except Exception as e:
        return {"error": f"Error al procesar JSON: {str(e)}", "raw": content}