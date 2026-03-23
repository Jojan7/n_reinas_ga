document.getElementById("formulario").addEventListener("submit", function(e) {
    e.preventDefault();

    let datos = {
        n: document.getElementById("n").value,
        poblacion: document.getElementById("poblacion").value,
        generaciones: document.getElementById("generaciones").value,
        mutacion: document.getElementById("mutacion").value,
        metodo: document.getElementById("metodo").value
    };

    fetch("/ejecutar", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(data => {

        let conflictos = calcularConflictos(data.solucion);

        document.getElementById("resultado").innerHTML =
            `<b>Solución:</b> ${data.solucion}<br>
             <b>Conflictos:</b> ${conflictos}<br>
             <b>Estado:</b> ${conflictos === 0 ? "🟢 ÓPTIMA" : "🔴 NO ÓPTIMA"}`;

        document.getElementById("tiempo").innerText =
            "Tiempo: " + data.tiempo.toFixed(4) + " s";

        graficar(data.historial);
        animarSolucion(data.solucion);
    });
});


function descargar() {
    window.open("/descargar", "_blank");
}


function calcularConflictos(sol) {
    let conflictos = 0;

    for (let i = 0; i < sol.length; i++) {
        for (let j = i + 1; j < sol.length; j++) {
            if (sol[i] === sol[j] ||
                Math.abs(sol[i] - sol[j]) === Math.abs(i - j)) {
                conflictos++;
            }
        }
    }
    return conflictos;
}


function dibujarTablero(sol) {
    let n = sol.length;
    let html = "<table>";

    for (let i = 0; i < n; i++) {
        html += "<tr>";

        for (let j = 0; j < n; j++) {

            let color = (i + j) % 2 === 0 ? "blanco" : "negro";
            let clase = color;
            let contenido = "";

            if (sol[i] == j) {
                contenido = (color === "blanco") ? "♕" : "♛";
                clase += " reina";

                for (let k = 0; k < n; k++) {
                    if (k !== i && (
                        sol[k] === j ||
                        Math.abs(sol[k] - j) === Math.abs(k - i)
                    )) {
                        clase += " conflicto";
                    }
                }
            }

            html += `<td class="${clase}">${contenido}</td>`;
        }

        html += "</tr>";
    }

    html += "</table>";
    document.getElementById("tablero").innerHTML = html;
}


async function animarSolucion(sol) {
    let actual = new Array(sol.length).fill(-1);

    for (let i = 0; i < sol.length; i++) {
        actual[i] = sol[i];
        dibujarTablero(actual);
        await new Promise(r => setTimeout(r, 250));
    }
}


let chart;

function graficar(historial) {
    let ctx = document.getElementById("grafica").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: historial.map((_, i) => i),
            datasets: [{
                label: "Fitness",
                data: historial
            }]
        }
    });
}


function comparar() {
    let datos = {
        n: document.getElementById("n").value,
        poblacion: document.getElementById("poblacion").value,
        generaciones: document.getElementById("generaciones").value,
        mutacion: document.getElementById("mutacion").value
    };

    fetch("/comparar", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(data => {

        let ctx = document.getElementById("grafica").getContext("2d");

        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: data.torneo.map((_, i) => i),
                datasets: [
                    { label: "Torneo", data: data.torneo },
                    { label: "Ruleta", data: data.ruleta }
                ]
            }
        });
    });
}