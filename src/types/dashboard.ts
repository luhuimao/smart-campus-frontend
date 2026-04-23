export interface NavItem {
  id: string;
  label: string;
  icon?: string;
  isActive?: boolean;
  isFolder?: boolean;
  children?: NavItem[];
}

export interface ShortcutItem {
  id: string;
  label: string;
  iconGradient: string;
}

export interface ShortcutPanel {
  title: string;
  items: ShortcutItem[];
}

export interface TabItem {
  id: string;
  label: string;
  columns?: string[];
}
