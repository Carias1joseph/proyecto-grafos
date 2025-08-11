// --- Reemplazo de calcularPrim() con animación visual ---
function calcularPrim() {
    const edgesInput = document.getElementById("edges-prim");
    const output = document.getElementById("prim-output");
    const svg = document.getElementById("graph-prim");
    const resetBtn = document.getElementById("resetBtnPrim");

    let edges = [];
    let vertices = [];
    let nodePositions = {};
    let animationInterval = null;
    let stepIndex = 0;
    let allSteps = [];

    // --- Parsear aristas ---
    try {
        edges = edgesInput.value.trim().split("\n")
            .map(line => line.trim())
            .filter(line => line)
            .map(line => {
                const [u, v, wStr] = line.split(",").map(s => s.trim());
                const w = parseInt(wStr, 10);
                if (isNaN(w)) throw new Error(`Peso inválido: ${wStr}`);
                return { u, v, w };
            });
    } catch (err) {
        output.textContent = `Error: ${err.message}`;
        return;
    }

    if (edges.length === 0) {
        output.textContent = "No se encontraron aristas válidas.";
        return;
    }

    // Obtener vértices únicos
    vertices = [...new Set(edges.flatMap(e => [e.u, e.v]))];
    if (vertices.length === 0) {
        output.textContent = "No se encontraron vértices.";
        return;
    }

    // Deshabilitar botón
    const startBtn = document.querySelector('[onclick="calcularPrim()"]');
    startBtn.disabled = true;
    edgesInput.disabled = true;
    output.textContent = "🚀 Ejecutando Algoritmo de Prim...";

    // Limpiar SVG
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // Posicionar nodos en círculo
    const centerX = 300, centerY = 200;
    const radius = 150;
    vertices.forEach((node, i) => {
        const angle = (i / vertices.length) * 2 * Math.PI;
        nodePositions[node] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });

    // Dibujar nodo
    function drawNode(node, visited = false) {
        const pos = nodePositions[node];
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", 20);
        circle.setAttribute("class", "node-prim" + (visited ? " visited" : ""));
        circle.setAttribute("id", `node-prim-${node}`);
        svg.appendChild(circle);

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", pos.x);
        label.setAttribute("y", pos.y + 5);
        label.setAttribute("class", "label-prim");
        label.textContent = node;
        svg.appendChild(label);
    }

    // Dibujar arista
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
        line.setAttribute("class", "edge-prim " + className);
        line.setAttribute("id", id);
        svg.appendChild(line);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", midX);
        text.setAttribute("y", midY - 10);
        text.setAttribute("class", "weight-prim");
        text.textContent = weight;
        svg.appendChild(text);
    }

    // Dibujar grafo inicial
    vertices.forEach(node => drawNode(node, false));
    edges.forEach((e, i) => {
        drawEdge(e.u, e.v, e.w, "", `edge-prim-${i}`);
    });

    // Simular algoritmo paso a paso
    let visited = new Set([vertices[0]]); // Nodo inicial
    let mst = [];
    allSteps = [];

    // Dibujar nodo inicial como visitado
    document.getElementById(`node-prim-${vertices[0]}`).setAttribute("class", "node-prim visited");

    while (visited.size < vertices.length) {
        // Aristas candidatas: conectan visitado con no visitado
        let possibleEdges = edges.filter(e =>
            (visited.has(e.u) && !visited.has(e.v)) ||
            (visited.has(e.v) && !visited.has(e.u))
        );

        if (possibleEdges.length === 0) break;

        // Encontrar la de menor peso
        let minEdge = possibleEdges.reduce((a, b) => a.w < b.w ? a : b);
        mst.push(minEdge);

        // Determinar qué nodo es el nuevo
        let newVertex = !visited.has(minEdge.u) ? minEdge.u : minEdge.v;
        visited.add(newVertex);

        allSteps.push({
            edge: minEdge,
            newVertex,
            visited: new Set(visited),
            mst: [...mst]
        });
    }

    // Animación paso a paso
    stepIndex = 0;
    animationInterval = setInterval(() => {
        const paso = allSteps[stepIndex];

        // Resaltar arista actual
        const edgeIndex = edges.findIndex(e =>
            e.u === paso.edge.u && e.v === paso.edge.v && e.w === paso.edge.w
        );
        const edgeEl = document.getElementById(`edge-prim-${edgeIndex}`);
        if (edgeEl) {
            edgeEl.setAttribute("class", "edge-prim current");
            setTimeout(() => {
                if (edgeEl) edgeEl.setAttribute("class", "edge-prim mst");
            }, 500);
        }

        // Resaltar nuevo nodo
        const nodeEl = document.getElementById(`node-prim-${paso.newVertex}`);
        if (nodeEl) nodeEl.setAttribute("class", "node-prim visited");

        output.innerHTML = `✅ Añadido: <strong>${paso.edge.u}–${paso.edge.v}</strong> (peso ${paso.edge.w})<br>Nodo ${paso.newVertex} marcado como visitado.`;

        stepIndex++;

        if (stepIndex >= allSteps.length) {
            clearInterval(animationInterval);
            const mstText = "MST: " + mst.map(e => `${e.u}-${e.v} (${e.w})`).join(", ");
            output.innerHTML = `<strong style="color:#27ae60;">${mstText}</strong>`;
            startBtn.disabled = false;
            edgesInput.disabled = false;
        }
    }, 1500);

    // Botón de reinicio
    resetBtn.onclick = function () {
        if (animationInterval) clearInterval(animationInterval);
        edgesInput.disabled = false;
        startBtn.disabled = false;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        output.textContent = "Ingresa las aristas y haz clic en 'Calcular MST'.";
    };
}