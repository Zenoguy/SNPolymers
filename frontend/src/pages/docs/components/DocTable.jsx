import React from 'react';

const DocTable = ({ children }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/40 my-6 no-scrollbar backdrop-blur-md shadow-2xl">
      <table className="w-full text-left border-collapse text-xs">
        {children}
      </table>
    </div>
  );
};

export default DocTable;
