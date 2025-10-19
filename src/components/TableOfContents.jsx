import React, { useState } from 'react';

const TableOfContents = ({ tocData, onNavigate }) => {
  const [activeId, setActiveId] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  const handleClick = (cellId) => {
    setActiveId(cellId);
    onNavigate(cellId);
  };

  const toggleExpanded = (idx) => {
    setExpandedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const isExpanded = (idx) => {
    // Default to expanded if not set
    return expandedItems[idx] !== false;
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--color-bg-primary)] px-3 py-4">
      {/* Header */}
      <div className="mb-4 px-2">
        <h2 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
          {tocData.title}
        </h2>
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
          On this page
        </h3>
      </div>

      {/* Neotoc-style Nested List */}
      <nav>
        <ul className="space-y-0.5 list-none">
          {tocData.ml_stage.map((item, idx) => {
            const hasSubstages = item.substage && item.substage.length > 0;
            const expanded = isExpanded(idx);

            return (
              <li key={idx}>
                <div className="flex items-start group">
                  {/* Toggle button or dot */}
                  {hasSubstages ? (
                    <div
                      onClick={() => toggleExpanded(idx)}
                      className={`flex-shrink-0 w-5 h-6 flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all duration-200 cursor-pointer ${
                        !expanded ? 'rotate-0' : ''
                      }`}
                      tabIndex={0}
                      role="button"
                      aria-pressed={!expanded}
                      aria-expanded={expanded}
                      aria-label="Toggle fold"
                      title=""
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 16 16"
                        className={`transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`}
                      >
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3.75 5.75L8 10.25l4.25-4.5"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-5 h-6 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <circle cx="12.1" cy="12.1" r="1" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.65} />
                      </svg>
                    </div>
                  )}

                  {/* Item link */}
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      handleClick(item.cell_id);
                    }}
                    className={`flex-1 py-1 px-2 text-sm rounded cursor-pointer transition-all duration-150 ${
                      activeId === item.cell_id
                        ? 'text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
                    }`}
                  >
                    {item.name}
                  </a>
                </div>

                {/* Substages (collapsible) */}
                {hasSubstages && expanded && (
                  <ul className="ml-5 mt-0.5 space-y-0.5 border-l border-[var(--color-border-primary)] pl-2 list-none">
                    {item.substage.map((sub, subIdx) => (
                      <li key={subIdx} className="flex items-start group">
                        <div className="flex-shrink-0 w-5 h-6 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                            <circle cx="12.1" cy="12.1" r="1" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.65} />
                          </svg>
                        </div>
                        <a
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick(sub.cell_id);
                          }}
                          className={`flex-1 py-1 px-2 text-xs rounded cursor-pointer transition-all duration-150 ${
                            activeId === sub.cell_id
                              ? 'text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10'
                              : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                          }`}
                        >
                          {sub.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default TableOfContents;
