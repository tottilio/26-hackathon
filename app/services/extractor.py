import re  # Librería de expresiones regulares (búsqueda de patrones)

def extract_data(texto):
    data = {}  # Diccionario donde guardaremos resultados

    # Buscar fecha en formato dd/mm/yyyy
    fecha = re.search(r"\d{2}/\d{2}/\d{4}", texto)  # Busca patrón de fecha
    data["fecha"] = fecha.group() if fecha else "No encontrada"  # Guarda resultado

    # Buscar número de expediente (ejemplo básico)
    expediente = re.search(r"Expediente[:\s]*(\w+)", texto)  # Busca la palabra expediente
    data["expediente"] = expediente.group(1) if expediente else "No encontrado"  # Guarda resultado

    # Crear resumen simple (primeros 500 caracteres)
    data["resumen"] = texto[:500] + "..."  # Recorta el texto

    return data  # Devuelve todos los datos encontrados