import React from 'react';
import { Pagination as AntPagination } from 'antd';

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  current,
  total,
  pageSize,
  onChange,
  onShowSizeChange,
}) => {
  return (
    <div className="flex justify-center mt-5">
      <AntPagination
        current={current}
        total={total}
        pageSize={pageSize}
        onChange={onChange}
        showSizeChanger
        showQuickJumper
        showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} elementos`}
        onShowSizeChange={onShowSizeChange}
      />
    </div>
  );
};

export default Pagination;
