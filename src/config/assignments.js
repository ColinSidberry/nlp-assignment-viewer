// Assignment configuration for NLP viewer
// Each assignment has its own kernel backend and notebook

export const ASSIGNMENTS = {
  'bayes-sentimentanalysis': {
    id: 'assignment_1',
    slug: 'bayes-sentimentanalysis',
    title: 'Prefix Expansion',
    description: 'Build an autocomplete system using frequency-based word rankings from Shakespeare text',
    week: 1,

    // Notebook configuration
    notebookUrl: '/assignments/assignment_1/assignment_1.ipynb',

    // Kernel configuration
    // Docker container includes nginx CORS proxy on port 8888
    kernelUrl: import.meta.env.VITE_ASSIGNMENT_1_KERNEL_URL || 'http://localhost:8888',

    // Table of Contents structure
    toc: {
      title: 'Prefix Expansion',
      assignment: 'assignment_1',
      week_assigned: 1,
      ml_stage: [
        {
          name: 'Data Prep',
          cell_id: 'c8a63d33',
          substage: [
            {
              name: 'Cleaning',
              cell_id: 'c8a63d33'
            },
            {
              name: 'Tokenization',
              cell_id: 'c8a63d33'
            }
          ]
        },
        {
          name: 'Tokenization',
          cell_id: 'c8a63d33'
        },
        {
          name: 'Model Training',
          cell_id: 'c8a63d33'
        },
        {
          name: 'Autocomplete Prediction',
          cell_id: '8f88d040'
        },
        {
          name: 'Test Examples',
          cell_id: '790e9d15'
        },
        {
          name: 'Interactive Widget',
          cell_id: 'dff5f361'
        }
      ]
    }
  },

  'ngram-language-models': {
    id: 'assignment_4',
    slug: 'ngram-language-models',
    title: 'N-gram Language Models',
    description: 'Build probabilistic language models with smoothing and interpolation techniques',
    week: 5,

    // Notebook configuration
    notebookUrl: '/assignments/assignment_4/assignment_4.ipynb',

    // Kernel configuration
    // Docker container includes nginx CORS proxy on port 8890 (avoiding conflict with assignment-1)
    kernelUrl: import.meta.env.VITE_ASSIGNMENT_4_KERNEL_URL || 'http://localhost:8890',

    // Table of Contents structure
    toc: {
      title: 'N-gram Language Models',
      assignment: 'assignment_4',
      week_assigned: 5,
      ml_stage: [
        {
          name: 'Data Prep',
          substage: [
            {
              name: 'Corpus Loading',
              cell_id: 'cell-3',
              type: 'code'
            },
            {
              name: 'Vocabulary Building',
              cell_id: 'cell-6',
              type: 'code'
            }
          ]
        },
        {
          name: 'Feature Extraction',
          substage: [
            {
              name: 'N-gram Extraction',
              cell_id: 'cell-3',
              type: 'code'
            },
            {
              name: 'Count Statistics',
              cell_id: 'cell-3',
              type: 'code'
            }
          ]
        },
        {
          name: 'Model Training',
          substage: [
            {
              name: 'Probability Estimation',
              cell_id: 'cell-4',
              type: 'code'
            },
            {
              name: 'Smoothing (Laplace)',
              cell_id: 'cell-6',
              type: 'code'
            },
            {
              name: 'Smoothing (Add-k)',
              cell_id: 'cell-10',
              type: 'code'
            },
            {
              name: 'Interpolation',
              cell_id: 'cell-12',
              type: 'code'
            }
          ]
        },
        {
          name: 'Evaluation & Fine-tuning',
          substage: [
            {
              name: 'Perplexity',
              cell_id: 'cell-8',
              type: 'code'
            },
            {
              name: 'Hyperparameter Tuning',
              cell_id: 'cell-10',
              type: 'code'
            }
          ]
        },
        {
          name: 'Deployment & Inference',
          substage: [
            {
              name: 'Pipeline Demo',
              cell_id: 'cell-14',
              type: 'code'
            }
          ]
        }
      ]
    }
  }
};

// Helper function to get assignment by slug
export const getAssignment = (slug) => {
  return ASSIGNMENTS[slug] || null;
};

// Helper function to get all assignments as array
export const getAllAssignments = () => {
  return Object.values(ASSIGNMENTS);
};
