import "@glideapps/glide-data-grid/dist/index.css";
import { getColorScheme } from "@/utils/classnames";
import { useDarkMode } from "@/components/hooks/use-dark-mode";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataEditor, {
  Item,
  Theme,
  GridCell,
  GridColumn,
  GridCellKind,
  GridColumnIcon,
} from "@glideapps/glide-data-grid";

export type CellValue = string | number | undefined | null;

export type Cell = Record<string, CellValue>;

export type ColumnType = "string" | "number" | "id";

export type ColumnDef = {
  name: string;
  type: ColumnType;
};

export type Column<T extends Cell> = Record<keyof T, ColumnType>;

export type DataGridValue = { data: Cell[]; columns: ColumnDef[] };

/**
 * we only use these 3 column icon, for this use case
 * everything is text
 */
const icon: Record<ColumnType, string> = {
  id: GridColumnIcon.HeaderRowID,
  number: GridColumnIcon.HeaderNumber,
  string: GridColumnIcon.HeaderString,
};

/**
 * transform column to GridColum (array)
 */
const createGridColumns = (columns: ColumnDef[]): GridColumn[] =>
  columns.map((col, index) => ({
    id: `col_${index}`,
    width: 120,
    title: col.name,
    icon: icon[col.type],
  }));

/**
 * creating cells based on it's column type
 */
const createCell = (type: ColumnType, value: CellValue = ""): GridCell => {
  if (value === null)
    return {
      data: "NULL",
      style: "faded",
      readonly: true,
      allowOverlay: false,
      kind: GridCellKind.RowID,
    };

  switch (type) {
    case "id":
      return {
        readonly: true,
        allowOverlay: false,
        data: value.toString(),
        kind: GridCellKind.RowID,
      };
    case "number":
      return {
        readonly: true,
        allowOverlay: false,
        contentAlign: "right",
        data: value as number,
        kind: GridCellKind.Number,
        displayData: value.toString(),
      };
    default:
      return {
        readonly: true,
        allowOverlay: false,
        data: value.toString(),
        kind: GridCellKind.Text,
        displayData: value.toString(),
      };
  }
};

/**
 * generic everywhere
 */
interface DataViewerProps {
  data: Cell[];
  columns: ColumnDef[];
}

/**
 * Custom dataviewer from DataGrid
 */
export const DataViewer = ({
  data,
  columns: columnDefs,
}: DataViewerProps) => {
  const { isDarkMode } = useDarkMode();

  const [columns, setColumns] = useState(createGridColumns(columnDefs));

  /**
   * update columns when cols params change
   */
  useEffect(() => {
    setColumns(createGridColumns(columnDefs));
  }, [columnDefs]);

  /**
   * resize column size function
   */
  const onColumnResize = useCallback((column: GridColumn, newSize: number) => {
    setColumns((prev) => {
      const index = prev.findIndex((col) => col.id === column.id);
      const newColumns = [...prev];
      newColumns.splice(index, 1, {
        ...prev[index],
        width: newSize,
      });
      return newColumns;
    });
  }, []);

  /**
   * get content component to get value for each cell
   * do not remove optional chaining, idk this is strange
   */
  const getContent = useCallback(
    (cell: Item): GridCell => {
      const [col, row] = cell;

      const columnDef = columnDefs[col];
      const key = `col_${col}`;

      const rowCell = data[row]?.[key];

      // Safety check for undefined columnDef
      if (!columnDef) {
        console.error(`Column definition not found for index ${col}. Total columns: ${columnDefs.length}`);
        return createCell("string", "");
      }

      return createCell(columnDef.type, rowCell);
    },
    [columnDefs, data]
  );

  /**
   * theme handler with shadcn
   */
  const theme = useMemo<Partial<Theme>>(() => {
    const colors = getColorScheme();

    return isDarkMode
      ? {
          bgCell: colors["--muted"],
          bgHeader: colors["--background"],
          bgHeaderHovered: colors["--accent"],
          bgHeaderHasFocus: colors["--accent"],
          textHeader: colors["--foreground"],
          bgIconHeader: colors["--foreground"],
          fgIconHeader: colors["--background"],
          borderColor: colors["--border"],
          accentFg: colors["--primary-foreground"],
          accentColor: colors["--primary"],
          accentLight: colors["--accent"],
          textDark: colors["--foreground"],
          textMedium: colors["--foreground"],
          textLight: colors["--foreground"],
        }
      : {
          bgCell: colors["--muted"],
          bgHeader: colors["--background"],
          bgHeaderHovered: colors["--accent"],
          bgHeaderHasFocus: colors["--accent"],
          textHeader: colors["--foreground"],
          bgIconHeader: colors["--foreground"],
          fgIconHeader: colors["--background"],
          borderColor: colors["--border"],
          accentFg: colors["--primary-foreground"],
          accentColor: colors["--primary"],
          accentLight: colors["--accent"],
          textDark: colors["--foreground"],
          textMedium: colors["--foreground"],
          textLight: colors["--foreground"],
        };
  }, [isDarkMode]);

  return (
    <div className="relative flex w-full flex-col">
      <DataEditor
        width="100%"
        theme={theme}
        columns={columns}
        rows={data.length}
        showSearch={false}
        rowMarkers="number"
        smoothScrollY={true}
        smoothScrollX={true}
        getCellContent={getContent}
        className={"size-full flex-1"}
        onColumnResize={onColumnResize}
      />
      <div className="fixed inset-x-0 top-0 z-[999]" />
    </div>
  );
};
