# Backend Implementation Plan: Assignment-Specific Jupyter Runtimes

## 🎯 Goal

Build containerized Jupyter runtime backends for interactive notebook execution, starting with **assignment_1** (Bayes Sentiment Analysis). Each assignment gets its own isolated backend with dedicated dependencies.

## 🏗️ Architecture Overview

### Key Decision: One Backend Per Assignment ✅

**Why Separate Backends:**
- Clean dependency isolation (no version conflicts)
- Independent scaling and versioning
- Easy to debug and maintain
- Each assignment can evolve independently

**Architecture Pattern:**
```
Frontend Route           Backend Service               Notebook Source
─────────────────        ───────────────────          ────────────────
/bayes-sentimentanalysis → assignment-1-runtime.run.app → GitHub/assignment_1/
/n-gram-models          → assignment-2-runtime.run.app → GitHub/assignment_2/
/neural-networks        → assignment-3-runtime.run.app → GitHub/assignment_3/
```

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────┐
│  Frontend (Vercel)                      │
│  nlp-viewer.vercel.app                  │
│                                         │
│  Routes:                                │
│  ├─ /bayes-sentimentanalysis ────────┐ │
│  ├─ /n-gram-models ─────────────────┐│ │
│  └─ /neural-networks ───────────────┐││ │
└─────────────────────────────────────│││─┘
                                      │││
                    ┌─────────────────┘││
                    │  ┌───────────────┘│
                    │  │  ┌─────────────┘
                    ▼  ▼  ▼
        ┌───────────────────────────────────┐
        │  Google Cloud Run                 │
        │                                   │
        │  ┌────────────────────────────┐  │
        │  │ assignment-1-runtime       │  │
        │  │ (scikit-learn, pandas)     │  │
        │  │ Port: 8888                 │  │
        │  └────────────────────────────┘  │
        │                                   │
        │  ┌────────────────────────────┐  │
        │  │ assignment-2-runtime       │  │
        │  │ (nltk, spacy)              │  │
        │  │ Port: 8888                 │  │
        │  └────────────────────────────┘  │
        │                                   │
        │  ┌────────────────────────────┐  │
        │  │ assignment-3-runtime       │  │
        │  │ (pytorch, transformers)    │  │
        │  │ Port: 8888                 │  │
        │  └────────────────────────────┘  │
        └───────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────┐
        │  GitHub (Source of Truth)         │
        │                                   │
        │  nlp-assignments/                 │
        │  ├─ assignment_1/                 │
        │  │  ├─ assignment_1.ipynb         │
        │  │  ├─ requirements.txt           │
        │  │  └─ shakespeare-edit.txt       │
        │  ├─ assignment_2/                 │
        │  └─ assignment_3/                 │
        └───────────────────────────────────┘
```

## 🛠️ Technology Stack

| Layer             | Technology                          | Purpose                           |
|-------------------|-------------------------------------|-----------------------------------|
| Containerization  | Docker                              | Package runtime environments      |
| Kernel Gateway    | Jupyter Kernel Gateway              | Expose kernels to Thebe           |
| Python Runtime    | Python 3.11                         | Execute notebook code             |
| CI/CD             | GitHub Actions                      | Auto-build and deploy             |
| Container Registry| GitHub Container Registry (GHCR)    | Store Docker images               |
| Hosting           | Google Cloud Run                    | Serverless container hosting      |
| Frontend Client   | Thebe                               | Browser-based kernel connection   |
| Source Control    | GitHub                              | Notebooks and metadata            |

## 📁 Repository Structure

Create a new repository: `nlp-assignment-runtimes`

```
nlp-assignment-runtimes/
├── README.md
├── scripts/
│   └── new-assignment.sh           # Template script for new assignments
│
├── assignment-1-bayes/
│   ├── Dockerfile
│   ├── requirements.txt            # scikit-learn, pandas, numpy
│   ├── app/
│   │   └── main.py                 # Optional FastAPI wrapper
│   ├── notebooks/
│   │   └── assignment_1.ipynb      # Reference copy (optional)
│   └── .github/
│       └── workflows/
│           └── deploy-assignment-1.yml
│
├── assignment-2-ngrams/            # Future
│   ├── Dockerfile
│   ├── requirements.txt
│   └── ...
│
└── assignment-3-neural/            # Future
    ├── Dockerfile
    ├── requirements.txt
    └── ...
