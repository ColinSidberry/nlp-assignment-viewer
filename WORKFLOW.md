# Notebook Management Workflows

## Key Concept: NO HTML/JSON Conversion Needed!

**With Thebe, you load `.ipynb` files directly.** No conversion to HTML or separate JSON metadata extraction is required. Thebe:
- Reads the raw `.ipynb` file
- Renders the cells in the browser
- Connects to your live kernel backend for execution

---

## Workflow 1: Adding a BRAND NEW Assignment (e.g., Assignment 2)

### Step 1: Get Assignment PDF
```bash
# Example: https://course.ccs.neu.edu/cs6120f25/assets/pdf/assignment-2.pdf
```

### Step 2: Create Narrative Notebook with Claude
Ask Claude to create a narrative-driven `.ipynb` file like `assignment_1.ipynb`

**Key Requirements for the Notebook:**
- Add cell IDs to important cells for TOC navigation
- Include markdown explanations between code cells
- Use `ipywidgets` for interactive elements if needed
- Include all necessary Python code

### Step 3: Add Required Data Files to Backend

**Location:** `nlp-assignment-runtimes/assignments/assignment-2/`

```bash
cd /path/to/nlp-assignment-runtimes
mkdir -p assignments/assignment-2
```

Add:
- `assignment_2.ipynb` - Your notebook
- `shakespeare-edit.txt` (or whatever data files are needed)
- `requirements.txt` - Python dependencies
- `Dockerfile` - Copy and modify from assignment-1

**Example requirements.txt:**
```txt
jupyter-kernel-gateway==2.5.2
ipywidgets==8.1.1
numpy==1.24.3
# Add any assignment-specific packages
```

### Step 4: Build and Test Backend Locally

```bash
cd assignments/assignment-2
docker build -t assignment-2-runtime .
docker run -p 8889:8888 assignment-2-runtime

# Test it
curl http://localhost:8889/api
```

### Step 5: Deploy Backend to Cloud Run

Update the GitHub Actions workflow:

```bash
cd /path/to/nlp-assignment-runtimes
cp .github/workflows/deploy-assignment-1.yml .github/workflows/deploy-assignment-2.yml
```

Edit the new workflow file:
- Change `assignment-1` to `assignment-2` throughout
- Change port if needed (keep 8888 internal, expose as needed)
- Update image names

Commit and push to trigger deployment:
```bash
git add .
git commit -m "Add Assignment 2 runtime"
git push
```

Or deploy manually:
```bash
gcloud run deploy assignment-2-runtime \
  --image us-west2-docker.pkg.dev/northeastern-nlp/nlp-runtimes/assignment-2-runtime:latest \
  --platform managed \
  --region us-west2 \
  --allow-unauthenticated \
  --port 8888 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 3
```

### Step 6: Add Notebook to Frontend

**Copy notebook to frontend:**
```bash
cd /path/to/nlp-assignment-viewer
mkdir -p public/assignments/assignment_2
cp /path/to/assignment_2.ipynb public/assignments/assignment_2/
```

**Update configuration:**

Edit `src/config/assignments.js`:
```javascript
'assignment-2-slug': {
  id: 'assignment_2',
  slug: 'assignment-2-slug',
  title: 'Assignment 2 Title',
  description: 'Brief description',
  week: 2,
  notebookUrl: '/assignments/assignment_2/assignment_2.ipynb',
  kernelUrl: import.meta.env.VITE_ASSIGNMENT_2_KERNEL_URL || 'http://localhost:8889',
  toc: {
    title: 'Assignment 2 Title',
    assignment: 'assignment_2',
    week_assigned: 2,
    ml_stage: [
      {
        name: 'Section Name',
        cell_id: 'abc123',  // Cell ID from notebook
        substage: [...]
      }
    ]
  }
}
```

**Update environment files:**

`.env.example`:
```bash
VITE_ASSIGNMENT_2_KERNEL_URL=http://localhost:8889
```

`.env.production`:
```bash
VITE_ASSIGNMENT_2_KERNEL_URL=https://assignment-2-runtime-102959943408.us-west2.run.app
```

### Step 7: Deploy Frontend
```bash
git add .
git commit -m "Add Assignment 2"
git push
```

Vercel will auto-deploy!

---

## Workflow 2: Updating an EXISTING Assignment (e.g., fixing Assignment 1)

### Option A: Only Notebook Content Changed (No Dependencies)

**Quickest path - only update frontend:**

1. Edit the notebook locally:
```bash
cd /path/to/nlp-assignment-viewer/public/assignments/assignment_1
# Edit assignment_1.ipynb with Jupyter, VS Code, or text editor
```

2. Test locally (optional):
```bash
# In nlp-assignment-viewer:
npm run dev
# Opens browser, test your changes
```

3. Deploy:
```bash
git add public/assignments/assignment_1/assignment_1.ipynb
git commit -m "Update Assignment 1 notebook content"
git push
```

Done! Vercel redeploys, users see new notebook immediately.

**When to do this:**
- Fixed typos in markdown cells
- Updated code cell content
- Changed explanations
- Modified TOC cell IDs

### Option B: Data Files or Dependencies Changed

**Need to update backend:**

