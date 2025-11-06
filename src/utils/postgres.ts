import { types } from "@electric-sql/pglite";
import { Results } from "@electric-sql/pglite";
import {
  Cell,
  ColumnDef,
  ColumnType,
  DataGridValue,
} from "@/components/ui/data-viewer";

const columnTransformer: Record<number, ColumnType> = {
  [types.UUID]: "id",
  [types.CHAR]: "string",
  [types.BOOL]: "string",
  [types.INT2]: "number",
  [types.INT4]: "number",
  [types.INT8]: "number",
  [types.FLOAT4]: "number",
  [types.FLOAT8]: "number",
};

export const postgresTransformer = (
  results: Results[]
): DataGridValue[] => {
  return results
    .filter((result) => result.rows !== undefined)
    .map((result) => {
      // Create array of column definitions
      const columns: ColumnDef[] = result.fields.map((field) => ({
        name: field.name,
        type: columnTransformer[field.dataTypeID] || "string",
      }));

      // Transform rows to use index-based keys
      const data: Cell[] = result.rows?.map((row, rowIndex) => {
        const processedRow: Cell = {};

        // Debug: Check if row length matches fields length
        if (Array.isArray(row) && row.length !== result.fields.length) {
          console.warn(`Row ${rowIndex}: length mismatch. Row has ${row.length} values but ${result.fields.length} fields defined`);
        }

        result.fields.forEach((_field, index) => {
          const key = `col_${index}`;
          // Access by index to support duplicate column names
          let value = row[index];

          // Handle non-primitive types
          if (value && typeof value === "object") {
            value = JSON.stringify(value);
          }

          processedRow[key] = value;
        });

        return processedRow;
      }) || [];

      console.log(`Transformer result: ${columns.length} columns, ${data.length} rows`);

      return { columns, data };
    });
};