```

---

# 🚀 Implementation Phases

## Phase 0: Prerequisites & Repository Setup

### Objectives
- Ensure Docker is installed locally
- Create GitHub repository for backend runtimes
- Initialize with assignment-1 structure

### Steps

1. **Check Docker installation:**
   ```bash
   docker --version
   # Should output: Docker version 20.x or higher
   ```

2. **Create GitHub repository:**
   - Name: `nlp-assignment-runtimes`
   - Visibility: Private or Public
   - Initialize with README

3. **Clone and create structure:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/nlp-assignment-runtimes.git
   cd nlp-assignment-runtimes

   mkdir -p assignment-1-bayes/app
   mkdir -p assignment-1-bayes/.github/workflows
   mkdir -p scripts
   ```

4. **Copy assignment_1 requirements:**
   ```bash
   cp /Users/colinsidberry/Northeastern/NLP/assignment_1/requirements.txt \
      assignment-1-bayes/requirements.txt
   ```

### Deliverables
- ✅ GitHub repo: `nlp-assignment-runtimes`
- ✅ Directory structure created
- ✅ `assignment-1-bayes/requirements.txt` populated

### Checkpoint
```bash
# Verify structure
tree assignment-1-bayes
# Should show Dockerfile (to be created), requirements.txt, etc.
```

---

## Phase 1: Assignment 1 Runtime Container

### Objectives
- Create Docker image with Jupyter Kernel Gateway
- Install assignment-1 dependencies (scikit-learn, pandas, etc.)
- Test local execution

### Steps

1. **Create `assignment-1-bayes/Dockerfile`:**
   ```dockerfile
   FROM jupyter/minimal-notebook:python-3.11

   USER root
   WORKDIR /app

   # Copy dependencies
   COPY requirements.txt .

   # Install Python packages
   RUN pip install --no-cache-dir -r requirements.txt

   # Install Jupyter Kernel Gateway for Thebe
   RUN pip install --no-cache-dir jupyter-kernel-gateway

   # Switch back to notebook user
   USER $NB_UID

   EXPOSE 8888

   # Start kernel gateway
   CMD ["jupyter", "kernelgateway", \
        "--KernelGatewayApp.ip=0.0.0.0", \
        "--KernelGatewayApp.port=8888", \
        "--KernelGatewayApp.allow_origin='*'"]
   ```

2. **Build Docker image:**
   ```bash
   cd assignment-1-bayes
   docker build -t assignment-1-runtime .
   ```

3. **Run container locally:**
   ```bash
   docker run -p 8888:8888 assignment-1-runtime
   ```

4. **Test kernel API:**
   ```bash
   # In another terminal
   curl http://localhost:8888/api/kernels
   # Should return: []

   # Test kernel creation
   curl -X POST http://localhost:8888/api/kernels
   # Should return kernel info with kernel_id
   ```

### Deliverables
- ✅ `Dockerfile` created
- ✅ Docker image builds successfully
- ✅ Container runs and exposes port 8888
- ✅ Kernel API responds

### Checkpoint
```bash
docker ps
# Should show assignment-1-runtime container running

curl http://localhost:8888/api
# Should return API information
```

---

## Phase 2: Local Thebe Connection Test

### Objectives
- Configure frontend to connect to local backend
- Verify Thebe can execute code against Docker container
- Test end-to-end flow locally

### Frontend Changes

1. **Create `src/config/assignments.js`:**
   ```javascript
   export const ASSIGNMENTS = {
     'bayes-sentimentanalysis': {
       id: 'assignment_1',
       title: 'Bayes Sentiment Analysis',
       notebookUrl: '/assignments/assignment_1/assignment_1.ipynb',
       kernelUrl: 'http://localhost:8888',  // Local for now
       metadata: {
         // TOC structure from data.json
       }
     },
     // Future assignments...
   };
   ```

2. **Update `src/components/NotebookViewer.jsx`:**

   Add prop for `kernelUrl`:
   ```javascript
   const NotebookViewer = forwardRef(({ notebookUrl, kernelUrl }, ref) => {
     // ... existing code

     // Update Thebe bootstrap
     const thebe = await window.thebelab.bootstrap({
       requestKernel: true,
       kernelOptions: {
         name: 'python3',
         kernelName: 'python3',
         serverSettings: {
           baseUrl: kernelUrl,
           wsUrl: kernelUrl.replace('http', 'ws'),
           token: ''
         }
       },
       selector: '[data-executable="true"]',
       codeMirrorConfig: {
         theme: 'material-palenight',
         mode: 'python',
         lineNumbers: true,
       },
     });
   ```

