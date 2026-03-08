export interface OptionItem {
  id: string;
  name: string;
  value: number;
  imageUrl?: string;
}

export interface SelectionState {
  activeBoxId: number | null;
  selections: Record<number, OptionItem | null>;
  totalValue: number;
}
