import axios from "axios";
import axiosInstance from "..";
import { handleError } from "../handleError";

const appkey = process.env.EXPO_PUBLIC_EDAMAM_APP_KEY;
const appId = process.env.EXPO_PUBLIC_EDAMAN_APP_ID;

const FoodService = {
  searchFood: async () => {
    try {
      const { data } = await axios.get(
        `https://api.edamam.com/api/food-database/v2/parser?app_id=${appId}&app_key=${appkey}&ingr=tomato&nutrition-type=cooking`,
      );
      return data;
    } catch (error) {
      throw handleError(error);
    }
  },
};

export default FoodService;
