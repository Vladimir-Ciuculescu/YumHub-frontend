import { AddRecipeRequest, GetRecipesByUserRequest, RecipeResponse } from "@/types/recipe.types";
import { handleError } from "../handleError";
import { axiosInstance } from "..";
import { RECIPES } from "../constants";

const RecipeService = {
  addRecipe: async (payload: AddRecipeRequest) => {
    try {
      const { data } = await axiosInstance.post(`/${RECIPES}/add`, payload);

      return data;
    } catch (error) {
      throw handleError(error);
    }
  },

  getRecipesByUser: async (params: GetRecipesByUserRequest) => {
    try {
      const { data } = await axiosInstance.get(`/${RECIPES}/user-recipes`, { params });
      return data;
    } catch (error) {
      throw handleError(error);
    }
  },

  getRecipe: async (recipeId: number): Promise<RecipeResponse> => {
    try {
      const { data } = await axiosInstance.get(`/${RECIPES}/${recipeId}`);
      return data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default RecipeService;