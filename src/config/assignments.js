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

  // Future assignments can be added here:
  // 'n-gram-models': {
  //   id: 'assignment_2',
  //   slug: 'n-gram-models',
  //   title: 'N-Gram Language Models',
  //   kernelUrl: import.meta.env.VITE_ASSIGNMENT_2_KERNEL_URL || 'http://localhost:8889',
  //   ...
  // }
};

// Helper function to get assignment by slug
export const getAssignment = (slug) => {
  return ASSIGNMENTS[slug] || null;
};

// Helper function to get all assignments as array
export const getAllAssignments = () => {
  return Object.values(ASSIGNMENTS);
};
