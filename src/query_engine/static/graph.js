async function loadGraph() {
    const svg       = d3.select("#kg-svg");
    const container = document.getElementById("graph-container");
    const tooltip   = document.getElementById("node-tooltip");
    const W = container.clientWidth;
    const H = container.clientHeight;

    // Clear previous graph
    svg.selectAll("*").remove();

    // Color map
    const COLOR = {
        Climate_Driver:   "#5DCAA5",
        Climate_Variable: "#378ADD",
        Env_Event:        "#D85A30",
        Ecosystem:        "#639922",
        Species:          "#D4537E",
        Human_Activity:   "#BA7517",
        Geo_Location:     "#7F77DD",
        Policy:           "#888780",
        Unknown:          "#555555"
    };

    // Build legend
    const legend = document.getElementById("legend");
    legend.innerHTML = Object.entries(COLOR)
        .filter(([k]) => k !== "Unknown")
        .map(([k, c]) => `
            <div class="legend-item">
                <div class="legend-dot" style="background:${c}"></div>
                <span>${k.replace(/_/g, " ")}</span>
            </div>`
        ).join("");

    // Fetch graph data
    let data;
    try {
        const res = await fetch("/api/graph");
        data = await res.json();
    } catch(err) {
        container.innerHTML = '<p style="color:#888;padding:2rem;">Error loading graph data.</p>';
        return;
    }

    if (!data.nodes || data.nodes.length === 0) {
        container.innerHTML = '<p style="color:#888;padding:2rem;">No graph data available.</p>';
        return;
    }

    // SVG group for zoom/pan
    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 5])
        .on("zoom", e => g.attr("transform", e.transform));
    svg.call(zoom);

    // Arrow marker
    svg.append("defs").append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#5DCAA5")
        .attr("opacity", 0.5);

    // Build node id lookup
    const nodeById = {};
    data.nodes.forEach(n => nodeById[n.id] = n);

    // Filter edges to only those with valid source and target
    const validEdges = data.edges.filter(
        e => nodeById[e.source] && nodeById[e.target]
    );

    // Force simulation
    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(validEdges)
            .id(d => d.id)
            .distance(90)
            .strength(0.5))
        .force("charge", d3.forceManyBody()
            .strength(-150))
        .force("center", d3.forceCenter(W / 2, H / 2))
        .force("collision", d3.forceCollide()
            .radius(d => nodeRadius(d) + 5));

    // Draw edges
    const link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(validEdges)
        .join("line")
        .attr("stroke", "#5DCAA5")
        .attr("stroke-opacity", 0.2)
        .attr("stroke-width", 1)
        .attr("marker-end", "url(#arrow)");

    // Edge labels (only on hover — too cluttered otherwise)
    const edgeLabel = g.append("g")
        .attr("class", "edge-labels")
        .selectAll("text")
        .data(validEdges)
        .join("text")
        .attr("font-size", 7)
        .attr("fill", "#5DCAA5")
        .attr("opacity", 0)
        .attr("text-anchor", "middle")
        .text(d => d.relation);

    // Draw nodes
    const node = g.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("r", d => nodeRadius(d))
        .attr("fill", d => COLOR[d.entity_type] || COLOR.Unknown)
        .attr("stroke", "#0f1117")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.9)
        .call(drag(simulation))
        .on("mouseover", function(event, d) {
            // Highlight node
            d3.select(this)
                .attr("stroke", "#fff")
                .attr("stroke-width", 2);

            // Show tooltip
            tooltip.style.opacity = 1;
            tooltip.innerHTML = `
                <b>${d.label}</b><br>
                <span style="color:#888">Type:</span> 
                ${(d.entity_type||"Unknown").replace(/_/g," ")}<br>
                <span style="color:#888">PageRank:</span> ${d.pagerank}<br>
                <span style="color:#888">Out-degree:</span> ${d.out_degree}<br>
                <span style="color:#888">Betweenness:</span> ${d.betweenness}
            `;

            // Highlight connected edges
            link.attr("stroke-opacity", e =>
                e.source.id === d.id || e.target.id === d.id ? 0.9 : 0.05
            );
            edgeLabel.attr("opacity", e =>
                e.source.id === d.id || e.target.id === d.id ? 1 : 0
            );
        })
        .on("mousemove", function(event) {
            const rect = container.getBoundingClientRect();
            let x = event.clientX - rect.left + 15;
            let y = event.clientY - rect.top  - 10;
            // Keep tooltip in bounds
            if (x + 220 > W) x = x - 230;
            if (y + 120 > H) y = y - 130;
            tooltip.style.left = x + "px";
            tooltip.style.top  = y + "px";
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("stroke", "#0f1117")
                .attr("stroke-width", 1.5);
            tooltip.style.opacity = 0;
            link.attr("stroke-opacity", 0.2);
            edgeLabel.attr("opacity", 0);
        });

    // Node labels (only for high-pagerank nodes)
    const label = g.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(data.nodes.filter(d => (d.pagerank || 0) > 0.003))
        .join("text")
        .attr("font-size", 9)
        .attr("fill", "#cccccc")
        .attr("text-anchor", "middle")
        .attr("dy", d => nodeRadius(d) + 11)
        .text(d => truncate(d.label, 16))
        .style("pointer-events", "none")
        .style("user-select", "none");

    // Tick function
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        edgeLabel
            .attr("x", d => (d.source.x + d.target.x) / 2)
            .attr("y", d => (d.source.y + d.target.y) / 2);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });

    // ── Helper functions ───────────────────────────────────
    function nodeRadius(d) {
        return 5 + (d.pagerank || 0) * 700;
    }

    function truncate(str, max) {
        return str && str.length > max
            ? str.slice(0, max) + "…"
            : str || "";
    }

    function drag(simulation) {
        return d3.drag()
            .on("start", (event, d) => {
                if (!event.active)
                    simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on("drag", (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", (event, d) => {
                if (!event.active)
                    simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });
    }
}