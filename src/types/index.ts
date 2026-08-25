export interface TipLink {
  label: string;
  url: string;
}

export interface Tip {
  id: string;
  category: string;
  title: string;
  content: string;
  links: TipLink[];
  createdAt: number;
}

export type TipInput = Omit<Tip, 'id' | 'createdAt'>;
