// --- DEFINICIÓN DE calcularKruskal() (reemplaza la función original con animación) ---
function calcularKruskal() {
    // 1. Obtener elementos del DOM
    const edgesInput = document.getElementById("edges");
    const output = document.getElementById("kruskal-output");
    const svg = document.getElementById("graph");
    const resetBtn = document.getElementById("resetBtn");

    //  Validación: asegurarse de que los elementos existen
    if (!edgesInput || !output || !svg || !resetBtn) {
        console.error(" No se encontraron elementos del DOM. Revisa los id.");
        output.textContent = "Error: No se cargaron los elementos correctamente.";
        return;
    }

    let edges = [];
    let nodes = new Set();
    let nodePositions = {};
    let parent = {};
    let animationInterval = null;
    let stepIndex = 0;
    let allSteps = [];

    // 2. Parsear aristas
    try {
        edges = edgesInput.value.trim().split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                const [u, v, wStr] = line.split(",").map(s => s.trim());
                const w = parseInt(wStr, 10);
                if (isNaN(w)) throw new Error(`Peso inválido: ${wStr}`);
                return { u, v, w };
            });
    } catch (err) {
        output.textContent = `❌ Error: ${err.message}`;
        return;
    }

    if (edges.length === 0) {
        output.textContent = "❌ No se encontraron aristas válidas.";
        return;
    }

    // 3. Extraer nodos únicos
    edges.forEach(e => {
        nodes.add(e.u);
        nodes.add(e.v);
    });

    // 4. Deshabilitar botón y limpiar SVG
    const startBtn = document.querySelector('[onclick="calcularKruskal()"]');
    startBtn.disabled = true;
    edgesInput.disabled = true;
    output.textContent = "🚀 Iniciando algoritmo de Kruskal...";

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // 5. Posicionar nodos en círculo
    const nodeList = Array.from(nodes);
    const centerX = 300, centerY = 200;
    const radius = 150;
    nodeList.forEach((node, i) => {
        const angle = (i / nodeList.length) * 2 * Math.PI;
        nodePositions[node] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });

    // 6. Funciones para dibujar
    function drawNode(node) {
        const pos = nodePositions[node];
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", 20);
        circle.setAttribute("class", "node");
        circle.setAttribute("id", `node-${node}`);
        svg.appendChild(circle);

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", pos.x);
        label.setAttribute("y", pos.y + 5);
        label.setAttribute("class", "label");
        label.textContent = node;
        svg.appendChild(label);
    }

    function drawEdge(u, v, weight, className = "", id = "") {
        const posU = nodePositions[u];
        const posV = nodePositions[v];
        const midX = (posU.x + posV.x) / 2;
        const midY = (posU.y + posV.y) / 2;

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", posU.x);
        line.setAttribute("y1", posU.y);
        line.setAttribute("x2", posV.x);
        line.setAttribute("y2", posV.y);
        line.setAttribute("class", "edge " + className);
        line.setAttribute("id", id);
        svg.appendChild(line);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", midX);
        text.setAttribute("y", midY - 10);
        text.setAttribute("class", "weight");
        text.textContent = weight;
        svg.appendChild(text);
    }

    // 7. Dibujar grafo inicial
    nodeList.forEach(node => drawNode(node));
    edges.forEach((e, i) => {
        drawEdge(e.u, e.v, e.w, "", `edge-${i}`);
    });

    // 8. Union-Find
    function find(x) {
        if (parent[x] === x) return x;
        return parent[x] = find(parent[x]);
    }

    function union(a, b) {
        parent[find(a)] = find(b);
    }

    // 9. Generar pasos del algoritmo
    const sortedEdges = [...edges].sort((a, b) => a.w - b.w);
    sortedEdges.forEach(e => {
        parent[e.u] = e.u;
        parent[e.v] = e.v;
    });

    const mst = [];
    allSteps = [];

    for (let e of sortedEdges) {
        const uRoot = find(e.u);
        const vRoot = find(e.v);

        if (uRoot !== vRoot) {
            union(e.u, e.v);
            mst.push(e);
            allSteps.push({ type: "add", edge: e, mst: [...mst] });
        } else {
            allSteps.push({ type: "reject", edge: e, mst: [...mst] });
        }
    }

    // 10. Animación paso a paso
    stepIndex = 0;
    animationInterval = setInterval(() => {
        const paso = allSteps[stepIndex];
        const edgeIndex = edges.findIndex(e =>
            e.u === paso.edge.u &&
            e.v === paso.edge.v &&
            e.w === paso.edge.w
        );
        const edgeEl = document.getElementById(`edge-${edgeIndex}`);

        if (paso.type === "add") {
            if (edgeEl) edgeEl.setAttribute("class", "edge mst");
            output.innerHTML = `✅ <strong>${paso.edge.u}–${paso.edge.v}</strong> añadido al MST.`;
        } else if (paso.type === "reject") {
            if (edgeEl) edgeEl.setAttribute("class", "edge rejected");
            output.innerHTML = `❌ <strong>${paso.edge.u}–${paso.edge.v}</strong> rechazado (formaría ciclo).`;
        }

        stepIndex++;

        if (stepIndex >= allSteps.length) {
            clearInterval(animationInterval);
            const mstText = "MST: " + mst.map(e => `${e.u}-${e.v} (${e.w})`).join(", ");
            output.innerHTML = `<strong style="color:#27ae60;">${mstText}</strong>`;
            startBtn.disabled = false;
            edgesInput.disabled = false;
        }
    }, 1500);

    // 11. Botón de reinicio
    resetBtn.onclick = function () {
        if (animationInterval) clearInterval(animationInterval);
        edgesInput.disabled = false;
        startBtn.disabled = false;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        output.textContent = "Ingresa las aristas y haz clic en 'Iniciar Kruskal'.";
    };
}