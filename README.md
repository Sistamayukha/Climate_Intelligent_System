#Climate Intelligence System

An end-to-end NLP pipeline that automatically extracts structured 
knowledge from scientific climate literature and organizes it into 
a queryable Knowledge Graph with an interactive web interface.

---

## Team
| Name | ID | Role |
|------|----|------|
| Harshini Domala | YE32653 | Data collection, preprocessing, annotation |
| Ashley Biscoe | PX70413 | NER and RE model training |
| Mayukha Sista | FE67016 | Knowledge Graph, analytics, query engine, web interface |

---

## Quick Start — Running the Demo

> **The web interface runs directly from precomputed files already 
> in this repository. You do NOT need to retrain any models or 
> rerun any notebooks.**

### Prerequisites
- Python 3.11 — download from https://www.python.org/downloads/release/python-3119/
  - During install: check "Add Python to PATH"
- Git

### Step 1 — Clone the repository
```bash
git clone https://github.com/Sistamayukha/Climate_Intelligent_System.git
cd Climate_Intelligent_System
```

### Step 2 — Install dependencies
```bash
py -3.11 -m pip install flask networkx scipy pandas
```

### Step 3 — Run the web interface
```bash
py -3.11 src/query_engine/app.py
```

You should see:
Loading Knowledge Graph...
Graph loaded: 1125 nodes, 3546 edges
Computing graph analytics...
Analytics ready!

Running on http://127.0.0.1:5000
### Step 4 — Open in browser
### Step 5 — Try these example queries

**Query Engine tab:**
- Type `coral bleaching` → Select "What causes X?" → Click Search
- Type `deforestation` → Select "What is the impact of X?" → Click Search
- Type `climate change` → Select "What is the impact of X?" → Click Search
- Type `sea level rise` → Select "What causes X?" → Click Search

**Knowledge Graph tab:**
- Click to explore the interactive force-directed graph
- Hover over nodes to see entity type, PageRank, and centrality scores
- Drag nodes to explore connections
- Zoom in/out with mouse wheel

**Influence Dashboard tab:**
- View top causal drivers by out-degree centrality
- View most impacted entities by PageRank
- View key intermediaries by betweenness centrality

---
---

##System Results

### NER Evaluation
| Model | Precision | Recall | F1 |
|-------|-----------|--------|-----|
| SciSpaCy (baseline) | 0.0175 | 0.0624 | 0.0273 |
| Dictionary Matching (baseline) | 0.5753 | 0.2838 | 0.3801 |
| **Our SciBERT NER** | **0.3710** | **0.3108** | **0.3382** |

### RE Evaluation
| Model | F1 |
|-------|----|
| OpenIE Rule-based (baseline) | 0.0217 |
| **Our SciBERT RE** | **0.4118** |

### Knowledge Graph
| Metric | Value |
|--------|-------|
| Nodes | 1,125 |
| Edges | 3,546 |
| Triples extracted | 4,478 |
| Top causal driver | climate change |
| Most impacted entity | arctic |

---

## System Architecture
601 Scientific Abstracts (Semantic Scholar API) 
			|
			v
Text Preprocessing & Cleaning 
			|
			v
NER Model (Fine-tuned SciBERT)
			|
			v
Extracts 8 climate entity types 
			|
			v
RE Model (Fine-tuned SciBERT)
			|
			v
Extracts 7 relation types
			|
			v
4,478 Triples extracted 
			|
			v
Knowledge Graph (NetworkX DiGraph) 1,125 nodes | 3,546 edges 
			|
			v
Graph Analytics (PageRank, Betweenness, Degree Centrality)
			|
			v
Query Engine + Web Interface (Flask + D3.js) 
---

## 📓 Notebooks — For Reproducibility Only

> These notebooks are provided for reproducibility. 
> You do NOT need to run them to use the demo.
> NER and RE training require Google Colab with GPU.

| Notebook | Purpose | Runtime |
|----------|---------|---------|
| 01_data_collection.ipynb | Collect abstracts from Semantic Scholar | Local |
| 02_preprocessing.ipynb | Convert to BIO format, train/dev/test split | Local |
| 03_preannotate.ipynb | Dictionary pre-annotation for Label Studio | Local |
| scibert_ner_training.ipynb | Fine-tune SciBERT for NER | Google Colab (GPU) |
| scibert_re_training.ipynb | Fine-tune SciBERT for RE | Google Colab (GPU) |
| knowledge_graph.ipynb | Build KG, compute analytics, extract triples | Local |
| baselines.ipynb | Run baseline comparisons | Google Colab |

---
---

## 🔗 Entity Schema (8 types)
| Entity | Examples |
|--------|---------|
| Climate_Driver | CO₂, methane, greenhouse gases |
| Climate_Variable | temperature, sea level, precipitation |
| Env_Event | drought, wildfire, coral bleaching |
| Ecosystem | coral reef, permafrost, Amazon basin |
| Species | polar bear, plankton, coral |
| Human_Activity | deforestation, fossil fuel burning |
| Geo_Location | Arctic, Bangladesh, Pacific Ocean |
| Policy | Paris Agreement, carbon tax |

## 🔗 Relation Schema (7 types)
`causes` | `increases` | `decreases` | `affects` | 
`contributes_to` | `occurs_in` | `mitigates`


---

## LLM Use Statement
Claude (Anthropic) was used as a documentation and coding(Syntax errors and Debugging code errors) assistant throughout implementation. All technical design decisions, model architecture choices, dataset selection, and experimental results were independently developed and validated by us.
