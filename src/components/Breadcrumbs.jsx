import React from 'react';

const Breadcrumbs = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <svg className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-primary)] transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className={index === items.length - 1 ? 'text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-tertiary)]'}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