3. **Update `src/App.jsx`:**
   ```javascript
   import { ASSIGNMENTS } from './config/assignments';

   function App() {
     const assignment = ASSIGNMENTS['bayes-sentimentanalysis'];

     return (
       <NotebookViewer
         notebookUrl={assignment.notebookUrl}
         kernelUrl={assignment.kernelUrl}
       />
     );
   }
   ```

### Testing Steps

1. Start backend container:
   ```bash
   docker run -p 8888:8888 assignment-1-runtime
   ```

2. Start frontend:
   ```bash
   npm run dev
   ```

3. Open browser, activate Thebe, run:
   ```python
   import sklearn
   print(sklearn.__version__)
   ```

### Deliverables
- ✅ Frontend accepts `kernelUrl` prop
- ✅ Thebe connects to local Docker backend
- ✅ Can execute Python code and see output
- ✅ Assignment-1 dependencies work (sklearn, pandas)

### Checkpoint
Execute test code in notebook viewer:
```python
import pandas as pd
import numpy as np
from sklearn.naive_bayes import MultinomialNB

print("✅ All imports successful!")
```

---

## Phase 3: CI/CD Pipeline (GitHub Actions)

### Objectives
- Auto-build Docker image on push
- Push to GitHub Container Registry
- Tag with commit SHA and 'latest'

### Steps

1. **Create `.github/workflows/deploy-assignment-1.yml`:**
   ```yaml
   name: Build and Push Assignment 1 Runtime

   on:
     push:
       branches: [main]
       paths:
         - 'assignment-1-bayes/**'
     workflow_dispatch:

   env:
     REGISTRY: ghcr.io
     IMAGE_NAME: ${{ github.repository }}/assignment-1-runtime

   jobs:
     build-and-push:
       runs-on: ubuntu-latest
       permissions:
         contents: read
         packages: write

       steps:
         - name: Checkout code
           uses: actions/checkout@v3

         - name: Log in to GitHub Container Registry
           uses: docker/login-action@v2
           with:
             registry: ${{ env.REGISTRY }}
             username: ${{ github.actor }}
             password: ${{ secrets.GITHUB_TOKEN }}

         - name: Extract metadata
           id: meta
           uses: docker/metadata-action@v4
           with:
             images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
             tags: |
               type=sha,prefix={{branch}}-
               type=raw,value=latest,enable={{is_default_branch}}

         - name: Build and push Docker image
           uses: docker/build-push-action@v4
           with:
             context: ./assignment-1-bayes
             push: true
             tags: ${{ steps.meta.outputs.tags }}
             labels: ${{ steps.meta.outputs.labels }}
   ```

2. **Enable GitHub Actions:**
   - Go to repository Settings → Actions → General
   - Enable "Read and write permissions" for GITHUB_TOKEN

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add CI/CD for assignment-1 runtime"
   git push origin main
   ```

4. **Monitor build:**
   - Go to Actions tab in GitHub
   - Watch workflow execute

### Deliverables
- ✅ GitHub Actions workflow created
- ✅ Docker image builds automatically
- ✅ Image pushed to `ghcr.io/YOUR_USERNAME/nlp-assignment-runtimes/assignment-1-runtime`

### Checkpoint
```bash
# Pull the image from GHCR
docker pull ghcr.io/YOUR_USERNAME/nlp-assignment-runtimes/assignment-1-runtime:latest

# Run it
docker run -p 8888:8888 ghcr.io/YOUR_USERNAME/nlp-assignment-runtimes/assignment-1-runtime:latest
```

---

## Phase 4: Deploy to Google Cloud Run

### Objectives
- Deploy Docker container to Cloud Run
- Get public HTTPS endpoint
- Configure auto-scaling and CORS

### Prerequisites

1. **Install Google Cloud CLI:**
   ```bash
   # macOS
   brew install google-cloud-sdk

   # Verify
   gcloud --version
   ```

2. **Login and set project:**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID

   # If no project exists, create one:
   gcloud projects create nlp-runtimes --name="NLP Assignment Runtimes"
   ```

3. **Enable required APIs:**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

### Deployment Steps

1. **Configure authentication for GHCR:**
   ```bash
   echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
   ```

