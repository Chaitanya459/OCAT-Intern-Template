import React, { useEffect, useState } from 'react';
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { AssessmentService } from '../../services/AssessmentService';

export const AssessmentList = () => {
  const [ assessments, setAssessments ] = useState([]);
  const [ sorting, setSorting ] = useState([]);

  // fetch all assessments using the AssessmentService.getList function from OCAT/client/services/AssessmentService.js
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const data = await AssessmentService.getList();
        setAssessments(Array.isArray(data) ? data : []); // Always sets data to prevent crashes incase of undefined objects being returned or null
        // console.log(`Fetched data`, data);
      } catch (error) {
        console.log(`Failed to fetch Data`, error);
        setAssessments([]);
      }
    };
    fetchAssessments();
  }, []);
  // Defining table columns
  const columns = [
    { accessorKey: `id`, header: `ID` },
    { accessorKey: `catName`, header: `Cat Name` },
    {
      accessorKey: `catDateOfBirth`,
      cell: ({ getValue }) => {
        const v = getValue();
        // show YYYY-MM-DD or empty if missing
        return v ? new Date(v).toISOString().split(`T`)[0] : ``;
      },
      header: `Date of Birth`,
    },
    { accessorKey: `instrumentType`, header: `Instrument` },
    { accessorKey: `score`, header: `Score` },
    { accessorKey: `riskLevel`, header: `Risk` },
  ];

  // Function to color the riskLevel column based on its value
  // This function is used to set the background color of the riskLevel column cells
  // It returns a style object with the appropriate background color based on the risk level
  // The risk level can be 'low', 'medium', 'high', or undefined
  const colorcolumns = (row) => {
    const riskColors = row.original.riskLevel?.toLowerCase() || ``;
    console.log(`Risk Level`, riskColors);

    switch (riskColors) {
      case `low`:
        return { backgroundColor: `lightGreen` };
      case `medium`:
        return { backgroundColor: `orange` };
      case `high`:
        return { backgroundColor: `red` };
      default:
        return { backgroundColor: `white` };
    }
  };

  // Setting Up React Table with sorting + pagination
  const table = useReactTable({
    columns,
    data: assessments,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (!assessments?.length) {
    return <div className="container py-3">No data was found </div>;
  }

  return <div className="container py-3">
    <h3 className="mb-3">Assessment List</h3>

    <table className="table  table-striped table-bordered align-middle">
      <thead className="table-light">
        {table.getHeaderGroups().map((hg) =>
          <tr key={hg.id}>
            {hg.headers.map((header) => {
              // clicking header toggles sort
              const toggle = header.column.getToggleSortingHandler();
              const sort = header.column.getIsSorted(); // 'asc' | 'desc' | false
              return <th
                key={header.id}
                onClick={toggle}
                style={{ cursor: `pointer`, userSelect: `none` }}
                title="Click to sort"
              >
                {flexRender(header.column.columnDef.header, header.getContext())}{` `}
                {sort === `asc` ? `↑` : sort === `desc` ? `↓` : `⇅`}
              </th>;
            })}
          </tr>)}
      </thead>

      <tbody>
        {table.getRowModel().rows.map((row) =>
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => {
              // Only apply color to the "riskLevel" column
              const isRiskCol = cell.column.id === `riskLevel`;
              return <td
                key={cell.id}
                style={isRiskCol ? colorcolumns(row) : undefined}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>;
            })}
          </tr>)}
      </tbody>
    </table>

    {/* Pagination controls */}
    <div className="d-flex flex-wrap align-items-center gap-2">
      <button
        className="btn btn-outline-primary btn-sm"
        onClick={() => table.setPageIndex(0)}
        disabled={!table.getCanPreviousPage()}
      >
        « First
      </button>
      <button
        className="btn btn-outline-primary btn-sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        ‹ Prev
      </button>

      <span className="mx-2">
        Page
        {` `}
        <strong>{table.getState().pagination.pageIndex + 1}</strong>
        {` `}
        of
        {` `}
        {table.getPageCount()}
      </span>

      <button
        className="btn btn-outline-primary btn-sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next ›
      </button>
      <button
        className="btn btn-outline-primary btn-sm"
        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        disabled={!table.getCanNextPage()}
      >
        Last »
      </button>

      <select
        className="form-select form-select-sm ms-auto"
        style={{ width: 120 }}
        value={table.getState().pagination.pageSize}
        onChange={(e) => table.setPageSize(Number(e.target.value))}
      >
        {[ 5, 10, 20, 50 ].map((size) =>
          <option key={size} value={size}>
            Show {size}
          </option>)}
      </select>
    </div>
  </div>;
};
