from flask import Flask, render_template, request, jsonify
import pickle
import json
import networkx as nx
import os
from collections import defaultdict

app = Flask(__name__)

# ── Paths (relative to this file — works on any computer) ───
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)
)))
GRAPH_PATH = os.path.join(BASE_DIR, "data", "processed", "climate_kg.pkl")
JSON_PATH  = os.path.join(BASE_DIR, "data", "processed", "climate_kg.json")

print(f"Base directory: {BASE_DIR}")
print(f"Looking for graph at: {GRAPH_PATH}")

# ── Load graph ───────────────────────────────────────────────
print("Loading Knowledge Graph...")

with open(JSON_PATH, "r") as f:
    graph_json = json.load(f)

if os.path.exists(GRAPH_PATH):
    with open(GRAPH_PATH, "rb") as f:
        G = pickle.load(f)
    print("Loaded from pickle!")
else:
    print("PKL not found — rebuilding from JSON...")
    G = nx.DiGraph()
    for node in graph_json["nodes"]:
        G.add_node(node["id"],
                   entity_type=node.get("entity_type", "Unknown"),
                   mention_count=node.get("mention_count", 0),
                   pagerank=node.get("pagerank", 0),
                   betweenness_centrality=node.get("betweenness", 0),
                   out_degree_centrality=node.get("out_degree", 0))
    for edge in graph_json["edges"]:
        G.add_edge(edge["source"], edge["target"],
                   relation=edge.get("relation", ""),
                   weight=edge.get("weight", 0.5),
                   count=edge.get("count", 1))
    print("Graph rebuilt from JSON!")

print(f"Graph loaded: {G.number_of_nodes()} nodes, "
      f"{G.number_of_edges()} edges")

# ── Analytics ────────────────────────────────────────────────
print("Computing graph analytics...")
pagerank    = nx.pagerank(G, alpha=0.85)
betweenness = nx.betweenness_centrality(G)
out_degree  = nx.out_degree_centrality(G)
print("Analytics ready!")

CAUSAL_RELATIONS = ["causes", "increases", "contributes_to", "affects"]

# ── Helper functions ─────────────────────────────────────────
def find_node(entity):
    entity = entity.lower().strip()
    if entity in G:
        return entity
    matches = [n for n in G.nodes() if entity in n.lower()]
    return matches[0] if matches else None


def query_causes(entity, max_hops=2):
    node = find_node(entity)
    if not node:
        return []
    results = []
    # 1-hop
    for pre in G.predecessors(node):
        e = G.get_edge_data(pre, node)
        if e and e["relation"] in CAUSAL_RELATIONS:
            results.append({
                "cause": pre,
                "cause_type": G.nodes[pre].get("entity_type", "Unknown"),
                "relation": e["relation"],
                "confidence": round(e["weight"], 3),
                "hops": 1
            })
    # 2-hop
    if max_hops >= 2:
        for pre in list(G.predecessors(node)):
            for pre2 in G.predecessors(pre):
                e1 = G.get_edge_data(pre2, pre)
                e2 = G.get_edge_data(pre, node)
                if (e1 and e2 and
                        e1["relation"] in CAUSAL_RELATIONS and
                        e2["relation"] in CAUSAL_RELATIONS):
                    results.append({
                        "cause": f"{pre2} → {pre}",
                        "cause_type": G.nodes[pre2].get(
                            "entity_type", "Unknown"),
                        "relation": f"{e1['relation']} → {e2['relation']}",
                        "confidence": round(
                            (e1["weight"] + e2["weight"]) / 2, 3),
                        "hops": 2
                    })
    results.sort(key=lambda x: -x["confidence"])
    return results[:10]


def query_impacts(entity, max_hops=3):
    node = find_node(entity)
    if not node:
        return []
    impacts = []
    visited = {node}
    queue   = [(node, 0, [])]
    while queue:
        cur, hops, path = queue.pop(0)
        if hops >= max_hops:
            continue
        for suc in G.successors(cur):
            e = G.get_edge_data(cur, suc)
            if (e and e["relation"] in CAUSAL_RELATIONS
                    and suc not in visited):
                visited.add(suc)
                new_path = path + [(cur, e["relation"], suc)]
                impacts.append({
                    "impact": suc,
                    "impact_type": G.nodes[suc].get(
                        "entity_type", "Unknown"),
                    "pathway": [
                        {"from": p[0], "relation": p[1], "to": p[2]}
                        for p in new_path],
                    "hops": hops + 1,
                    "confidence": round(e["weight"], 3)
                })
                queue.append((suc, hops + 1, new_path))
    impacts.sort(key=lambda x: (-x["hops"], -x["confidence"]))
    return impacts[:10]


def get_influence_rankings():
    top_drivers  = sorted(out_degree.items(),
                          key=lambda x: x[1], reverse=True)[:10]
    top_impacted = sorted(pagerank.items(),
                          key=lambda x: x[1], reverse=True)[:10]
    top_between  = sorted(betweenness.items(),
                          key=lambda x: x[1], reverse=True)[:10]
    return {
        "drivers": [
            {"name": n, "score": round(s, 4),
             "type": G.nodes[n].get("entity_type", "Unknown")}
            for n, s in top_drivers],
        "impacted": [
            {"name": n, "score": round(s, 4),
             "type": G.nodes[n].get("entity_type", "Unknown")}
            for n, s in top_impacted],
        "between": [
            {"name": n, "score": round(s, 4),
             "type": G.nodes[n].get("entity_type", "Unknown")}
            for n, s in top_between]
    }


# ── Routes ───────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/query", methods=["POST"])
def api_query():
    data       = request.get_json()
    query_text = data.get("query", "").lower()
    query_type = data.get("type", "causes")

    for phrase in ["what causes", "cause of", "causes of",
                   "what happens if", "impact of", "effects of"]:
        query_text = query_text.replace(phrase, "")
    entity = query_text.strip().rstrip("?").replace(
        "increases", "").strip()

    if query_type == "causes":
        results = query_causes(entity)
        return jsonify({"type": "causes", "entity": entity,
                        "results": results})
    else:
        results = query_impacts(entity)
        return jsonify({"type": "impacts", "entity": entity,
                        "results": results})


@app.route("/api/graph")
def api_graph():
    top_nodes = sorted(pagerank.items(),
                       key=lambda x: x[1], reverse=True)[:80]
    top_names = {n[0] for n in top_nodes}
    nodes = [n for n in graph_json["nodes"] if n["id"] in top_names]
    edges = [e for e in graph_json["edges"]
             if e["source"] in top_names
             and e["target"] in top_names]
    return jsonify({"nodes": nodes, "edges": edges})


@app.route("/api/dashboard")
def api_dashboard():
    return jsonify(get_influence_rankings())


if __name__ == "__main__":
    app.run(debug=True, port=5000)