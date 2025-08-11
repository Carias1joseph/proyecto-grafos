// --- Reemplazo de calcularBellmanFord() con animación ---
function calcularBellmanFord() {
    const edgesInput = document.getElementById("edges-bf");
    const startInput = document.getElementById("start-bf");
    const output = document.getElementById("bf-output");
    const tableDiv = document.getElementById("distances-table");
    const svg = document.getElementById("graph-bf");
    const resetBtn = document.getElementById("resetBtnBF");

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
        output.textContent = "No se encontraron aristas.";
        return;
    }

    const start = startInput.value.trim();
    if (!start) {
        output.textContent = "Por favor, ingresa un nodo inicial.";
        return;
    }

    vertices = [...new Set(edges.flatMap(e => [e.u, e.v]))];
    if (!vertices.includes(start)) {
        output.textContent = `El nodo inicial "${start}" no existe en el grafo.`;
        return;
    }

    // Deshabilitar botón
    const startBtn = document.querySelector('[onclick="calcularBellmanFord()"]');
    startBtn.disabled = true;
    edgesInput.disabled = true;
    startInput.disabled = true;
    output.textContent = "🚀 Ejecutando Bellman-Ford...";

    // Limpiar SVG
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // Añadir flecha para aristas dirigidas
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    arrow.setAttribute("id", "arrow");
    arrow.setAttribute("viewBox", "0 -5 10 10");
    arrow.setAttribute("refX", "10");
    arrow.setAttribute("refY", "0");
    arrow.setAttribute("markerWidth", "6");
    arrow.setAttribute("markerHeight", "6");
    arrow.setAttribute("orient", "auto");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M0,-5 L10,0 L0,5");
    path.setAttribute("fill", "#555");
    arrow.appendChild(path);
    defs.appendChild(arrow);
    svg.appendChild(defs);

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
    function drawNode(node, style = "") {
        const pos = nodePositions[node];
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", 20);
        circle.setAttribute("class", "node-bf " + style);
        circle.setAttribute("id", `node-bf-${node}`);
        svg.appendChild(circle);

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", pos.x);
        label.setAttribute("y", pos.y + 5);
        label.setAttribute("class", "label-bf");
        label.textContent = node;
        svg.appendChild(label);
    }

    // Dibujar arista dirigida
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
        line.setAttribute("class", "edge-bf " + className);
        line.setAttribute("id", id);
        svg.appendChild(line);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", midX);
        text.setAttribute("y", midY - 10);
        text.setAttribute("class", "weight-bf");
        text.textContent = weight;
        svg.appendChild(text);
    }

    // Dibujar grafo
    vertices.forEach(node => drawNode(node, node === start ? "start" : ""));
    edges.forEach((e, i) => drawEdge(e.u, e.v, e.w, "", `edge-bf-${i}`));

    // Inicializar distancias
    let dist = {};
    vertices.forEach(v => dist[v] = Infinity);
    dist[start] = 0;

    // Generar pasos
    allSteps = [];

    for (let i = 0; i < vertices.length - 1; i++) {
        for (let e of edges) {
            if (dist[e.u] !== Infinity && dist[e.u] + e.w < dist[e.v]) {
                const old = dist[e.v];
                const nuev = dist[e.u] + e.w;
                allSteps.push({
                    type: "relax",
                    edge: e,
                    from: dist[e.u],
                    weight: e.w,
                    oldDist: old,
                    newDist: nuev,
                    dist: { ...dist, [e.v]: nuev }
                });
                dist[e.v] = nuev;
            } else {
                allSteps.push({
                    type: "skip",
                    edge: e,
                    dist: { ...dist }
                });
            }
        }
    }

    // Mostrar tabla de distancias
    function updateTable(distanceObj) {
        let html = "<table style='margin: 10px auto; border-collapse: collapse;'>";
        html += "<tr><th style='border:1px solid #ccc; padding:8px;'>Nodo</th>";
        vertices.forEach(v => {
            html += `<th style='border:1px solid #ccc; padding:8px;'>${v}</th>`;
        });
        html += "</tr><tr><td style='border:1px solid #ccc; padding:8px;'>Dist</td>";
        vertices.forEach(v => {
            const color = v === start ? "#27ae60" : distanceObj[v] === Infinity ? "#e74c3c" : "#3498db";
            const val = distanceObj[v] === Infinity ? "∞" : distanceObj[v];
            html += `<td style='border:1px solid #ccc; padding:8px; color:${color}; font-weight:bold;'>${val}</td>`;
        });
        html += "</tr></table>";
        tableDiv.innerHTML = html;
    }

    // Iniciar animación
    stepIndex = 0;
    updateTable(dist); // Estado inicial

    animationInterval = setInterval(() => {
        const paso = allSteps[stepIndex];

        // Resaltar arista
        document.querySelectorAll(".edge-bf").forEach(el => {
            el.setAttribute("class", "edge-bf");
        });
        const edgeEl = document.getElementById(`edge-bf-${edges.findIndex(e => e.u === paso.edge.u && e.v === paso.edge.v && e.w === paso.edge.w)}`);
        if (edgeEl) edgeEl.setAttribute("class", "edge-bf current");

        // Resaltar nodos
        document.querySelectorAll(".node-bf").forEach(el => {
            const nodeId = el.id.replace("node-bf-", "");
            if (nodeId === paso.edge.u) el.setAttribute("class", "node-bf updated");
            else if (nodeId === paso.edge.v && paso.type === "relax") el.setAttribute("class", "node-bf updated");
            else if (nodeId === start) el.setAttribute("class", "node-bf start");
            else el.setAttribute("class", "node-bf");
        });

        if (paso.type === "relax") {
            output.innerHTML = `✅ Relajando arista <strong>${paso.edge.u}→${paso.edge.v}</strong><br>dist[${paso.edge.v}] = min(${paso.oldDist}, ${paso.from} + ${paso.weight}) = <strong>${paso.newDist}</strong>`;
        } else {
            output.innerHTML = `⏩ Saltando arista <strong>${paso.edge.u}→${paso.edge.v}</strong><br>No mejora la distancia.`;
        }

        // Actualizar tabla
        updateTable(paso.dist);

        stepIndex++;

        if (stepIndex >= allSteps.length) {
            clearInterval(animationInterval);
            const final = Object.entries(paso.dist).map(([k, v]) => `${k}:${v === Infinity ? '∞' : v}`).join(", ");
            output.innerHTML = `<strong style="color:#27ae60;">Distancias finales: ${final}</strong>`;
            startBtn.disabled = false;
            edgesInput.disabled = false;
            startInput.disabled = false;
        }
    }, 1300);

    // Botón de reinicio
    resetBtn.onclick = function () {
        if (animationInterval) clearInterval(animationInterval);
        edgesInput.disabled = false;
        startInput.disabled = false;
        startBtn.disabled = false;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        tableDiv.innerHTML = "";
        output.textContent = "Ingresa los datos y haz clic en 'Calcular Distancias'.";
    };
}