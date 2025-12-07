
export enum AppState {
  INTRO = 'INTRO',
  CATALOG = 'CATALOG',
  EXIT = 'EXIT'
}

export interface CatalogImage {
  id: string;
  url: string;
}

export const CATALOG_IMAGES: string[] = [
  "16RLSVHtZabmzHquFBzbeUM3kRH-uUnEV", // Page 1 (Cover)
  "1maO1kcJn_mDNfmVmfV1H8csz1DkQl5_j",
  "1MNZDwH-vJ_HSutoRozKRA4UeIttgKL7U",
  "1bidUdz64-buYgxW1bccEcWLzEqBEvE6Z",
  "1EL4kKCf6-42klK2EDnioz6bXGFPuOBz5",
  "1dOfDmGqdE2qf-OgqWOqNZVlpIAuSF0KO",
  "1Mktp854n0Z9ifUm07wPlG3GomEHE_uUF",
  "1m94NSYoj9SSH6lplsWXiSWif8naXPSkC",
  "1dUzFVZ69e8p_j48RVrQhDHIHJo-mj306"  // Page 9 (Final)
];

// Primary strategy: lh3.googleusercontent.com is much faster and bypasses some drive UI blocks
// We use =w2000 to request a high-res version suitable for full screen
export const getImageUrl = (id: string) => `https://lh3.googleusercontent.com/d/${id}=w2000`;

// Fallback strategy: Standard export view
export const getFallbackUrl = (id: string) => `https://drive.google.com/uc?export=view&id=${id}`;
