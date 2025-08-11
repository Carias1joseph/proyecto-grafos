// Algoritmos
function busquedaLineal(arr, valor) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === valor) return i;
    }
    return -1;
}



// Funciones para cada página

function ejecutarLineal() {
    let arr = document.getElementById("arrayInput").value.split(",").map(Number);
    let valor = Number(document.getElementById("valorInput").value);
    mostrarResultado(busquedaLineal(arr, valor));
}


// Mostrar resultado en el HTML
function mostrarResultado(resultado) {
    document.getElementById("resultado").textContent =
        resultado !== -1
        ? `Valor encontrado en la posición: ${resultado}`
        : "Valor no encontrado";
}





// Animaciones

// Animacion Busqueda Lineal

const arrayInput = document.getElementById("arrayInput");
    const valorInput = document.getElementById("valorInput");
    const startBtn = document.getElementById("startBtn");
    const resetBtn = document.getElementById("resetBtn");
    const arrayContainer = document.getElementById("array");
    const resultado = document.getElementById("resultado");

    let arr = [];
    let animationInterval = null;

    // Parsear el arreglo (admite números y texto)
    function parseArray(input) {
        return input
            .split(',')
            .map(item => item.trim())
            .filter(item => item !== '')
            .map(item => {
                const num = parseInt(item, 10);
                return isNaN(num) ? item : num;
            });
    }

    // Renderizar el arreglo visualmente
    function renderArray() {
        arrayContainer.innerHTML = "";
        arr.forEach((value, index) => {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.id = `cell-${index}`;
            cell.textContent = value;
            arrayContainer.appendChild(cell);
        });
    }

    // Iniciar animación de búsqueda lineal
    function iniciarBusqueda() {
        const valorStr = valorInput.value.trim();
        if (!valorStr) {
            resultado.textContent = "Por favor, ingresa un valor a buscar.";
            return;
        }

        const searchValue = isNaN(valorStr) ? valorStr : parseInt(valorStr, 10);
        startBtn.disabled = true;
        arrayInput.disabled = true;
        valorInput.disabled = true;
        resultado.textContent = `Buscando "${searchValue}"...`;

        // Limpiar estilos previos
        document.querySelectorAll(".cell").forEach(el => {
            el.classList.remove("current", "found");
        });

        let i = 0;
        animationInterval = setInterval(() => {
            // Quitar resaltado anterior
            if (i > 0) {
                const prevCell = document.getElementById(`cell-${i-1}`);
                if (prevCell) prevCell.classList.remove("current");
            }

            if (i >= arr.length) {
                clearInterval(animationInterval);
                resultado.textContent = `Valor "${searchValue}" no encontrado.`;
                startBtn.disabled = false;
                arrayInput.disabled = false;
                valorInput.disabled = false;
                return;
            }

            const cell = document.getElementById(`cell-${i}`);
            cell.classList.add("current");
            resultado.textContent = `Comparando "${arr[i]}" con "${searchValue}"...`;

            if (arr[i] === searchValue) {
                clearInterval(animationInterval);
                cell.classList.remove("current");
                cell.classList.add("found");
                resultado.textContent = `¡Valor "${searchValue}" encontrado en la posición ${i}!`;
                startBtn.disabled = false;
                arrayInput.disabled = false;
                valorInput.disabled = false;
            } else {
                i++;
            }
        }, 1000); // 1 segundo por paso
    }

    // Reiniciar
    function reset() {
        if (animationInterval) clearInterval(animationInterval);
        arr = parseArray(arrayInput.value);
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
    arr = parseArray(arrayInput.value);
    renderArray();


    // actualizar visualización
    arrayInput.addEventListener("change", () => {
        arr = parseArray(arrayInput.value);
        reset();
    });



