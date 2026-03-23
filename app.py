from flask import Flask, render_template, request, jsonify, send_file
from algoritmo_genetico import ejecutar
import json
import time
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/ejecutar', methods=['POST'])
def ejecutar_algoritmo():
    data = request.get_json()

    n = int(data['n'])
    poblacion = int(data['poblacion'])
    generaciones = int(data['generaciones'])
    mutacion = float(data['mutacion'])
    metodo = data['metodo']

    inicio = time.time()
    mejor, historial = ejecutar(n, poblacion, generaciones, mutacion, metodo)
    fin = time.time()

    resultados = {
        "solucion": mejor,
        "historial": historial,
        "tiempo": fin - inicio
    }

    with open("resultados.json", "w") as f:
        json.dump(resultados, f, indent=4)

    return jsonify(resultados)


@app.route('/comparar', methods=['POST'])
def comparar():
    data = request.get_json()

    n = int(data['n'])
    poblacion = int(data['poblacion'])
    generaciones = int(data['generaciones'])
    mutacion = float(data['mutacion'])

    _, hist_t = ejecutar(n, poblacion, generaciones, mutacion, "torneo")
    _, hist_r = ejecutar(n, poblacion, generaciones, mutacion, "ruleta")

    return jsonify({
        "torneo": hist_t,
        "ruleta": hist_r
    })


@app.route('/descargar')
def descargar():
    ruta = "resultados.json"

    if os.path.exists(ruta):
        return send_file(ruta, as_attachment=True)
    else:
        return "No hay resultados aún"


if __name__ == '__main__':
    app.run(debug=True)