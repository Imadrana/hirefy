// app/components/ui/table.tsx
import React from "react";

export const Table: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <table className={className}>{children}</table>
);
export const TableHeader: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <thead className={className}>{children}</thead>
);
export const TableBody: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <tbody className={className}>{children}</tbody>
);
export const TableRow: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <tr className={className}>{children}</tr>
);
export const TableHead: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <th className={className}>{children}</th>
);
export const TableCell: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <td className={className}>{children}</td>
);
