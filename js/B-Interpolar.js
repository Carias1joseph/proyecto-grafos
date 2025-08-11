function busquedaInterpolacion(arr, valor) {
    let inicio = 0, fin = arr.length - 1;
    while (inicio <= fin && valor >= arr[inicio] && valor <= arr[fin]) {
        if (inicio === fin) return arr[inicio] === valor ? inicio : -1;
        let pos = inicio + Math.floor(((valor - arr[inicio]) * (fin - inicio)) / (arr[fin] - arr[inicio]));
        if (arr[pos] === valor) return pos;
        if (arr[pos] < valor) inicio = pos + 1;
        else fin = pos - 1;
    }
    return -1;
}



function ejecutarInterpolacion() {
    let arr = document.getElementById("arrayInput").value.split(",").map(Number).sort((a,b) => a-b);
    let valor = Number(document.getElementById("valorInput").value);
    mostrarResultado(busquedaInterpolacion(arr, valor));
}

// Mostrar resultado en el HTML
function mostrarResultado(resultado) {
    document.getElementById("resultado").textContent =
        resultado !== -1
        ? `Valor encontrado en la posición: ${resultado}`
        : "Valor no encontrado";
}


// Animacion

// Elementos del DOM
    const arrayInput = document.getElementById("arrayInput");
    const valorInput = document.getElementById("valorInput");
    const startBtn = document.getElementById("startBtn");
    const resetBtn = document.getElementById("resetBtn");
    const arrayContainer = document.getElementById("array");
    const indicesContainer = document.getElementById("indices");
    const resultado = document.getElementById("resultado");

    let arr = [];
    let animationInterval = null;
    let steps = [];
    let currentStep = 0;

    // Parsear y ordenar el arreglo
    function parseAndSortArray(input) {
        return input
            .split(',')
            .map(n => parseInt(n.trim(), 10))
            .filter(n => !isNaN(n))
            .sort((a, b) => a - b);
    }

    // Renderizar el arreglo y sus índices
    function renderArray() {
        arrayContainer.innerHTML = "";
        indicesContainer.innerHTML = "";

        arr.forEach((value, index) => {
            // Celda del valor
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.id = `cell-${index}`;
            cell.textContent = value;
            arrayContainer.appendChild(cell);

            // Etiqueta del índice
            const idxLabel = document.createElement("div");
            idxLabel.style.width = "45px";
            idxLabel.textContent = index;
            indicesContainer.appendChild(idxLabel);
        });
    }

    // Resaltar celdas: inicio, fin, interpolado (medio)
    function highlight(inicio, pos, fin, found = false) {
        document.querySelectorAll(".cell").forEach((cell, i) => {
            cell.classList.remove("inicio", "fin", "medio", "found");
            if (i === inicio && i !== pos) cell.classList.add("inicio");
            if (i === fin && i !== pos) cell.classList.add("fin");
            if (i === pos) {
                cell.classList.add("medio");
                if (found) cell.classList.add("found");
            }
        });
    }

    // Generar pasos del algoritmo de interpolación
    function generarPasos(arreglo, valor) {
        const pasos = [];
        let inicio = 0;
        let fin = arreglo.length - 1;

        while (inicio <= fin && valor >= arreglo[inicio] && valor <= arreglo[fin]) {
            // Evitar división por cero
            if (arreglo[inicio] === arreglo[fin]) {
                pasos.push({ inicio, fin, pos: inicio });
                break;
            }

            // Fórmula de interpolación
            const pos = inicio + Math.floor(
                ((valor - arreglo[inicio]) * (fin - inicio)) / (arreglo[fin] - arreglo[inicio])
            );

            pasos.push({ inicio, fin, pos, valor: arreglo[pos] });

            if (arreglo[pos] === valor) {
                pasos.push({ inicio, fin, pos, encontrado: true });
                return pasos;
            } else if (arreglo[pos] < valor) {
                inicio = pos + 1;
            } else {
                fin = pos - 1;
            }
        }

        // Si sale del bucle sin encontrar
        pasos.push({ noEncontrado: true });
        return pasos;
    }

    // Iniciar animación
    function iniciarBusqueda() {
        const valor = parseInt(valorInput.value, 10);
        if (isNaN(valor)) {
            resultado.textContent = "Por favor, ingresa un número válido.";
            return;
        }

        // Parsear y ordenar
        arr = parseAndSortArray(arrayInput.value);
        if (arr.length === 0) {
            resultado.textContent = "El arreglo está vacío o contiene valores inválidos.";
            return;
        }

        startBtn.disabled = true;
        arrayInput.disabled = true;
        valorInput.disabled = true;
        resultado.textContent = `Buscando ${valor} por interpolación...`;

        // Renderizar arreglo ordenado
        renderArray();

        // Generar pasos
        steps = generarPasos(arr, valor);
        currentStep = 0;

        animationInterval = setInterval(() => {
            const paso = steps[currentStep];

            if (paso.noEncontrado) {
                clearInterval(animationInterval);
                highlight(-1, -1, -1);
                resultado.textContent = `Valor ${valor} no encontrado.`;
                startBtn.disabled = false;
                arrayInput.disabled = false;
                valorInput.disabled = false;
            } else if (paso.encontrado) {
                clearInterval(animationInterval);
                highlight(paso.inicio, paso.pos, paso.fin, true);
                resultado.textContent = `¡Valor ${valor} encontrado en la posición ${paso.pos}!`;
                startBtn.disabled = false;
                arrayInput.disabled = false;
                valorInput.disabled = false;
            } else {
                highlight(paso.inicio, paso.pos, paso.fin);
                const formula = `pos = ${paso.inicio} + [((${valor} - ${arr[paso.inicio]}) × (${paso.fin} - ${paso.inicio})) / (${arr[paso.fin]} - ${arr[paso.inicio]})]`;
                resultado.innerHTML = `🔍 ${formula}<br>→ pos estimada: <strong>${paso.pos}</strong> → arr[${paso.pos}] = ${paso.valor}`;
            }

            currentStep++;
        }, 1500); // 1.5 segundos por paso (más tiempo para entender la fórmula)
    }

    // Reiniciar
    function reset() {
        if (animationInterval) clearInterval(animationInterval);
        arr = parseAndSortArray(arrayInput.value);
        renderArray();
        resultado.textContent = "Modifica el arreglo o el valor y haz clic en 'Iniciar Búsqueda'.";
        startBtn.disabled = false;
        arrayInput.disabled = false;
        valorInput.disabled = false;
    }

    // Eventos
    startBtn.addEventListener("click", iniciarBusqueda);
    resetBtn.addEventListener("click", reset);

    // Inicializar al cargar
    arr = parseAndSortArray(arrayInput.value);
    renderArray();

    // Actualizar si cambia el arreglo
    arrayInput.addEventListener("change", () => {
        arr = parseAndSortArray(arrayInput.value);
        reset();
    });