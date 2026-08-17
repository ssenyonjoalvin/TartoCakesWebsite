export type ProductOption = {
  id: string;
  name: string;
};

export type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  sizeIds: string[];
  occasionId: string | null;
  flavorId: string | null;
  occasionName: string | null;
  flavorName: string | null;
  sizeNames: string[];
  featured: boolean;
  published: boolean;
};
