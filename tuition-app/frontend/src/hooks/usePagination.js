import { useState } from 'react';

export default function usePagination(defaultPageSize = 15) {
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [total,    setTotal]    = useState(0);

  const reset = () => setPage(1);

  const paginationProps = { page, pageSize, total, onChange: setPage, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } };

  return { page, pageSize, total, setPage, setPageSize, setTotal, reset, paginationProps };
}
