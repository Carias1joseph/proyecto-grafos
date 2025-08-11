//  Algoritmos 

function busquedaBinaria(arr, valor) {
    let inicio = 0, fin = arr.length - 1;
    while (inicio <= fin) {
        let medio = Math.floor((inicio + fin) / 2);
        if (arr[medio] === valor) return medio;
        if (arr[medio] < valor) inicio = medio + 1;
        else fin = medio - 1;
    }
    return -1;
}
 

function ejecutarBinaria() {
    let arr = document.getElementById("arrayInput").value.split(",").map(Number).sort((a,b) => a-b);
    let valor = Number(document.getElementById("valorInput").value);
    mostrarResultado(busquedaBinaria(arr, valor));
}

// Mostrar resultado en el HTML
function mostrarResultado(resultado) {
    document.getElementById("resultado").textContent =
        resultado !== -1
        ? `Valor encontrado en la posición: ${resultado}`
        : "Valor no encontrado";
}

// Animacion
 
 
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

    // Resaltar celdas: inicio, medio, fin
    function highlight(inicio, medio, fin, found = false) {
        document.querySelectorAll(".cell").forEach((cell, i) => {
            cell.classList.remove("inicio", "medio", "fin", "found");
            if (i === inicio && i !== medio) cell.classList.add("inicio");
            if (i === fin && i !== medio) cell.classList.add("fin");
            if (i === medio) {
                cell.classList.add("medio");
                if (found) cell.classList.add("found");
            }
        });
    }

    // Generar pasos del algoritmo
    function generarPasos(arreglo, valor) {
        const pasos = [];
        let inicio = 0;
        let fin = arreglo.length - 1;

        while (inicio <= fin) {
            const medio = Math.floor((inicio + fin) / 2);
            pasos.push({ inicio, medio, fin, valor: arreglo[medio] });

            if (arreglo[medio] === valor) {
                pasos.push({ inicio, medio, fin, encontrado: true });
                break;
            } else if (arreglo[medio] < valor) {
                inicio = medio + 1;
            } else {
                fin = medio - 1;
            }
        }

        if (!pasos[pasos.length - 1]?.encontrado) {
            pasos.push({ noEncontrado: true });
        }

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
        resultado.textContent = `Buscando ${valor}...`;

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
                highlight(paso.inicio, paso.medio, paso.fin, true);
                resultado.textContent = `¡Valor ${valor} encontrado en la posición ${paso.medio}!`;
                startBtn.disabled = false;
                arrayInput.disabled = false;
                valorInput.disabled = false;
            } else {
                highlight(paso.inicio, paso.medio, paso.fin);
                resultado.textContent = `Medio: arr[${paso.medio}] = ${paso.valor} → ${paso.valor < valor ? 'Buscar a la derecha' : 'Buscar a la izquierda'}`;
            }

            currentStep++;
        }, 1200); // 1.2 segundos por paso
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