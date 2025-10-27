import React from "react";
import { Table as MantineTable } from "@mantine/core";
import type { TableProps } from "@mantine/core";
import "./app-table.css";

// Extra props supported by our AppTable wrapper.
export interface AppTableProps extends TableProps {
  withColumnBorders?: boolean;
  withRowBorders?: boolean;
}

// Lightweight wrapper that applies a consistent class and forwards props to Mantine Table.
function AppTable(props: AppTableProps) {
  const { className, withColumnBorders, withRowBorders, ...rest } = props;
  const classes = ["app-table", (className as string) || ""];
  // Enable borders by default; consumers can opt-out by passing false explicitly.
  const enableColumnBorders = withColumnBorders !== false;
  const enableRowBorders = withRowBorders !== false;
  if (enableColumnBorders) classes.push("with-column-borders");
  if (enableRowBorders) classes.push("with-row-borders");

  return (
    <MantineTable
      {...(rest as TableProps)}
      className={classes.filter(Boolean).join(" ")}
    />
  );
}

// Semantic subcomponents (thin wrappers around native elements).
function Thead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

function Tbody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

function Tr(props: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} />;
}

function Th(props: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) {
  return <th {...props} />;
}

function Td(props: React.TdHTMLAttributes<HTMLTableDataCellElement>) {
  return <td {...props} />;
}

function Tfoot(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tfoot {...props} />;
}

// Attach semantic subcomponents so consumers can use Table.Th / Table.Tr etc.
const Table = Object.assign(AppTable, {
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tfoot,
});

export { Table, Thead, Tbody, Tr, Th, Td, Tfoot };
export default Table;
