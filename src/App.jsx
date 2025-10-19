import { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, Link } from 'react-router-dom';
import TableOfContents from './components/TableOfContents';
import NotebookViewer from './components/NotebookViewer';
import { ASSIGNMENTS, getAllAssignments } from './config/assignments';

function AssignmentViewer() {
  const { assignmentSlug } = useParams();
  const assignment = ASSIGNMENTS[assignmentSlug];

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const notebookViewerRef = useRef(null);

  // Handle navigation from TOC to notebook cells
  const handleNavigate = (cellId) => {
    if (notebookViewerRef.current) {
      notebookViewerRef.current.scrollToCell(cellId);
    }
  };

  // Handle draggable divider
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Handle assignment not found
  if (!assignment) {
    return (
      <div className="h-screen overflow-hidden bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Assignment Not Found</h1>
          <p className="text-[var(--color-text-secondary)] mb-6">
            The assignment "{assignmentSlug}" doesn't exist.
          </p>
          <Link
            to="/"
            className="px-4 py-2 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white font-medium rounded-lg transition-all inline-block"
          >
            Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[var(--color-bg-primary)] flex relative">
      {/* Sidebar */}
      <div
        className="flex-shrink-0 border-r border-[var(--color-border-secondary)] transition-all duration-300 ease-in-out overflow-hidden"
        style={{ width: sidebarOpen ? `${sidebarWidth}px` : '0px' }}
      >
        <div className={`h-full ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}>
          <TableOfContents
            tocData={assignment.toc}
            onNavigate={handleNavigate}
          />
        </div>
      </div>

      {/* Draggable Divider */}
      {sidebarOpen && (
        <div
          onMouseDown={handleMouseDown}
          className={`w-1 hover:w-1.5 bg-transparent hover:bg-[var(--color-accent-primary)]/50 cursor-col-resize transition-all duration-150 flex-shrink-0 relative group ${
            isResizing ? 'bg-[var(--color-accent-primary)] w-1.5' : ''
          }`}
          style={{ userSelect: 'none' }}
        >
          {/* Visual indicator on hover */}
          <div className="absolute inset-y-0 -left-0.5 -right-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Circular Toggle Button - Centered Vertically */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-1/2 -translate-y-1/2 z-50 w-8 h-8 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-accent-primary)] text-[var(--color-text-secondary)] hover:text-white rounded-full border-2 border-[var(--color-border-primary)] hover:border-[var(--color-accent-primary)] transition-all duration-300 shadow-lg flex items-center justify-center"
        style={{ left: sidebarOpen ? `${sidebarWidth}px` : '0px' }}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          )}
        </svg>
      </button>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <NotebookViewer
          ref={notebookViewerRef}
          notebookUrl={assignment.notebookUrl}
          kernelUrl={assignment.kernelUrl}
        />
      </div>
    </div>
  );
}

function AssignmentList() {
  const assignments = getAllAssignments();

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">NLP Assignments</h1>
        <p className="text-[var(--color-text-secondary)] mb-8">
          Interactive notebook assignments for Natural Language Processing
        </p>

        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Link
              key={assignment.slug}
              to={`/${assignment.slug}`}
              className="block bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] hover:border-[var(--color-accent-primary)] rounded-lg p-6 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 px-2 py-1 rounded">
                      Week {assignment.week}
                    </span>
                    <h2 className="text-xl font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors">
                      {assignment.title}
                    </h2>
                  </div>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    {assignment.description}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent-primary)] transition-colors flex-shrink-0 ml-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {assignments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-tertiary)]">No assignments available yet.</p>
          </div>
        )}
      </div>
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
