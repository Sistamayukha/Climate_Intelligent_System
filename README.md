

## Climate Intelligence System

An end-to-end NLP pipeline that automatically extracts structured knowledge from scientific climate literature and organizes it into a queryable Knowledge Graph with an interactive web interface.

##Team
| Name | ID | Role |
| Harshini Domala | YE32653 | Data collection, preprocessing, annotation |
| Ashley Biscoe | PX70413 | NER and RE model training |
| Mayukha Sista | FE67016 | Knowledge Graph, analytics, query engine, web interface |

---

## Problem Statement
Scientific climate literature contains thousands of cause-effect  relationships buried in unstructured text. The Climate Intelligence System automates extraction of these relationships, transforming raw abstracts into a structured reasoning engine that answers natural language queries like "What causes coral bleaching?"

---

##  System Architecture
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

## Results

### NER Results
| Model | Precision | Recall | F1 |
|-------|-----------|--------|-----|
| SciSpaCy (baseline) | 0.0175 | 0.0624 | 0.0273 |
| Dictionary Matching (baseline) | 0.5753 | 0.2838 | 0.3801 |
| **Our SciBERT NER** | **0.3710** | **0.3108** | **0.3382** |

### Per-Entity NER F1
| Entity | F1 |
|--------|-----|
| Geo_Location | 0.49 |
| Human_Activity | 0.46 |
| Env_Event | 0.42 |
| Ecosystem | 0.38 |
| Climate_Driver | 0.25 |
| Species | 0.22 |
| Climate_Variable | 0.14 |
| Policy | 0.04 |

### RE Results
| Model | F1 |
|-------|----|
| OpenIE Rule-based (baseline) | 0.0217 |
| **Our SciBERT RE** | **0.4118** |

### Per-Relation RE F1
| Relation | F1 |
|----------|----|
| occurs_in | 0.59 |
| affects | 0.56 |
| causes | 0.52 |
| mitigates | 0.50 |
| increases | 0.38 |
| contributes_to | 0.34 |
| decreases | 0.00 |

### Knowledge Graph Stats
| Metric | Value |
|--------|-------|
| Total nodes | 1,125 |
| Total edges | 3,546 |
| Total triples | 4,478 |
| Top causal driver | climate change |
| Most impacted entity | arctic |
| Graph density | 0.0028 |

---

## Entity Schema (8 types)
| Entity Type | Examples |
|-------------|---------|
| Climate_Driver | CO₂, methane, greenhouse gases |
| Climate_Variable | temperature, sea level, precipitation |
| Env_Event | drought, wildfire, coral bleaching |
| Ecosystem | coral reef, permafrost, Amazon basin |
| Species | polar bear, plankton, coral |
| Human_Activity | deforestation, fossil fuel burning |
| Geo_Location | Arctic, Bangladesh, Pacific Ocean |
| Policy | Paris Agreement, carbon tax |

## Relation Schema (7 types)
`causes` | `increases` | `decreases` | `affects` | 
`contributes_to` | `occurs_in` | `mitigates`

---

##  How to Run

### 1. Install dependencies
```bash
pip install transformers torch networkx flask pandas 
pip install scikit-learn seqeval pyvis matplotlib
```

### 2. Data Collection
```bash
jupyter notebook notebooks/Climate_Data_Abstraction.ipynb
```

### 3. Annotation Processing
```bash
jupyter notebook notebooks/annotation_processing.ipynb
```

### 4. NER Training
```bash
jupyter notebook notebooks/scibert_ner_training.ipynb
```

### 5. RE Training
```bash
jupyter notebook notebooks/scibert_re_training.ipynb
```

### 6. Knowledge Graph Construction
```bash
jupyter notebook notebooks/knowledge_graph.ipynb
```

### 7. Run Web Interface
```bash
py -3.11 src/query_engine/app.py
```
Open browser at `http://localhost:5000`

---

## Example Queries
- "What causes coral bleaching?" 
- "What is the impact of deforestation?"
- "What causes sea level rise?"
- "What is the impact of climate change?"

---

## LLM Use Statement
Claude (Anthropic) was used as a documentation and partial coding assistant(Syntax errors and implementation errors) and also for proper structure and architecture of the folder and documents throughout implementation. All technical design decisions, model architecture choices, dataset selection, and experimental results were independently developed and validated by us.