2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy assignment-1-runtime \
     --image ghcr.io/YOUR_USERNAME/nlp-assignment-runtimes/assignment-1-runtime:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8888 \
     --memory 2Gi \
     --cpu 2 \
     --timeout 300 \
     --max-instances 3 \
     --set-env-vars JUPYTER_ENABLE_LAB=no
   ```

3. **Get service URL:**
   ```bash
   gcloud run services describe assignment-1-runtime \
     --platform managed \
     --region us-central1 \
     --format 'value(status.url)'

   # Example output: https://assignment-1-runtime-abc123-uc.a.run.app
   ```

4. **Test deployment:**
   ```bash
   RUNTIME_URL="https://assignment-1-runtime-abc123-uc.a.run.app"
   curl $RUNTIME_URL/api/kernels
   ```

### Configure CORS (If needed)

If using FastAPI wrapper, create `assignment-1-bayes/app/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://nlp-viewer.vercel.app",
        "http://localhost:5173"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Proxy to Jupyter Kernel Gateway
# (Start kernel gateway as subprocess and proxy requests)
```

### Deliverables
- ✅ Container deployed to Cloud Run
- ✅ Public HTTPS URL obtained
- ✅ Kernel API accessible remotely
- ✅ CORS configured for frontend domain

### Checkpoint
```bash
# Test kernel creation remotely
curl -X POST https://assignment-1-runtime-abc123-uc.a.run.app/api/kernels

# Should return kernel info
```

---

## Phase 5: Frontend Integration with Cloud Run

### Objectives
- Update frontend to use production backend URL
- Add assignment routing
- Test full deployment flow

### Steps

1. **Update `src/config/assignments.js`:**
   ```javascript
   export const ASSIGNMENTS = {
     'bayes-sentimentanalysis': {
       id: 'assignment_1',
       title: 'Bayes Sentiment Analysis',
       notebookUrl: 'https://raw.githubusercontent.com/YOUR_USERNAME/nlp-assignments/main/assignment_1/assignment_1.ipynb',
       kernelUrl: 'https://assignment-1-runtime-abc123-uc.a.run.app',  // Cloud Run URL
       metadata: {
         week: 1,
         description: 'Implement a Naive Bayes classifier for sentiment analysis',
         toc: [
           { name: 'Data Prep', cellId: 'c8a63d33' },
           { name: 'Model Training', cellId: 'xxx' },
           // ... from data.json
         ]
       }
     }
   };
   ```

2. **Add React Router (if not already installed):**
   ```bash
   npm install react-router-dom
   ```

3. **Update `src/App.jsx` for routing:**
   ```javascript
   import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
   import { ASSIGNMENTS } from './config/assignments';

   function AssignmentViewer() {
     const { assignmentSlug } = useParams();
     const assignment = ASSIGNMENTS[assignmentSlug];

     if (!assignment) {
       return <div>Assignment not found</div>;
     }

     return (
       <div className="h-screen overflow-hidden bg-[var(--color-bg-primary)] flex relative">
         {/* ... existing sidebar code ... */}
         <NotebookViewer
           notebookUrl={assignment.notebookUrl}
           kernelUrl={assignment.kernelUrl}
         />
       </div>
     );
   }

   function AssignmentList() {
     return (
       <div className="p-8">
         <h1>NLP Assignments</h1>
         {Object.entries(ASSIGNMENTS).map(([slug, assignment]) => (
           <a key={slug} href={`/${slug}`}>
             {assignment.title}
           </a>
         ))}
       </div>
     );
   }

   function App() {
     return (
       <BrowserRouter>
         <Routes>
           <Route path="/" element={<AssignmentList />} />
           <Route path="/:assignmentSlug" element={<AssignmentViewer />} />
         </Routes>
       </BrowserRouter>
     );
   }

   export default App;
   ```

4. **Deploy frontend to Vercel:**
   ```bash
   npm run build
   vercel --prod
   ```

### Deliverables
- ✅ Frontend uses Cloud Run backend URL
- ✅ Route `/bayes-sentimentanalysis` works
- ✅ Can execute code remotely
- ✅ Production deployment complete

### Checkpoint
Visit `https://nlp-viewer.vercel.app/bayes-sentimentanalysis`:
- ✅ Notebook loads
- ✅ Thebe activates
- ✅ Code executes on Cloud Run
- ✅ Results display in browser

---

## Phase 6: Monitoring & Optimization

### Objectives
- Add logging
- Configure auto-scaling
- Monitor costs
- Optimize container size

### Cloud Run Monitoring

