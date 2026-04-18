import pdfplumber

def read_pdf(file_path: str) -> str:
    """Extrae todo el texto de un archivo PDF."""
    texto_completo = ""
    # Abre el archivo PDF usando la ruta proporcionada
    with pdfplumber.open(file_path) as pdf:
        # Recorre cada página del documento
        for page in pdf.pages:
            # Extrae el texto y lo acumula (si es None, pone vacío)
            texto_completo += page.extract_text() or ""
    return texto_completo