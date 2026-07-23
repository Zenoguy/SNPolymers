import React from 'react';
import { Table } from '../../../components/ui';

const DocTable = ({ children }) => {
  return (
    <div className="my-6">
      <Table size="sm">
        {children}
      </Table>
    </div>
  );
};

export default DocTable;
