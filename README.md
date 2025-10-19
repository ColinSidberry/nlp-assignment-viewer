# NLP Assignment Viewer

Interactive web application for viewing and executing Northeastern NLP course assignments. Built with React, Vite, and Thebe for live Jupyter kernel execution in the browser.

## Overview

This repository is the **frontend interface** in a three-repository system for interactive NLP assignment viewing:

```
┌─────────────────────────────────────────┐
│  GitHub: nlp-assignments                │
│  Stores notebooks & data                │
└─────────────────┬───────────────────────┘
                  │ Fetches .ipynb via raw URL
                  ▼
┌─────────────────────────────────────────┐
│  Frontend: nlp-assignment-viewer        │
│  (THIS REPO)                            │
│  ├── Fetches and renders notebooks      │
│  ├── Thebe integration                  │
│  ├── TOC navigation                     │
│  └── Routes: /assignment-slug           │
└─────────────────┬───────────────────────┘
                  │ WebSocket: Execute code
                  ▼
┌─────────────────────────────────────────┐
│  Backend: nlp-assignment-runtimes       │
│  Jupyter Kernel Gateway (Cloud Run)     │
│  ├── assignment-1-runtime               │
│  ├── assignment-2-runtime               │
│  └── assignment-3-runtime               │
└─────────────────────────────────────────┘
```

## Architecture

### Three-Repository System

