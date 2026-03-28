export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface FeaturedCategory {
  id: number;
  slug: string;
  name: string;
  image_path: string;
  is_featured: number;
  display_order: number;
  category_kind: string;
  ending_with: string;
}

export interface NearbyBusiness {
  id: number;
  slug: string;
  business_name: string;
  categories: string[];
  area_name: string;
  business_profile_image: string;
  distance_km: string;
  is_open: boolean;
  open_status: string;
}

export interface HomeCategoryNavigationState {
  categorySlug: string;
  endingWith: string;
  categoryName: string;
}

export type FeaturedCategoriesResponse = ApiResponse<FeaturedCategory[]>;
export type NearbyBusinessesResponse = ApiResponse<NearbyBusiness[]>;
