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

---

## What the Interface Does

### Tab 1 — Query Engine
Type a climate entity and select query type:

| Query | Type | Expected Result |
|-------|------|----------------|
| `coral bleaching` | What causes X? | global warming, ocean temperature, sea surface temperature |
| `deforestation` | What is the impact of X? | 3-hop chain: deforestation → climate change → sea-level rise → coastal wetlands |
| `sea level rise` | What causes X? | storm surge, greenhouse gas, hurricane |
| `climate change` | What is the impact of X? | flooding, coral reef, wildfire, heatwaves |
| `glacier` | What is the impact of X? | sea level rise, coastal areas |

Results show: entity type badge, relation type, confidence score bar, hop count.

### Tab 2 — Knowledge Graph
- Interactive D3.js force-directed graph (top 80 nodes by PageRank)
- Node size = PageRank score
- Node color = entity type (see legend)
- Hover over node = shows type, PageRank, betweenness, out-degree
- Drag nodes to explore | Scroll to zoom | Click-drag to pan

### Tab 3 — Influence Dashboard
Three ranked bar charts:
- **Top Causal Drivers** — by out-degree centrality (expected top: climate change)
- **Most Impacted** — by PageRank (expected top: arctic)
- **Key Intermediaries** — by betweenness centrality (expected top: global, coastal)

---

## Key Files
### Web Application
src/query_engine/app.py          ← Flask backend, graph traversal, API routes
src/query_engine/templates/index.html  ← Frontend HTML
src/query_engine/static/style.css      ← CSS styling
src/query_engine/static/graph.js       ← D3.js graph visualization

### Precomputed Data (no retraining needed)
data/raw/climate_abstracts.csv         ← 601 collected abstracts
data/processed/climate_kg.pkl          ← Knowledge Graph (loads directly)
data/processed/climate_kg.json         ← Knowledge Graph (fallback)
data/processed/climate_triples.csv     ← 4,478 extracted triples
data/processed/climate_train.txt       ← BIO training set (210 sentences)
data/processed/climate_test.txt        ← BIO test set (27 sentences)
data/annotated/term_lists.csv          ← 569 entity terms used for annotation

### Training Notebooks (reproducibility — requires GPU/Colab)
notebooks/01_data_collection.ipynb     ← Semantic Scholar API collection
notebooks/02_preprocessing.ipynb       ← BIO format conversion
notebooks/03_preannotate.ipynb         ← Dictionary pre-annotation
notebooks/scibert_ner_training.ipynb   ← SciBERT NER fine-tuning (Colab+GPU)
notebooks/scibert_re_training.ipynb    ← SciBERT RE fine-tuning (Colab+GPU)
notebooks/knowledge_graph.ipynb        ← KG construction + graph analytics
notebooks/baselines.ipynb              ← Baseline comparisons (Colab)

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

## Notebooks — For Reproducibility Only

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
##  Entity Schema (8 types)
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

##  Relation Schema (7 types)
`causes` | `increases` | `decreases` | `affects` | 
`contributes_to` | `occurs_in` | `mitigates`


---
---

## Full Pipeline — Running End-to-End (For Verification)

> This section documents how to reproduce the entire pipeline 
> from scratch. Each step builds on the previous one.
> **Steps 1-3 run locally. Steps 4-5 require Google Colab with GPU.**

---

### STEP 1 — Data Collection
**Notebook:** `notebooks/01_data_collection.ipynb`
**Run on:** Local machine (Jupyter)
**Time:** ~20 minutes

```bash
py -3.11 -m pip install requests pandas langdetect backoff
jupyter notebook notebooks/01_data_collection.ipynb
```

What it does:
- Queries Semantic Scholar API with 15 IPCC-derived keywords
- Cleans and deduplicates abstracts
- Applies language detection (English only)
- Filters by field of study

Output: `data/raw/climate_abstracts.csv` (601 abstracts)

---

### STEP 2 — Preprocessing & BIO Conversion
**Notebook:** `notebooks/02_preprocessing.ipynb`
**Run on:** Local machine (Jupyter)
**Time:** ~5 minutes

```bash
py -3.11 -m pip install pandas scikit-learn
jupyter notebook notebooks/02_preprocessing.ipynb
```

What it does:
- Merges 3 annotator JSON files from Label Studio
- Standardizes inconsistent entity label names
- Converts annotations to BIO format
- Splits into train (80%) / dev (10%) / test (20%)

Input: 
- `data/annotated/mayukha_annotations.json`
- `data/annotated/harshini_annotations.json`  
- `data/annotated/ashley_annotations.json`

Output:
- `data/processed/climate_train.txt` (210 sentences)
- `data/processed/climate_dev.txt` (26 sentences)
- `data/processed/climate_test.txt` (27 sentences)

> **Note:** The 3 annotation JSON files are not in the repo
> (too large). The processed BIO files are already provided.

---

### STEP 3 — Dictionary Pre-annotation
**Notebook:** `notebooks/03_preannotate.ipynb`
**Run on:** Local machine (Jupyter)
**Time:** ~5 minutes

```bash
jupyter notebook notebooks/03_preannotate.ipynb
```

What it does:
- Uses spaCy PhraseMatcher with term_lists.csv
- Automatically pre-annotates all 601 abstracts
- Generates Label Studio compatible JSON

Input: `data/raw/climate_abstracts.csv`, `data/annotated/term_lists.csv`
Output: `data/annotated/preannotated.json`

