export interface NavItem {
  id: string;
  url: string;
  icon?: string;
  title: string;
  description?: string;
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}
