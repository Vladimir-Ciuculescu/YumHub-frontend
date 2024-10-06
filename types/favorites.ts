export interface GetIsInFavoritesRequest {
  userId: number;
  recipeId: number;
}

export interface ToggleFavoriteRequest {
  userId: number;
  recipeId: number;
}
