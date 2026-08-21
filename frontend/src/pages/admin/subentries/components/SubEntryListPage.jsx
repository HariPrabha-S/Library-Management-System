import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, PencilLine, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_ENTRIES_OPTIONS = [5, 10, 20];

export default function SubEntryListPage({
  title,
  description,
  addButtonLabel,
  addRoute,
  searchPlaceholder,
  emptyMessage,
  itemLabel,
  items,
  onEdit,
  onDelete,
  getItemDisplayValue = (item) => item,
  getItemKey = (item) => item,
  serialLabel = 'S.No',
  entriesOptions = DEFAULT_ENTRIES_OPTIONS,
  columns,
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(entriesOptions[0] ?? 5);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, entriesPerPage]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) => {
      const value = String(getItemDisplayValue(item)).toLowerCase();
      return value.includes(query);
    });
  }, [getItemDisplayValue, items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / entriesPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + entriesPerPage);
  const tableColumns = columns?.length
    ? columns
    : [{ key: 'value', header: itemLabel, render: (item) => getItemDisplayValue(item) }];

  return (
    <div className="animate-fade-in-down">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="admin-page-heading">{title}</h1>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            {currentTime.toLocaleDateString('en-IN', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}{' '}
            • {currentTime.toLocaleTimeString('en-IN')}
          </div>
          <button
            onClick={() => navigate(addRoute)}
            className="btn btn-primary flex items-center gap-2 text-xs font-bold py-2.5 rounded-xl"
          >
            <Plus size={15} /> {addButtonLabel}
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#eef0f4] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-10 text-xs font-semibold py-2.5"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="form-input form-select text-xs font-semibold py-2.5 min-w-[90px]"
            >
              {entriesOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">entries</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-xs">
                <th className="py-3 px-4">{serialLabel}</th>
                {tableColumns.map((column) => (
                  <th key={column.key} className="py-3 px-4">{column.header}</th>
                ))}
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns.length + 2} className="py-10 text-center text-gray-400 text-sm">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => (
                  <tr key={getItemKey(item)} className="border-b last:border-none border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-600 font-semibold">
                      {startIndex + index + 1}
                    </td>
                    {tableColumns.map((column) => (
                      <td key={`${getItemKey(item)}-${column.key}`} className="py-3 px-4 text-gray-700 font-medium">
                        {column.render(item)}
                      </td>
                    ))}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                        >
                          <PencilLine size={14} /> Edit
                        </button>
                        <button
                          onClick={() => onDelete(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 px-4 py-4 border-t border-gray-100 bg-gray-50/40">
          <div className="text-xs font-semibold text-gray-500">
            Showing {filteredItems.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + entriesPerPage, filteredItems.length)} of {filteredItems.length} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold text-gray-600 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