1. **View logs:**
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=assignment-1-runtime" \
     --limit 50 \
     --format json
   ```

2. **Set up alerts (optional):**
   - Go to Cloud Console → Monitoring → Alerting
   - Create alert for high error rates or latency

### Optimization

1. **Reduce Docker image size:**
   ```dockerfile
   # Use multi-stage build
   FROM jupyter/minimal-notebook:python-3.11 as builder
   COPY requirements.txt .
   RUN pip install --user -r requirements.txt

   FROM jupyter/minimal-notebook:python-3.11
   COPY --from=builder /home/jovyan/.local /home/jovyan/.local
   # ... rest of Dockerfile
   ```

2. **Configure Cloud Run scaling:**
   ```bash
   gcloud run services update assignment-1-runtime \
     --min-instances 0 \
     --max-instances 3 \
     --concurrency 5
   ```

### Cost Monitoring

Free tier limits:
- 2 million requests/month
- 360,000 GB-seconds memory
- 180,000 vCPU-seconds

Monitor usage:
```bash
gcloud run services describe assignment-1-runtime --format="value(status.traffic)"
```

### Deliverables
- ✅ Logging configured
- ✅ Auto-scaling optimized
- ✅ Image size reduced
- ✅ Cost monitoring set up

---

## Phase 7: Template for Future Assignments

### Objectives
- Create reusable template
- Script to scaffold new assignments
- Documentation for adding assignments

### Steps

1. **Create `scripts/new-assignment.sh`:**
   ```bash
   #!/bin/bash

   if [ "$#" -ne 2 ]; then
     echo "Usage: ./new-assignment.sh <number> <name>"
     echo "Example: ./new-assignment.sh 2 ngrams"
     exit 1
   fi

   ASSIGNMENT_NUM=$1
   ASSIGNMENT_NAME=$2
   ASSIGNMENT_DIR="assignment-${ASSIGNMENT_NUM}-${ASSIGNMENT_NAME}"

   echo "Creating $ASSIGNMENT_DIR..."
   mkdir -p "$ASSIGNMENT_DIR"/{app,.github/workflows}

   # Copy Dockerfile template
   cp assignment-1-bayes/Dockerfile "$ASSIGNMENT_DIR/Dockerfile"

   # Create placeholder requirements.txt
   cat > "$ASSIGNMENT_DIR/requirements.txt" << EOF
   # Assignment ${ASSIGNMENT_NUM} dependencies
   jupyter-kernel-gateway
   # Add your dependencies here
   EOF

   # Create workflow
   sed "s/assignment-1-bayes/${ASSIGNMENT_DIR}/g" \
       assignment-1-bayes/.github/workflows/deploy-assignment-1.yml > \
       "$ASSIGNMENT_DIR/.github/workflows/deploy-assignment-${ASSIGNMENT_NUM}.yml"

   echo "✅ Created $ASSIGNMENT_DIR"
   echo "Next steps:"
   echo "1. Update ${ASSIGNMENT_DIR}/requirements.txt"
   echo "2. Commit and push to trigger build"
   echo "3. Deploy to Cloud Run"
   echo "4. Update frontend config"
   ```

2. **Make executable:**
   ```bash
   chmod +x scripts/new-assignment.sh
   ```

3. **Create `ADDING_ASSIGNMENTS.md`:**
   ```markdown
   # Adding a New Assignment

   ## Step 1: Create Assignment Structure
   \`\`\`bash
   ./scripts/new-assignment.sh 2 ngrams
   \`\`\`

   ## Step 2: Add Dependencies
   Edit `assignment-2-ngrams/requirements.txt`:
   \`\`\`
   nltk==3.8.1
   spacy==3.5.0
   \`\`\`

   ## Step 3: Push to GitHub
   \`\`\`bash
   git add .
   git commit -m "Add assignment 2 runtime"
   git push
   \`\`\`

   ## Step 4: Deploy to Cloud Run
   \`\`\`bash
   gcloud run deploy assignment-2-runtime \
     --image ghcr.io/YOUR_USERNAME/nlp-assignment-runtimes/assignment-2-runtime:latest \
     --region us-central1 \
     --allow-unauthenticated
   \`\`\`

   ## Step 5: Update Frontend Config
   Add to `src/config/assignments.js`:
   \`\`\`javascript
   'n-gram-models': {
     id: 'assignment_2',
     title: 'N-Gram Language Models',
     kernelUrl: 'https://assignment-2-runtime-xyz.a.run.app',
     // ...
   }
   \`\`\`
   ```

