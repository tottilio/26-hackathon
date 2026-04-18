import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

class Database:
    client: MongoClient = None
    db = None

    @classmethod
    def connect(cls):
        # Usamos tlsAllowInvalidCertificates solo si tienes problemas de SSL en Windows
        uri = os.getenv("MONGO_URI")
        cls.client = MongoClient(uri) 
        cls.db = cls.client[os.getenv("DB_NAME")]
        
        # Prueba de conexión rápida
        cls.client.admin.command('ping')
        print(f"✅ ¡Conexión exitosa a MongoDB Atlas! Base de datos: {os.getenv('DB_NAME')}")

db = Database