---

### STEP 4 — SciBERT NER Training
**Notebook:** `notebooks/scibert_ner_training.ipynb`
**Run on:** Google Colab (T4 GPU required)
**Time:** ~45 minutes

Upload to Colab:
- `data/processed/climate_train.txt`
- `data/processed/climate_dev.txt`
- `data/processed/climate_test.txt`

```python
# Cell 1 — Install
!pip install transformers datasets seqeval torch scikit-learn
```

What it does:
- Loads allenai/scibert_scivocab_uncased
- Fine-tunes for token classification (BIO tagging)
- Round 1: trains on 210 gold sentences (5 epochs)
- Generates 1,026 silver labels via model self-labeling
- Round 2: retrains on 1,236 combined sentences (10 epochs)
- Evaluates against SciSpaCy and dictionary baselines

Results:
- SciBERT NER F1 = **0.3382**
- SciSpaCy baseline F1 = 0.0273
- Dictionary baseline F1 = 0.3801

Output: `scibert_ner_climate_v2/` (model folder)

---

### STEP 5 — SciBERT RE Training
**Notebook:** `notebooks/scibert_re_training.ipynb`
**Run on:** Google Colab (T4 GPU required)
**Time:** ~60 minutes

Upload to Colab (same files as Step 4):
- `data/processed/climate_train.txt`
- `data/processed/climate_dev.txt`
- `data/processed/climate_test.txt`

```python
# Cell 1 — Install
!pip install transformers torch scikit-learn pandas seqeval
```

What it does:
- Extracts entity pairs from BIO sentences
- Applies distant supervision to assign relation labels
- Adds [E1]/[/E1]/[E2]/[/E2] markers around entity spans
- Fine-tunes SciBERT as pairwise span classifier
- Trains on 14,000 balanced entity pairs (5 epochs)
- Evaluates against OpenIE rule-based baseline

Results:
- SciBERT RE F1 = **0.4118**
- OpenIE baseline F1 = 0.0217

Output: `scibert_re_climate/` (model folder)

---

### STEP 6 — Knowledge Graph Construction
**Notebook:** `notebooks/knowledge_graph.ipynb`
**Run on:** Local machine (Jupyter)
**Time:** ~50 minutes (NER+RE inference on 601 abstracts)

```bash
py -3.11 -m pip install networkx transformers torch pandas matplotlib pyvis
jupyter notebook notebooks/knowledge_graph.ipynb
```

Requires (from Steps 4 & 5):
- `models/scibert_ner_climate_v2/` (NER model folder)
- `models/scibert_re_climate/` (RE model folder)

What it does:
- Runs NER inference on all 601 abstracts
- Runs RE inference on all entity pairs
- Extracts 4,478 triples with confidence scores
- Builds NetworkX DiGraph
- Computes PageRank, betweenness, degree centrality
- Extracts multi-hop causal pathways
- Saves graph as pkl and JSON

Output:
- `data/processed/climate_triples.csv`
- `data/processed/climate_kg.pkl`
- `data/processed/climate_kg.json`
- `outputs/climate_kg_visualization.png`

---

### STEP 7 — Baseline Comparisons
**Notebook:** `notebooks/baselines.ipynb`
**Run on:** Google Colab
**Time:** ~15 minutes

```python
# Cell 1 — Install
!pip install scispacy seqeval
!pip install https://s3-us-west-2.amazonaws.com/ai2-s2-scispacy/releases/v0.5.4/en_core_sci_md-0.5.4.tar.gz
```

Upload to Colab:
- `data/processed/climate_test.txt`
- `data/annotated/term_lists.csv`

What it does:
- Runs SciSpaCy NER on test set
- Runs Dictionary Matching NER on test set
- Runs OpenIE rule-based RE on test set
- Compares all baselines against our SciBERT models

Results summary:
| Model | F1 |
|-------|----|
| SciSpaCy NER | 0.0273 |
| Dictionary Matching NER | 0.3801 |
| **SciBERT NER** | **0.3382** |
| OpenIE RE | 0.0217 |
| **SciBERT RE** | **0.4118** |

---

### STEP 8 — Run Web Interface
**Script:** `src/query_engine/app.py`
**Run on:** Local machine
**Time:** ~2 minutes startup

```bash
py -3.11 -m pip install flask networkx scipy pandas
py -3.11 src/query_engine/app.py
```

Open: `http://localhost:5000`

---

## Pipeline Summary

| Step | Notebook/Script | Runs On | Output |
|------|----------------|---------|--------|
| 1 | 01_data_collection.ipynb | Local | climate_abstracts.csv |
| 2 | 02_preprocessing.ipynb | Local | BIO train/dev/test files |
| 3 | 03_preannotate.ipynb | Local | preannotated.json |
| 4 | scibert_ner_training.ipynb | Colab GPU | NER model |
| 5 | scibert_re_training.ipynb | Colab GPU | RE model |
| 6 | knowledge_graph.ipynb | Local | climate_kg.pkl + .json |
| 7 | baselines.ipynb | Colab | Evaluation results |
| 8 | src/query_engine/app.py | Local | Web interface |



## LLM Use Statement
Claude (Anthropic) was used as a documentation and coding(Syntax errors and Debugging code errors) assistant throughout implementation. All technical design decisions, model architecture choices, dataset selection, and experimental results were independently developed and validated by us.
