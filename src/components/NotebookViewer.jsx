import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import 'codemirror/theme/material-palenight.css';

const NotebookViewer = forwardRef(({ notebookUrl, kernelUrl }, ref) => {
  const containerRef = useRef(null);
  const [notebook, setNotebook] = useState(null);
  const [thebeActive, setThebeActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kernelStatus, setKernelStatus] = useState('disconnected');

  // Expose navigation method to parent via ref
  useImperativeHandle(ref, () => ({
    scrollToCell: (cellId) => {
      if (!containerRef.current) return;

      const cellElement = containerRef.current.querySelector(`[data-cell-id="${cellId}"]`);

      if (cellElement) {
        cellElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Highlight the cell briefly
        cellElement.classList.add('cell-highlight');
        setTimeout(() => {
          cellElement.classList.remove('cell-highlight');
        }, 2000);
      } else {
        console.warn(`Cell with ID ${cellId} not found`);
      }
    }
  }));

  // Load notebook JSON
  useEffect(() => {
    const loadNotebook = async () => {
      try {
        setLoading(true);
        // Convert .html URL to .ipynb
        const ipynbUrl = notebookUrl.replace('.html', '.ipynb');
        const response = await fetch(ipynbUrl);
        if (!response.ok) {
          throw new Error(`Failed to load notebook: ${response.statusText}`);
        }
        const data = await response.json();
        setNotebook(data);
        setError(null);
      } catch (err) {
        console.error('Error loading notebook:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (notebookUrl) {
      loadNotebook();
    }
  }, [notebookUrl]);

  // Activate Thebe
  const activateThebe = async () => {
    if (thebeActive) return;

    try {
      setKernelStatus('connecting');

      // Use Thebe from global window object (loaded via CDN)
      if (!window.thebelab) {
        throw new Error('Thebe library not loaded');
      }

      // Determine URLs based on kernelUrl (empty = use proxy, absolute = direct connection)
      const isProxied = !kernelUrl || kernelUrl === '';
      const baseUrl = isProxied ? window.location.origin : kernelUrl;
      const wsUrl = isProxied
        ? window.location.origin.replace('http', 'ws')
        : kernelUrl.replace('http', 'ws');

      console.log('🔌 Kernel connection mode:', isProxied ? 'PROXIED (via Vite)' : 'DIRECT');
      console.log('🔌 Base URL:', baseUrl);
      console.log('🔌 WebSocket URL:', wsUrl);

      // Debug: Check if elements exist in DOM before calling Thebe
      const executableElements = document.querySelectorAll('[data-executable="true"]');
      console.log('🔍 Found executable elements in DOM:', executableElements.length);
      executableElements.forEach((el, i) => {
        console.log(`  Element ${i}:`, el.tagName, el.textContent?.substring(0, 50) + '...');
      });

      const serverSettings = {
        baseUrl: baseUrl,
        wsUrl: wsUrl,
        token: '',
        appendToken: false
      };

      console.log('🔌 Server settings:', JSON.stringify(serverSettings, null, 2));

      const thebe = await window.thebelab.bootstrap({
        requestKernel: true,
        useBinder: false,
        useJupyterLite: false,
        serverSettings: serverSettings,  // Top level, not inside kernelOptions!
        kernelOptions: {
          name: 'python3',
          kernelName: 'python3',
        },
        selector: '[data-executable="true"]',
        codeMirrorConfig: {
          theme: 'material-palenight',
          mode: 'python',
          lineNumbers: true,
        },
      });

      setThebeActive(true);

      // Disable all Thebe buttons initially
      disableThebeButtons(true);

      console.log('🔍 Thebe object:', thebe);
      console.log('🔍 Thebe.session:', thebe?.session);
      console.log('🔍 Thebe.notebook:', thebe?.notebook);

      // Check if cells are in notebook object
      const cells = thebe?.notebook?.cells || [];
      console.log('🔍 Resolved cells:', cells);
      console.log('🔍 Resolved cells length:', cells.length);

      // Wait for kernel to connect (it happens asynchronously after bootstrap)
      const waitForKernel = () => {
        console.log('⏳ Waiting for kernel to attach...');

        // Poll for kernel connection (Thebe connects asynchronously)
        let attempts = 0;
        const maxAttempts = 150; // 30 seconds max

        const checkKernel = setInterval(() => {
          attempts++;

          // Check multiple places for kernel
          const sessionKernel = thebe?.session?.kernel;
          const firstCellKernel = cells[0]?.kernel;
          const kernel = sessionKernel || firstCellKernel;

          console.log(`⏳ Attempt ${attempts}/${maxAttempts}:`);
          console.log('   - Session kernel:', sessionKernel ? '✅ Found' : '❌ Not found');
          console.log('   - Cell kernel:', firstCellKernel ? '✅ Found' : '❌ Not found');

          if (kernel) {
            clearInterval(checkKernel);
            console.log('✅ Kernel connected!');
            console.log('✅ Kernel status:', kernel.status);

            // Listen for kernel status changes
            kernel.statusChanged.connect((_kernel, status) => {
              console.log('📡 Kernel status changed:', status);
              if (status === 'idle' || status === 'ready') {
                setKernelStatus('ready');
                disableThebeButtons(false);
              }
            });

            // Check current status
            if (kernel.status === 'idle' || kernel.status === 'ready') {
              console.log('✅ Kernel already ready!');
              setKernelStatus('ready');
              disableThebeButtons(false);
            } else {
              console.log('⏳ Kernel status:', kernel.status);
            }
          } else if (attempts >= maxAttempts) {
            clearInterval(checkKernel);
            console.error('❌ Timeout waiting for kernel connection');
            console.error('Debug info:');
            console.error('  - thebe.session:', thebe?.session);
            console.error('  - cells[0]:', cells[0]);
            setKernelStatus('error');
          }
        }, 200); // Check every 200ms
      };

      if (cells && cells.length > 0) {
        waitForKernel();
      } else {
        console.warn('⚠️ No cells found. Thebe may not have selected any elements.');
      }

      console.log('Thebe activated successfully');
    } catch (err) {
      console.error('Error activating Thebe:', err);
      setKernelStatus('error');
      disableThebeButtons(true);
    }
  };

  // Helper function to disable/enable Thebe buttons
  const disableThebeButtons = (disabled) => {
    const buttons = containerRef.current?.querySelectorAll('.thebelab-button, .thebelab-run-button, .thebelab-restart-button');
    buttons?.forEach(button => {
      button.disabled = disabled;
      if (disabled) {
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
      } else {
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
      }
    });
  };

  // Render a code cell
  const renderCodeCell = (cell, index) => {
    const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
    const cellId = cell.id || `cell-${index}`;

    return (
      <div
        key={index}
        data-cell-id={cellId}
        className="cell code-cell mb-6 bg-[var(--color-bg-secondary)] rounded-xl overflow-hidden border border-[var(--color-border-primary)] shadow-sm hover:shadow-md hover:border-[var(--color-accent-primary)]/30 transition-all duration-200"
      >
        <div className="cell-input">
          {/* Cell header */}
          <div className="flex items-center justify-between bg-[var(--color-bg-tertiary)] px-5 py-3 border-b border-[var(--color-border-primary)]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <span className="text-[var(--color-text-tertiary)] text-sm font-mono font-semibold">
                In [{cell.execution_count || ' '}]
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-tertiary)] bg-[var(--color-bg-secondary)] px-2 py-1 rounded">
                Python
              </span>
            </div>
          </div>

          {/* Code content - RAW text for Thebe to find and convert */}
          {/* Thebe will replace this with CodeMirror editor when activated */}
          <pre
            data-executable="true"
            data-language="python"
            className="p-5 overflow-x-auto font-mono text-sm bg-[var(--color-bg-secondary)] leading-relaxed text-[var(--color-text-primary)]"
          >{source}</pre>
        </div>
        {/* Thebe will insert output div here after execution */}
      </div>
    );
  };

  // Render a markdown cell
  const renderMarkdownCell = (cell, index) => {
    const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;

    return (
      <div
        key={index}
        data-cell-id={cell.id || `cell-${index}`}
        className="cell markdown-cell mb-6"
      >
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4 mt-6 pb-2 border-b border-[var(--color-border-primary)]" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3 mt-5" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2 mt-4" {...props} />,
              h4: ({node, ...props}) => <h4 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 mt-3" {...props} />,
              p: ({node, ...props}) => <p className="text-[var(--color-text-secondary)] mb-4 leading-relaxed" {...props} />,
              a: ({node, ...props}) => <a className="text-[var(--color-link)] hover:text-[var(--color-link-hover)] underline transition-colors" {...props} />,
              code: ({node, inline, ...props}) => inline
                ? <code className="bg-[var(--color-bg-tertiary)] text-[var(--color-accent-primary)] px-1.5 py-0.5 rounded text-sm font-mono border border-[var(--color-border-primary)]" {...props} />
                : <code className="block bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] p-4 rounded-lg overflow-x-auto font-mono text-sm border border-[var(--color-border-primary)]" {...props} />,
              pre: ({node, ...props}) => <pre className="bg-[var(--color-bg-secondary)] rounded-lg overflow-x-auto mb-4 border border-[var(--color-border-primary)]" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside text-[var(--color-text-secondary)] mb-4 space-y-2" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside text-[var(--color-text-secondary)] mb-4 space-y-2" {...props} />,
              li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[var(--color-accent-primary)] pl-4 italic text-[var(--color-text-secondary)] my-4 bg-[var(--color-bg-secondary)] py-2 rounded-r" {...props} />,
              table: ({node, ...props}) => <table className="w-full border-collapse border border-[var(--color-border-primary)] rounded-lg overflow-hidden mb-4" {...props} />,
              th: ({node, ...props}) => <th className="bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-semibold p-3 border border-[var(--color-border-primary)]" {...props} />,
              td: ({node, ...props}) => <td className="text-[var(--color-text-secondary)] p-3 border border-[var(--color-border-primary)]" {...props} />,
            }}
          >
            {source}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--color-bg-primary)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent-primary)] mx-auto mb-4"></div>
          <p className="text-[var(--color-text-secondary)]">Loading notebook...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--color-bg-primary)]">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-red-400 font-semibold">Error Loading Notebook</h3>
          </div>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--color-bg-primary)]">
      {/* Thebe Control Bar */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-secondary)] px-6 py-4 backdrop-blur-sm bg-opacity-95 shadow-sm">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            {!thebeActive ? (
              <button
                onClick={activateThebe}
                className="px-4 py-2 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] hover:from-[var(--color-accent-hover)] hover:to-[var(--color-accent-primary)] text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Activate Interactive Mode
              </button>
            ) : (
              <div className="flex items-center gap-3 px-4 py-2 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border-primary)]">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  kernelStatus === 'ready' ? 'bg-[var(--color-accent-primary)] animate-pulse' :
                  kernelStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`}></div>
                <span className="text-[var(--color-text-primary)] font-medium text-sm">
                  {kernelStatus === 'ready' ? 'Kernel Ready' :
                   kernelStatus === 'connecting' ? 'Connecting to Kernel...' :
                   'Kernel Error'}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Open in Google Colab Button */}
            <a
              href={`https://colab.research.google.com/github/your-username/your-repo/blob/main${notebookUrl.replace('.html', '.ipynb')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-accent-primary)] hover:text-white text-[var(--color-text-primary)] font-medium text-sm rounded-lg transition-all duration-200 border border-[var(--color-border-primary)] hover:border-[var(--color-accent-primary)] flex items-center gap-2 group"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 1.5c5.799 0 10.5 4.701 10.5 10.5S17.799 22.5 12 22.5 1.5 17.799 1.5 12 6.201 1.5 12 1.5zm-1.125 3.75a1.875 1.875 0 1 0 0 3.75 1.875 1.875 0 0 0 0-3.75zm0 1.5a.375.375 0 1 1 0 .75.375.375 0 0 1 0-.75zm-3.75 3.75a1.875 1.875 0 1 0 0 3.75 1.875 1.875 0 0 0 0-3.75zm0 1.5a.375.375 0 1 1 0 .75.375.375 0 0 1 0-.75zm7.5 0a1.875 1.875 0 1 0 0 3.75 1.875 1.875 0 0 0 0-3.75zm0 1.5a.375.375 0 1 1 0 .75.375.375 0 0 1 0-.75zm-3.75 3.75a1.875 1.875 0 1 0 0 3.75 1.875 1.875 0 0 0 0-3.75zm0 1.5a.375.375 0 1 1 0 .75.375.375 0 0 1 0-.75z"/>
              </svg>
              <span className="hidden sm:inline">Open in Colab</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Notebook Content */}
      <div ref={containerRef} className="notebook-container p-8 max-w-5xl mx-auto">
        {/* Cells */}
        {notebook?.cells?.map((cell, index) => {
          if (cell.cell_type === 'code') {
            return renderCodeCell(cell, index);
          } else if (cell.cell_type === 'markdown') {
            return renderMarkdownCell(cell, index);
          }
          return null;
        })}
      </div>
    </div>
  );
});

NotebookViewer.displayName = 'NotebookViewer';

export default NotebookViewer;