### Deliverables
- ✅ `new-assignment.sh` script
- ✅ `ADDING_ASSIGNMENTS.md` guide
- ✅ Reusable template structure

### Checkpoint
```bash
# Test template creation
./scripts/new-assignment.sh 2 ngrams

# Verify structure
tree assignment-2-ngrams
```

---

# 🎯 Success Criteria

## Assignment 1 Deployment Complete When:

- [ ] Docker container runs locally
- [ ] Thebe connects to local backend
- [ ] CI/CD builds and pushes to GHCR
- [ ] Container deployed to Cloud Run
- [ ] Frontend route `/bayes-sentimentanalysis` works
- [ ] Code executes remotely and returns results
- [ ] CORS configured correctly
- [ ] Logs visible in Cloud Console
- [ ] Template ready for assignment 2

## Testing Checklist

### Local Testing
```bash
# 1. Build image
cd assignment-1-bayes
docker build -t assignment-1-runtime .

# 2. Run container
docker run -p 8888:8888 assignment-1-runtime

# 3. Test kernel API
curl http://localhost:8888/api/kernels

# 4. Test with frontend
npm run dev
# Navigate to http://localhost:5173
# Activate Thebe
# Run: print("Hello from Docker!")
```

### Cloud Testing
```bash
# 1. Test kernel endpoint
curl https://assignment-1-runtime-xyz.a.run.app/api/kernels

# 2. Create kernel
curl -X POST https://assignment-1-runtime-xyz.a.run.app/api/kernels

# 3. Test with production frontend
# Visit: https://nlp-viewer.vercel.app/bayes-sentimentanalysis
```

---

# 📝 Notes & Best Practices

## Security
- Never commit API keys or tokens
- Use environment variables for sensitive data
- Keep CORS restrictive (specific domains only)
- Regularly update dependencies

## Cost Optimization
- Set max-instances to prevent runaway costs
- Use min-instances=0 to scale to zero when idle
- Monitor usage in Cloud Console
- Consider switching to cheaper regions if needed

## Development Workflow
1. Make changes locally
2. Test with Docker
3. Push to GitHub (triggers CI/CD)
4. Deploy to Cloud Run
5. Update frontend config
6. Test production

## Debugging
- Check Cloud Run logs: `gcloud logging read ...`
- Test locally first: `docker run -p 8888:8888 ...`
- Verify CORS: Check browser console for errors
- Check kernel status: `curl .../api/kernels`

---

# 🔗 Quick Reference

## Useful Commands

```bash
# Build and run locally
docker build -t assignment-1-runtime ./assignment-1-bayes
docker run -p 8888:8888 assignment-1-runtime

# Deploy to Cloud Run
gcloud run deploy assignment-1-runtime \
  --image ghcr.io/YOUR_USERNAME/nlp-assignment-runtimes/assignment-1-runtime:latest \
  --region us-central1 \
  --allow-unauthenticated

# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit 20

# Get service URL
gcloud run services describe assignment-1-runtime \
  --format 'value(status.url)'
```

## Environment Variables

```bash
# Cloud Run
JUPYTER_ENABLE_LAB=no
KERNEL_GATEWAY_PORT=8888

# Frontend
VITE_ASSIGNMENT_1_KERNEL_URL=https://assignment-1-runtime-xyz.a.run.app
```

## URLs

- **Frontend:** https://nlp-viewer.vercel.app
- **Backend (Assignment 1):** https://assignment-1-runtime-xyz.a.run.app
- **GHCR:** https://github.com/YOUR_USERNAME/nlp-assignment-runtimes/pkgs/container/assignment-1-runtime
- **Notebooks:** https://github.com/YOUR_USERNAME/nlp-assignments

---

# 🚦 Next Steps After Completion

1. **Add Assignment 2:**
   - Run `./scripts/new-assignment.sh 2 ngrams`
   - Follow `ADDING_ASSIGNMENTS.md`

2. **Improve TOC Automation:**
   - Parse notebook metadata
   - Auto-generate `data.json`
   - Add cell tagging in Jupyter

3. **Add User Features:**
   - Save progress (Supabase)
   - Track completion
   - Export results

4. **Performance:**
   - Add Redis caching
   - Optimize kernel startup time
   - Pre-warm containers

---

**Document Version:** 1.0
**Last Updated:** 2025-10-15
**Author:** Backend Implementation Plan for NLP Assignment Viewer