| Repository | Role | Technology | Hosting |
|------------|------|------------|---------|
| **[nlp-assignments](https://github.com/YOUR_USERNAME/nlp-assignments)** | Stores notebooks, data, and dependencies | Jupyter, Python | GitHub |
| **[nlp-assignment-viewer](https://github.com/YOUR_USERNAME/nlp-assignment-viewer)** (this repo) | Interactive web viewer | React, Vite, Thebe | Vercel |
| **[nlp-assignment-runtimes](https://github.com/YOUR_USERNAME/nlp-assignment-runtimes)** | Python execution environments | Docker, Jupyter Kernel Gateway | Google Cloud Run |

## Features

- **Interactive Execution**: Run Python code directly in the browser via Thebe
- **Live Editing**: Modify code cells and see results immediately
- **Assignment-Specific Kernels**: Isolated Python environments for each assignment
- **Table of Contents**: Navigate between sections with automatic scrolling
- **Responsive Design**: Works on desktop and mobile devices
- **Syntax Highlighting**: CodeMirror integration for code editing

## Role in the System

This frontend application:

### 1. Fetches Notebooks
- Retrieves `.ipynb` files from GitHub via raw URLs
- Parses notebook JSON structure
- Renders markdown and code cells

### 2. Manages UI/UX
- Table of contents navigation
- Responsive layout
- Cell execution controls
- Output display

### 3. Connects to Backend Kernels
- Establishes WebSocket connections to Cloud Run backends
- Sends code cells for execution
- Receives and displays results
- Maintains kernel session state

## Setup

### Prerequisites
- Node.js 18+ and npm/pnpm
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/nlp-assignment-viewer.git
cd nlp-assignment-viewer
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` to point to your kernel backend:
- For local development: `http://localhost:8888` (requires running kernel container locally)
- For testing production: Use the Cloud Run URL from `.env.production`

## Running Locally

### Option 1: Using Cloud Run Backend (Recommended)
```bash
npm run dev
```
The app connects to deployed Cloud Run kernel backends.

### Option 2: Running Local Kernel Backend
```bash
# Terminal 1: Start backend kernel
cd ../nlp-assignment-runtimes/assignment-1-bayes
docker build -t assignment-1-runtime .
docker run -p 8888:8888 assignment-1-runtime

# Terminal 2: Start frontend
cd ../nlp-assignment-viewer
npm run dev
```

Visit http://localhost:5173

## Environment Variables

### Development (.env.local)
```bash
VITE_ASSIGNMENT_1_KERNEL_URL=http://localhost:8888
VITE_ASSIGNMENT_2_KERNEL_URL=http://localhost:8889
```

### Production (.env.production)
```bash
VITE_ASSIGNMENT_1_KERNEL_URL=https://assignment-1-runtime-102959943408.us-west2.run.app
VITE_ASSIGNMENT_2_KERNEL_URL=https://assignment-2-runtime-102959943408.us-west2.run.app
```

The production file is committed and used automatically during Vercel builds.

## Project Structure

```
nlp-assignment-viewer/
├── src/
│   ├── components/
│   │   ├── Layout/          # Page layout components
│   │   ├── Notebook/        # NotebookViewer, CodeCell, MarkdownCell
│   │   └── TOC/             # Table of contents navigation
│   ├── config/
│   │   └── assignments.js   # Assignment metadata and kernel URLs
│   ├── pages/               # Route-level page components
│   ├── styles/              # Global CSS
│   └── App.jsx              # Main app with routing
├── public/
│   └── assignments/         # Optional local notebook copies (for dev)
├── .env.example             # Environment variable template
├── .env.production          # Production config (committed)
├── vite.config.js           # Vite configuration
└── package.json
```

## Configuration

### Adding a New Assignment

1. **Ensure backend runtime exists**:
   - Create in `nlp-assignment-runtimes` repository
   - Deploy to Cloud Run
   - Note the Cloud Run URL

2. **Add to `src/config/assignments.js`**:
```javascript
export const ASSIGNMENTS = {
  // ... existing assignments

  'assignment-x-slug': {
    id: 'assignment_X',
    slug: 'assignment-x-slug',
    title: 'Assignment X Title',
    description: 'Brief description of the assignment',
    week: X,
    notebookUrl: 'https://raw.githubusercontent.com/YOUR_USERNAME/nlp-assignments/main/assignment_X/assignment_X.ipynb',
    kernelUrl: import.meta.env.VITE_ASSIGNMENT_X_KERNEL_URL || 'http://localhost:8890',
    toc: [
      { name: 'Introduction', cellId: 'cell-0' },
      { name: 'Data Prep', cellId: 'cell-3' },
      // ... extracted from notebook
    ]
  }
};
```

3. **Update `.env.production`**:
```bash
VITE_ASSIGNMENT_X_KERNEL_URL=https://assignment-X-runtime-xyz.us-west2.run.app
```

4. **Deploy**:
```bash
git add .
git commit -m "Add assignment X configuration"
git push origin main
```
Vercel auto-deploys on push to main.

### Extracting Metadata from Notebooks

To populate the `toc` array, analyze the notebook structure:

```python
# Example script to extract TOC from notebook
import json

with open('assignment_X.ipynb', 'r') as f:
    nb = json.load(f)

toc = []
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'markdown':
        for line in cell['source']:
            if line.startswith('## '):
                title = line[3:].strip()
                toc.append({
                    'name': title,
                    'cellId': f"cell-{i}"
                })
print(json.dumps(toc, indent=2))
```

## Deployment

### Vercel Deployment (Automatic)

1. Connect repository to Vercel:
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Framework preset: "Vite"

2. Configure build settings (auto-detected):
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. Push to deploy:
```bash
git push origin main
```

Vercel automatically deploys every push to main.

### Manual Deployment

```bash
npm run build
vercel --prod
```

## Development

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | React 18 | UI components |
| **Build Tool** | Vite | Fast dev server and bundling |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Jupyter Integration** | Thebe | Kernel connection and execution |
| **Routing** | React Router | Client-side routing |
| **Code Editor** | CodeMirror | Syntax highlighting |
| **Hosting** | Vercel | Serverless deployment |

## Troubleshooting

### Kernel Connection Issues

**Symptoms**: "Failed to connect to kernel" or WebSocket errors

**Solutions**:
1. Verify kernel URL in environment variables
2. Check Cloud Run service status:
   ```bash
   gcloud run services describe assignment-1-runtime --region us-west2
   ```
3. Test kernel endpoint:
   ```bash
   curl https://assignment-1-runtime-xyz.us-west2.run.app/api
   ```
4. Check browser console for CORS errors
5. Verify backend CORS configuration includes frontend domain

### Notebook Not Loading

**Symptoms**: Blank page or "Failed to load notebook"

**Solutions**:
1. Verify `notebookUrl` in `assignments.js` is correct
2. Check GitHub raw URL is publicly accessible
3. Verify notebook JSON is valid:
   ```bash
   curl https://raw.githubusercontent.com/.../notebook.ipynb | jq .
   ```
4. Check browser console for fetch errors

### Local Development Issues

**Symptoms**: Port conflicts or dev server won't start

**Solutions**:
1. Check port 5173 is available: `lsof -i :5173`
2. Kill conflicting process: `kill -9 <PID>`
3. Restart dev server: `npm run dev`
4. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Thebe Not Activating

**Symptoms**: "Activate" button doesn't work

**Solutions**:
1. Check Thebe script is loaded: View page source, search for `thebelab`
2. Verify kernel URL is reachable from browser
3. Check browser console for JavaScript errors
4. Ensure cells have `data-executable="true"` attribute

## Related Repositories

- **[nlp-assignments](https://github.com/YOUR_USERNAME/nlp-assignments)** - Notebook and data storage
- **[nlp-assignment-runtimes](https://github.com/YOUR_USERNAME/nlp-assignment-runtimes)** - Backend kernel environments

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and test locally
4. Commit: `git commit -m "Add new feature"`
5. Push: `git push origin feature/new-feature`
6. Open a Pull Request

## License

MIT
