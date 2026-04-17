from flask import Flask, render_template, request
import os

from services.pdf_reader import extract_text 
from services.extractor import extract_data  

app = Flask(__name__) 

UPLOAD_FOLDER = "uploads" 
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER 

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)  

@app.route("/") 
def index():
    return render_template("index.html")  

@app.route("/analyze", methods=["POST"])  
def analyze():
    file = request.files["file"] 

    if file:  
        filename = file.filename.replace(" ", "_")  
        path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(path) 

        texto = extract_text(path) 
        data = extract_data(texto)  

        return render_template("result.html", data=data)

    return "Error al subir archivo"  

app.run(debug=True)