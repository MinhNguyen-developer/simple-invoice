import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Button, Checkbox, Popover, Space, Typography } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";

export interface ColumnDefinition<K extends string> {
  key: K;
  label: string;
}

export interface ColumnsPopoverExtras {
  buttonLabel?: string;
  title?: string;
  resetLabel?: string;
  emptyLabel?: string;
}

interface UseColumnsResult<K extends string> {
  columns: ColumnDefinition<K>[];
  columnVisibility: Record<K, boolean>;
  visibleColumnKeys: K[];
  columnOptions: Array<{ key: K; label: string; checked: boolean }>;
  popover: ReactNode;
  isColumnVisible: (key: K) => boolean;
  setColumnVisibility: (key: K, isVisible: boolean) => void;
  toggleColumnVisibility: (key: K) => void;
  resetColumnVisibility: () => void;
}

function createVisibilityMap<K extends string>(
  allKeys: readonly K[],
  defaultVisibleKeys: readonly K[],
): Record<K, boolean> {
  const defaultSet = new Set(defaultVisibleKeys);
  return allKeys.reduce(
    (acc, key) => {
      acc[key] = defaultSet.has(key);
      return acc;
    },
    {} as Record<K, boolean>,
  );
}

export function useColumns<K extends string>(
  columns: readonly ColumnDefinition<K>[],
  defaultVisibleKeys?: readonly K[],
  extras: ColumnsPopoverExtras = {},
): UseColumnsResult<K> {
  const allKeys = useMemo(() => columns.map((column) => column.key), [columns]);

  const visibleKeys = useMemo(
    () => defaultVisibleKeys ?? allKeys,
    [defaultVisibleKeys, allKeys],
  );

  const initialVisibility = useMemo(
    () => createVisibilityMap(allKeys, visibleKeys),
    [allKeys, visibleKeys],
  );

  const [columnVisibility, setColumnVisibilityState] =
    useState<Record<K, boolean>>(initialVisibility);

  const visibleColumnKeys = useMemo(
    () => allKeys.filter((key) => columnVisibility[key]),
    [allKeys, columnVisibility],
  );

  const setColumnVisibility = (key: K, isVisible: boolean) => {
    setColumnVisibilityState((prev) => ({ ...prev, [key]: isVisible }));
  };

  const toggleColumnVisibility = (key: K) => {
    setColumnVisibilityState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetColumnVisibility = () => {
    setColumnVisibilityState(initialVisibility);
  };

  const isColumnVisible = (key: K) => !!columnVisibility[key];

  const labels = {
    buttonLabel: extras.buttonLabel ?? "Columns",
    title: extras.title ?? "Toggle Columns",
    resetLabel: extras.resetLabel ?? "Reset",
    emptyLabel: extras.emptyLabel ?? "No columns available",
  };

  const columnOptions = useMemo(
    () =>
      columns.map((column) => ({
        key: column.key,
        label: column.label,
        checked: !!columnVisibility[column.key],
      })),
    [columns, columnVisibility],
  );

  const popoverContent = (
    <Space direction="vertical" size="small">
      <Typography.Text strong>{labels.title}</Typography.Text>
      {columnOptions.length === 0 ? (
        <Typography.Text type="secondary">{labels.emptyLabel}</Typography.Text>
      ) : (
        columnOptions.map((option) => (
          <Checkbox
            key={option.key}
            checked={option.checked}
            onChange={(e) => setColumnVisibility(option.key, e.target.checked)}
          >
            {option.label}
          </Checkbox>
        ))
      )}
      <Button size="small" onClick={resetColumnVisibility}>
        {labels.resetLabel}
      </Button>
    </Space>
  );

  const popover = (
    <Popover trigger="click" placement="bottomRight" content={popoverContent}>
      <Button icon={<UnorderedListOutlined />}>{labels.buttonLabel}</Button>
    </Popover>
  );

  return {
    columns: [...columns],
    columnVisibility,
    visibleColumnKeys,
    columnOptions,
    popover,
    isColumnVisible,
    setColumnVisibility,
    toggleColumnVisibility,
    resetColumnVisibility,
  };
}
