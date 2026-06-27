import React from 'react';

/**
 * Reusable glassmorphic Table component.
 */
const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No records found.',
  title,
  headerActions,
  pagination,
  className = '',
}) => {
  const showHeader = title || headerActions;

  // Helper for column alignment
  const getAlignClass = (align) => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  return (
    <div className={`glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/5 ${className}`}>
      {/* Table Title / Header Actions bar */}
      {showHeader && (
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          {title && (
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {title}
            </span>
          )}
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[9px] uppercase font-bold tracking-widest text-slate-400 bg-white/[0.01]">
              {columns.map((col, index) => (
                <th
                  key={col.key || index}
                  className={`p-4 ${index === 0 ? 'pl-6' : ''} ${
                    index === columns.length - 1 ? 'pr-6' : ''
                  } ${getAlignClass(col.align)} ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              /* Premium Skeleton Loader */
              [...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse">
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`p-4 ${colIndex === 0 ? 'pl-6' : ''} ${
                        colIndex === columns.length - 1 ? 'pr-6' : ''
                      }`}
                    >
                      <div className="h-4 bg-white/10 rounded w-3/4 my-1" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              /* Empty State */
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center p-20 text-slate-500 text-xs uppercase font-extrabold tracking-widest"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              /* Data Rows */
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || row._id || rowIndex}
                  className="hover:bg-white/[0.02] transition duration-200 text-slate-300"
                >
                  {columns.map((col, colIndex) => {
                    const value = row[col.key];
                    const content = col.render ? col.render(value, row, rowIndex) : value;
                    return (
                      <td
                        key={col.key || colIndex}
                        className={`p-4 ${colIndex === 0 ? 'pl-6' : ''} ${
                          colIndex === columns.length - 1 ? 'pr-6' : ''
                        } ${getAlignClass(col.align)} ${col.className || ''}`}
                      >
                        {content ?? 'N/A'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-bold tracking-wider">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total || data.length} records)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || isLoading}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-bold transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              &larr; Prev
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || isLoading}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-bold transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
