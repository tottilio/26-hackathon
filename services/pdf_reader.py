import pdfplumber 

def extract_text(path):
    texto = ""  

    with pdfplumber.open(path) as pdf:  # Abre el PDF
        for page in pdf.pages:  # Recorre cada página
            texto += page.extract_text() or ""  # Extrae texto y lo agrega

    return texto