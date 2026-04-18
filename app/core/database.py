import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Carga las variables del archivo .env
load_dotenv()

class Database:
    client: MongoClient = None
    db = None

    @classmethod
    def connect(cls):
        # Se conecta al servidor de MongoDB usando la URL del .env
        cls.client = MongoClient(os.getenv("MONGO_URI"))
        # Selecciona la base de datos (Mongo la creará sola al insertar datos)
        cls.db = cls.client[os.getenv("DB_NAME")]
        print(f"✅ Conexión exitosa a la base de datos: {os.getenv('DB_NAME')}")

# Instancia para usar en toda la app
db = Database