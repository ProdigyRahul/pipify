/**
 * Music Categories
 *
 * This array defines various music genres and categories.
 * Each string represents a distinct music category such as "Pop", "Hip-Hop/Rap", "Rock", etc.
 * The "Others" category serves as a catch-all for genres not explicitly listed.
 */
export const categories = [
  "Pop",
  "Hip-Hop/Rap",
  "Rock",
  "Electronic/Dance",
  "R&B",
  "Latin",
  "Country",
  "Jazz",
  "Classical",
  "Indie",
  "Metal",
  "Folk",
  "Blues",
  "Reggae",
  "K-Pop",
  "Alternative",
  "Punk",
  "Soul",
  "Funk",
  "Ambient",
  "Others",
];

/**
 * Categories Types
 *
 * This type defines a union of string literals representing specific music genres.
 * It ensures type safety by listing all categories defined in the 'categories' array.
 * Adding or removing categories in 'categories' should also be reflected here to maintain consistency.
 */
export type categoriesTypes =
  | "Pop"
  | "Hip-Hop/Rap"
  | "Rock"
  | "Electronic/Dance"
  | "R&B"
  | "Latin"
  | "Country"
  | "Jazz"
  | "Classical"
  | "Indie"
  | "Metal"
  | "Folk"
  | "Blues"
  | "Reggae"
  | "K-Pop"
  | "Alternative"
  | "Punk"
  | "Soul"
  | "Funk"
  | "Ambient"
  | "Others";
