import React, { useMemo, useState } from "react";
import styled from "styled-components";
import type { LucideIcon } from "lucide-react";

/**
 * SortingModal
 * --------------------------------------------------------------------
 * A reusable, static modal-like card for configuring sorting.
 * - Accepts a list of sorting options (icon + label).
 * - Clicking a row selects the active sort field (shows accent border).
 * - Full-width order toggle (Ascending / Descending) with a top border.
 * - Confirm button returns the current selection to the parent.
 * - Uses only the provided CSS variables (e.g., var(--bg-primary)).
 */

export type SortOrder = "asc" | "desc";

export type SortingItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export type SortingConfig = {
  id: string;
  order: SortOrder;
};

export interface SortingModalProps {
  /** All available sorting options to show as rows */
  items: SortingItem[];

  /** Initial values (uncontrolled) */
  defaultSelectedId?: string;
  defaultOrder?: SortOrder;

  /** Optional controlled values */
  selectedId?: string;
  order?: SortOrder;

  /** Event callbacks */
  onChangeSelected?: (id: string) => void;
  onChangeOrder?: (order: SortOrder) => void;
  onConfirm: (config: SortingConfig) => void;

  /** Optional UI labels */
  title?: string;
  confirmLabel?: string;

  className?: string;
}

export default function SortingModal({
  items,
  defaultSelectedId,
  defaultOrder = "asc",
  selectedId,
  order,
  onChangeSelected,
  onChangeOrder,
  onConfirm,
  title = "Sort by",
  confirmLabel = "Confirm",
  className,
}: SortingModalProps) {
  // Uncontrolled internal state with optional controlled overrides
  const [internalSelected, setInternalSelected] = useState<string | undefined>(
    defaultSelectedId ?? items[0]?.id
  );
  const [internalOrder, setInternalOrder] = useState<SortOrder>(defaultOrder);

  const activeId = selectedId ?? internalSelected;
  const activeOrder = order ?? internalOrder;

  const setSelected = (id: string) => {
    onChangeSelected ? onChangeSelected(id) : setInternalSelected(id);
  };
  const setOrder = (next: SortOrder) => {
    onChangeOrder ? onChangeOrder(next) : setInternalOrder(next);
  };

  const rows = useMemo(
    () =>
      items.map((it) => {
        const SelectedIcon = it.icon;
        const isSelected = activeId === it.id;
        return (
          <Row
            key={it.id}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            $selected={isSelected}
            onClick={() => setSelected(it.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelected(it.id);
              }
            }}
          >
            <IconWrap aria-hidden>
              <SelectedIcon size={18} strokeWidth={2} />
            </IconWrap>
            <RowLabel>{it.label}</RowLabel>
          </Row>
        );
      }),
    [items, activeId]
  );

  const handleConfirm = () => {
    if (!activeId) return;
    onConfirm({ id: activeId, order: activeOrder });
  };

  return (
    <Card className={className} role="dialog" aria-label="Sort options">
      <TopSection>
        <Header>
          <HeaderTitle>{title}</HeaderTitle>
        </Header>
        <List>{rows}</List>
      </TopSection>

      {/* Footer: order toggle (full width with top border) + confirm */}
      <Footer>
        <ConfirmBtn
          type="button"
          onClick={handleConfirm}
          disabled={!activeId}
          aria-disabled={!activeId}
        >
          {confirmLabel}
        </ConfirmBtn>
        <OrderToggle aria-label="Sort order">
          <ToggleBtn
            type="button"
            aria-pressed={activeOrder === "asc"}
            $active={activeOrder === "asc"}
            onClick={() => setOrder("asc")}
          >
            Ascending
          </ToggleBtn>
          <ToggleBtn
            type="button"
            aria-pressed={activeOrder === "desc"}
            $active={activeOrder === "desc"}
            onClick={() => setOrder("desc")}
          >
            Descending
          </ToggleBtn>
        </OrderToggle>
      </Footer>
    </Card>
  );
}

/* =======================
   styled-components
   ======================= */

const Card = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 320px;
  max-width: 100%;
  height: 50%;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-bg);
  border-radius: 16px;
  overflow: hidden;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 14px 16px 8px 16px;
  border-bottom: 1px solid var(--border-bg);
  background: var(--bg-secondary);
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 8px;
  background: var(--bg-primary);
`;

const Row = styled.button<{ $selected?: boolean }>`
  display: grid;
  grid-template-columns: 24px 1fr;
  align-items: center;
  gap: 10px;

  width: 100%;
  text-align: left;
  border-radius: 12px;
  border: 1.5px solid
    ${({ $selected }) =>
      $selected ? "var(--accent-primary)" : "var(--border-bg)"};
  background: ${({ $selected }) =>
    $selected ? "var(--bg-tertiary)" : "var(--bg-primary)"};
  padding: 10px 12px;

  cursor: pointer;
  transition: border-color 120ms ease, background-color 120ms ease,
    transform 80ms ease;

  &:hover {
    background: ${({ $selected }) =>
      $selected ? "var(--bg-tertiary)" : "var(--hover-bg)"};
    border-color: ${({ $selected }) =>
      $selected ? "var(--accent-primary)" : "var(--border-outline)"};
  }
  &:focus-visible {
    outline: 2px solid var(--hover-primary);
    outline-offset: 2px;
  }
  &:active {
    transform: translateY(0.5px);
  }
`;

const IconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
`;

const RowLabel = styled.span`
  font-size: 14px;
  color: var(--text-primary);
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OrderToggle = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid var(--border-bg);
  background: var(--bg-secondary);
`;

const ToggleBtn = styled.button<{ $active: boolean }>`
  padding: 12px 10px;
  border: none;
  background: ${({ $active }) => ($active ? "var(--hover-bg)" : "transparent")};
  font-size: 13px;
  font-weight: 600;
  color: ${({ $active }) =>
    $active ? "var(--text-primary)" : "var(--text-muted)"};
  cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease;

  &:first-child {
    border-right: 1px solid var(--border-bg);
  }

  &:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--hover-primary);
    outline-offset: -2px;
  }
`;

const ConfirmBtn = styled.button`
  margin: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--primary-action);
  background: var(--primary-action);
  color: var(--text-inverted);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 120ms ease, filter 120ms ease;

  &:hover {
    filter: brightness(0.98);
  }

  &:disabled,
  &[aria-disabled="true"] {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--hover-primary);
    outline-offset: 2px;
  }
`;