1. Update files in `nlp-assignment-runtimes/assignments/assignment-1/`:
```bash
cd /path/to/nlp-assignment-runtimes/assignments/assignment-1
# Update shakespeare-edit.txt, requirements.txt, Dockerfile, etc.
```

2. Rebuild and redeploy backend:
```bash
# Option 1: Push to GitHub (triggers CI/CD)
git add .
git commit -m "Update Assignment 1 dependencies"
git push

# Option 2: Manual deploy
docker build -t assignment-1-runtime .
docker tag assignment-1-runtime us-west2-docker.pkg.dev/northeastern-nlp/nlp-runtimes/assignment-1-runtime:latest
docker push us-west2-docker.pkg.dev/northeastern-nlp/nlp-runtimes/assignment-1-runtime:latest

gcloud run deploy assignment-1-runtime \
  --image us-west2-docker.pkg.dev/northeastern-nlp/nlp-runtimes/assignment-1-runtime:latest \
  --region us-west2
```

3. Update notebook in frontend if needed (follow Option A above)

**When to do this:**
- Added new Python packages (numpy, pandas, etc.)
- Updated data files (shakespeare-edit.txt, etc.)
- Changed Docker configuration
- Need different system packages

---

## Directory Structure Reference

### Backend Repo: `nlp-assignment-runtimes`
```
nlp-assignment-runtimes/
├── assignments/
│   ├── assignment-1/
│   │   ├── assignment_1.ipynb          # Notebook WITH dependencies
│   │   ├── shakespeare-edit.txt        # Data files
│   │   ├── tiny.txt
│   │   ├── requirements.txt            # Python packages
│   │   ├── Dockerfile                  # Container definition
│   │   ├── nginx.conf                  # CORS proxy
│   │   └── start.sh                    # Startup script
│   ├── assignment-2/
│   │   └── (same structure)
├── .github/
│   └── workflows/
│       ├── deploy-assignment-1.yml     # CI/CD for assignment 1
│       └── deploy-assignment-2.yml     # CI/CD for assignment 2
└── README.md
```

### Frontend Repo: `nlp-assignment-viewer`
```
nlp-assignment-viewer/
├── public/
│   └── assignments/
│       ├── assignment_1/
│       │   └── assignment_1.ipynb      # SAME notebook as backend
│       ├── assignment_2/
│       │   └── assignment_2.ipynb
├── src/
│   ├── config/
│   │   └── assignments.js              # Metadata + kernel URLs
│   ├── components/
│   │   └── Notebook/                   # Thebe integration
├── .env.example                        # Template (localhost)
├── .env.production                     # Cloud Run URLs (committed)
└── README.md
```

---

## Important Notes

### Notebook File Duplication
The `.ipynb` file exists in **BOTH** repositories:
- **Backend:** Needed to test locally with Docker
- **Frontend:** Thebe loads this directly in the browser

**Keep them in sync!** When you update the notebook, copy it to both places.

### Cell IDs for TOC Navigation
When creating/updating notebooks, ensure important cells have IDs:
```json
{
  "cell_type": "code",
  "id": "c8a63d33",    // <-- This ID
  "source": ["..."]
}
```

These IDs are referenced in `src/config/assignments.js` for table of contents navigation.

### No HTML Conversion
Unlike traditional Jupyter workflows, **you never convert to HTML**. Thebe handles rendering live in the browser.

### Data Files
Data files (like `shakespeare-edit.txt`) live **only** in the backend repository. They're included in the Docker image so the kernel has access to them when executing code.

---

## Quick Reference: What Goes Where?

| Change | Update Backend? | Update Frontend? | Deploy Backend? | Deploy Frontend? |
|--------|----------------|------------------|----------------|------------------|
| Fix notebook typo | No | Yes (copy .ipynb) | No | Yes (git push) |
| Update explanation | No | Yes (copy .ipynb) | No | Yes (git push) |
| Add new Python package | Yes (requirements.txt) | Maybe (copy .ipynb) | Yes (rebuild image) | Maybe |
| Update data file | Yes (shakespeare-edit.txt) | No | Yes (rebuild image) | No |
| Add new assignment | Yes (new folder) | Yes (new config) | Yes (new service) | Yes |
| Change TOC structure | No | Yes (assignments.js) | No | Yes (git push) |

---

## Testing Checklist

### Before Deploying a New/Updated Assignment:

**Backend:**
- [ ] Dockerfile builds successfully
- [ ] Container runs and exposes port 8888
- [ ] `curl http://localhost:8888/api` returns version
- [ ] `curl http://localhost:8888/api/kernels` returns `[]`
- [ ] All data files are in the container

**Frontend:**
- [ ] Notebook file is in `public/assignments/assignment_X/`
- [ ] Configuration added to `src/config/assignments.js`
- [ ] Environment variables set (.env.example and .env.production)
- [ ] TOC cell IDs match notebook cell IDs
- [ ] `npm run dev` loads the assignment
- [ ] Can execute code cells via Thebe

**Integration:**
- [ ] Backend deployed to Cloud Run
- [ ] Frontend can connect to Cloud Run backend
- [ ] Code execution works end-to-end
- [ ] No CORS errors in browser console
