import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Button, Checkbox, Popover, Space, Typography } from "antd";
import { FilterOutlined } from "@ant-design/icons";

export interface FilterDefinition<K extends string> {
  key: K;
  label: string;
  render: () => ReactNode;
}

export interface FiltersPopoverExtras {
  buttonLabel?: string;
  title?: string;
  resetLabel?: string;
  emptyLabel?: string;
}

interface UseFiltersResult<K extends string> {
  filters: FilterDefinition<K>[];
  filterVisibility: Record<K, boolean>;
  visibleFilterKeys: K[];
  visibleFilters: FilterDefinition<K>[];
  renderedFilters: ReactNode[];
  filterOptions: Array<{ key: K; label: string; checked: boolean }>;
  popover: ReactNode;
  isFilterVisible: (key: K) => boolean;
  setFilterVisibility: (key: K, isVisible: boolean) => void;
  toggleFilterVisibility: (key: K) => void;
  resetFilterVisibility: () => void;
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

export function useFilters<K extends string>(
  filters: readonly FilterDefinition<K>[],
  defaultVisibleKeys?: readonly K[],
  extras: FiltersPopoverExtras = {},
): UseFiltersResult<K> {
  const allKeys = useMemo(() => filters.map((filter) => filter.key), [filters]);

  const visibleKeys = useMemo(
    () => defaultVisibleKeys ?? allKeys,
    [defaultVisibleKeys, allKeys],
  );

  const initialVisibility = useMemo(
    () => createVisibilityMap(allKeys, visibleKeys),
    [allKeys, visibleKeys],
  );

  const [filterVisibility, setFilterVisibilityState] =
    useState<Record<K, boolean>>(initialVisibility);

  const visibleFilterKeys = useMemo(
    () => allKeys.filter((key) => filterVisibility[key]),
    [allKeys, filterVisibility],
  );

  const setFilterVisibility = (key: K, isVisible: boolean) => {
    setFilterVisibilityState((prev) => ({ ...prev, [key]: isVisible }));
  };

  const toggleFilterVisibility = (key: K) => {
    setFilterVisibilityState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetFilterVisibility = () => {
    setFilterVisibilityState(initialVisibility);
  };

  const isFilterVisible = (key: K) => !!filterVisibility[key];

  const labels = {
    buttonLabel: extras.buttonLabel ?? "Filters",
    title: extras.title ?? "Toggle Filters",
    resetLabel: extras.resetLabel ?? "Reset",
    emptyLabel: extras.emptyLabel ?? "No filters available",
  };

  const visibleFilters = useMemo(
    () => filters.filter((filter) => filterVisibility[filter.key]),
    [filters, filterVisibility],
  );

  const renderedFilters = useMemo(
    () => visibleFilters.map((filter) => filter.render()),
    [visibleFilters],
  );

  const filterOptions = useMemo(
    () =>
      filters.map((filter) => ({
        key: filter.key,
        label: filter.label,
        checked: !!filterVisibility[filter.key],
      })),
    [filters, filterVisibility],
  );

  const popoverContent = (
    <Space direction="vertical" size="small">
      <Typography.Text strong>{labels.title}</Typography.Text>
      {filterOptions.length === 0 ? (
        <Typography.Text type="secondary">{labels.emptyLabel}</Typography.Text>
      ) : (
        filterOptions.map((option) => (
          <Checkbox
            key={option.key}
            checked={option.checked}
            onChange={(e) => setFilterVisibility(option.key, e.target.checked)}
          >
            {option.label}
          </Checkbox>
        ))
      )}
      <Button size="small" onClick={resetFilterVisibility}>
        {labels.resetLabel}
      </Button>
    </Space>
  );

  const popover = (
    <Popover trigger="click" placement="bottomRight" content={popoverContent}>
      <Button icon={<FilterOutlined />}>{labels.buttonLabel}</Button>
    </Popover>
  );

  return {
    filters: [...filters],
    filterVisibility,
    visibleFilterKeys,
    visibleFilters,
    renderedFilters,
    filterOptions,
    popover,
    isFilterVisible,
    setFilterVisibility,
    toggleFilterVisibility,
    resetFilterVisibility,
  };
}
