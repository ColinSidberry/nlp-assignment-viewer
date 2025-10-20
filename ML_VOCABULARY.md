# ML Pipeline Controlled Vocabulary

This document defines the standardized vocabulary for ML pipeline stages and substages across all NLP assignments.

## Purpose

- **Consistency:** Ensure all assignments use the same terminology for similar concepts
- **Comparability:** Enable cross-assignment comparisons and insights
- **Reusability:** Use general terms that apply across different ML tasks

## Rules

1. Use general, reusable terms (e.g., "Smoothing" not "Q2 Laplace Smoothing")
2. Remove assignment-specific markers (Q1, Q2, etc.) from substage names
3. Check this vocabulary before adding new substages
4. If a new concept doesn't fit existing terms, add it here first

---

## 5 Core Stages

All assignments map to these 5 stages:

1. **Data Prep** - Loading, cleaning, and preprocessing data
2. **Feature Extraction** - Transforming raw data into features
3. **Model Training** - Building and training the model
4. **Evaluation & Fine-tuning** - Assessing performance and optimization
5. **Deployment & Inference** - Using the model on new data

---

## Substage Vocabulary

### Stage 1: Data Prep

| Substage | Definition | Example Context |
|----------|------------|----------------|
| **Corpus Loading** | Loading text data from files | Reading Shakespeare text, loading sentence corpora |
| **Cleaning** | Removing unwanted characters, normalizing text | Removing punctuation, lowercasing |
| **Tokenization** | Splitting text into tokens (words, subwords, etc.) | Word-level tokenization, sentence splitting |
| **Vocabulary Building** | Creating the set of unique tokens | Extracting unique words, building word-to-index mappings |
| **Data Splitting** | Dividing data into train/validation/test sets | 80/10/10 split |
| **Normalization** | Scaling or standardizing features | Min-max scaling, z-score normalization |

### Stage 2: Feature Extraction

| Substage | Definition | Example Context |
|----------|------------|----------------|
| **N-gram Extraction** | Extracting sequences of n consecutive tokens | Bigrams, trigrams |
| **Count Statistics** | Computing frequency counts of features | Word frequencies, n-gram counts |
| **Vectorization** | Converting tokens to numerical representations | One-hot encoding, TF-IDF |
| **Embedding** | Creating dense vector representations | Word2Vec, GloVe embeddings |
| **Context Windows** | Defining fixed-size context around target words | Skip-gram windows, CBOW contexts |

### Stage 3: Model Training

| Substage | Definition | Example Context |
|----------|------------|----------------|
| **Probability Estimation** | Computing probabilities from counts (MLE) | P(word\|context) from n-gram counts |
| **Smoothing** | Handling zero probabilities (Laplace, Add-k) | Laplace smoothing, Add-k smoothing |
| **Interpolation** | Combining multiple models with weights | Linear interpolation of n-gram orders |
| **Backpropagation** | Training neural networks via gradient descent | Neural network weight updates |
| **Parameter Initialization** | Setting initial model parameters | Random weights, pretrained embeddings |
| **Optimization** | Updating model parameters to minimize loss | SGD, Adam optimizer |

### Stage 4: Evaluation & Fine-tuning

| Substage | Definition | Example Context |
|----------|------------|----------------|
| **Perplexity** | Language model evaluation metric | Measuring model confusion on test set |
| **Accuracy** | Classification correctness metric | Sentiment classification accuracy |
| **Error Analysis** | Examining model mistakes | Confusion matrix, misclassification patterns |
| **Hyperparameter Tuning** | Optimizing model settings | Grid search for k values, learning rates |
| **Validation** | Evaluating on held-out validation set | Checking generalization before test |
| **Cross-Validation** | Multiple train/validation splits | K-fold cross-validation |

### Stage 5: Deployment & Inference

| Substage | Definition | Example Context |
|----------|------------|----------------|
| **Test Examples** | Running model on example inputs | Demonstrating predictions |
| **Pipeline Demo** | End-to-end demonstration | Complete workflow from input to output |
| **Interactive Widget** | User interface for model interaction | Jupyter widgets, web interfaces |
| **Batch Processing** | Running model on multiple inputs | Processing test set |
| **Performance Monitoring** | Tracking model behavior in production | Logging predictions, detecting drift |

---

## Assignment Mappings

### Assignment 1: Prefix Expansion (Autocomplete)

| Stage | Substages |
|-------|-----------|
| Data Prep | Corpus Loading, Cleaning, Tokenization |
| Feature Extraction | N-gram Extraction, Count Statistics |
| Model Training | Probability Estimation |
| Evaluation & Fine-tuning | Test Examples |
| Deployment & Inference | Interactive Widget |

### Assignment 4: N-gram Language Models

| Stage | Substages |
|-------|-----------|
| Data Prep | Corpus Loading, Vocabulary Building |
| Feature Extraction | N-gram Extraction, Count Statistics |
| Model Training | Probability Estimation, Smoothing, Interpolation |
| Evaluation & Fine-tuning | Perplexity, Hyperparameter Tuning |
| Deployment & Inference | Test Examples, Pipeline Demo |

---

## Adding New Terms

When adding new substages:

1. **Check if it exists** - Review this document first
2. **Use general terms** - Avoid assignment-specific language
3. **Define clearly** - Add definition and example context
4. **Update mappings** - Add to relevant assignment sections
5. **Maintain consistency** - Ensure similar concepts use the same term

---

## Questions?

Refer to `WORKFLOW.md` for implementation details and usage patterns.
