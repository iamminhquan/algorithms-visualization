export interface ICategory {
  readonly slug: string;
  readonly name: string;
  readonly description: string | null;
}

export type CategorySlug = string;
