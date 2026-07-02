import { useState } from 'react';

/** Generic asc/desc sort-by-field hook for tables. */
export default function useSort(defaultField = null, defaultDir = 'asc') {
  const [sortField, setSortField] = useState(defaultField);
  const [sortDir, setSortDir] = useState(defaultDir);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  /** Sorts a copy of `data` by `accessor(row)` when `field` matches the active sort field. */
  const sortBy = (data, field, accessor) => {
    if (sortField !== field) return data;
    const sorted = [...data].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (!av && !bv) return 0;
      if (!av) return 1;
      if (!bv) return -1;
      return new Date(av) - new Date(bv);
    });
    return sortDir === 'asc' ? sorted : sorted.reverse();
  };

  return { sortField, sortDir, toggleSort, sortBy };
}
