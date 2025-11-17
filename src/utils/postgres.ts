import { types } from "@electric-sql/pglite";
import { Results } from "@electric-sql/pglite";
import {
  Cell,
  CellValue,
  Column,
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
): DataGridValue<Cell>[] => {
  return results
    .filter((result) => result.rows !== undefined)
    .map((result) => {
      // Track column name occurrences to handle duplicates
      const nameCount: Record<string, number> = {};
      const columnMapping: Array<{
        uniqueKey: string;
        originalName: string;
        type: ColumnType;
      }> = [];

      // Create unique keys for each column, handling duplicates
      result.fields.forEach((field) => {
        const type = columnTransformer[field.dataTypeID] || "string";
        const originalName = field.name;

        // Check if this name already exists
        if (nameCount[originalName] === undefined) {
          nameCount[originalName] = 1;
          columnMapping.push({
            uniqueKey: originalName,
            originalName,
            type,
          });
        } else {
          // Handle duplicate: append _2, _3, etc.
          nameCount[originalName]++;
          const uniqueKey = `${originalName}_${nameCount[originalName]}`;
          columnMapping.push({
            uniqueKey,
            originalName,
            type,
          });
        }
      });

      // Build column object with unique keys
      const column = columnMapping.reduce(
        (prev, curr) => {
          return { ...prev, [curr.uniqueKey]: curr.type } as Column<Cell>;
        },
        {} as Column<Cell>
      );

      // Process rows: map duplicate column values to unique keys
      const data = result.rows?.map((row) => {
        const processedRow: Cell = {};

        // Check if row is an array (PGLite raw format) or object
        const isArray = Array.isArray(row);

        // Map row values using column mapping
        columnMapping.forEach((mapping, index) => {
          let value: CellValue;

          if (isArray) {
            // Access by index if row is an array
            value = (row as CellValue[])[index];
          } else {
            // Access by original name if row is an object
            // Note: this will lose duplicate columns with same name
            value = (row as Cell)[mapping.originalName];
          }

          processedRow[mapping.uniqueKey] = value;
        });

        // Process special types (objects, arrays, etc.)
        for (const key in processedRow) {
          if (!processedRow[key]) continue;

          switch (typeof processedRow[key]) {
            case "string":
            case "number":
              continue;
            case "object":
              processedRow[key] = JSON.stringify(processedRow[key]);
              continue;
          }

          if (Array.isArray(processedRow[key])) {
            processedRow[key] = JSON.stringify(processedRow[key]);
          }
        }

        return processedRow;
      });

      return { column, data, columnMapping };
    });
};
