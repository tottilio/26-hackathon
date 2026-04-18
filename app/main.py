from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import db
from app.services.pdf_processor import read_pdf
from app.services.ai_engine import extract_legal_data
import shutil
import os

# Inicializamos FastAPI
app = FastAPI(title="API Back-End Legal")

# Configuramos CORS para que el equipo de Front pueda conectarse desde otro puerto/IP
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite peticiones de cualquier origen
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos los headers
)

# Se ejecuta justo cuando arranca la API
@app.on_event("startup")
def startup_db_client():
    db.connect()

@app.post("/analyze")
async def analyze_pdf(file: UploadFile = File(...)):
    """Ruta principal: recibe PDF, analiza con IA y guarda en Mongo."""
    # 1. Crear carpeta uploads si no existe
    if not os.path.exists("uploads"):
        os.makedirs("uploads")

    # 2. Guardar el archivo que envía el Front-End temporalmente
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 3. Procesar: Leer PDF -> Extraer con IA
    text = read_pdf(file_path)
    legal_data = extract_legal_data(text)
    
    # 4. Guardar en MongoDB (Aquí es donde se crea la DB/Colección automáticamente)
    # Usamos .copy() para no modificar el objeto original
    db.db.expedientes.insert_one(legal_data.copy())
    
    # 5. Borrar el archivo temporal para no llenar el disco
    os.remove(file_path)
    
    # Quitamos el ID de Mongo para que no cause error al devolver el JSON
    if "_id" in legal_data:
        del legal_data["_id"]
        
    return {"status": "success", "data": legal_data}

@app.get("/expedientes")
async def get_all():
    """Devuelve todos los expedientes guardados."""
    # Busca todo en la colección 'expedientes' y quita el ID interno de Mongo
    casos = list(db.db.expedientes.find({}, {"_id": 0}))
    return {"total": len(casos), "data": casos}