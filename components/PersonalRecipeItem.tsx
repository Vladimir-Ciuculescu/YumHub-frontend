import { Text, Pressable, StyleSheet, Dimensions } from "react-native";
import React, { useState } from "react";
import { RecipeType } from "@/types/enums";
import { useRouter } from "expo-router";
import useUserData from "@/hooks/useUserData";
import RNShadowView from "./shared/RNShadowView";
import { spacing } from "@/theme/spacing";
import FastImage from "react-native-fast-image";
import { colors } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { formatFloatingValue } from "@/utils/formatFloatingValue";
import RNIcon from "./shared/RNIcon";
import { View } from "react-native-ui-lib";
import { $sizeStyles } from "@/theme/typography";

const { width: screenWidth } = Dimensions.get("window");
const numColumns = 2;
const gap = spacing.spacing16;
const paddingHorizontal = spacing.spacing24 * 2;
const itemSize = (screenWidth - paddingHorizontal - (numColumns - 1) * gap) / numColumns;

interface PersonalRecipeItemProps {
  item: {
    id: number;
    title: string;
    photoUrl?: string;
    servings: number;
    type: RecipeType;
    totalCalories: number;
    preparationTime: number;
  };
}

const PersonalRecipeItem: React.FC<PersonalRecipeItemProps> = ({ item }) => {
  const router = useRouter();

  const user = useUserData();

  const { id, title, photoUrl, totalCalories, preparationTime } = item;

  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const goToRecipe = () => {
    router.navigate({ pathname: "/recipe_details", params: { id, userId: user.id } });
  };

  return (
    <Pressable onPress={goToRecipe}>
      <RNShadowView style={styles.$recipeItemStyle}>
        <View style={styles.$containerStyle}>
          {photoUrl ? (
            <FastImage
              source={{
                uri: photoUrl,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.web,
              }}
              onLoad={handleImageLoad}
              style={styles.$imageStyle}
            />
          ) : (
            <View style={styles.$placeholderstyle}>
              <Ionicons
                name="image-outline"
                size={35}
                color={colors.greyscale400}
              />
            </View>
          )}
          <Text
            numberOfLines={2}
            style={[$sizeStyles.s, { fontFamily: "sofia800" }]}
          >
            {title}
          </Text>
          <View style={styles.$infoStyle}>
            <View
              row
              style={{ alignItems: "center", gap: spacing.spacing2 }}
            >
              <RNIcon
                name="fire"
                style={{ color: colors.greyscale300 }}
                height={15}
              />
              <Text
                style={[{ ...$sizeStyles.s, fontFamily: "sofia800", color: colors.greyscale300 }]}
              >
                {formatFloatingValue(totalCalories)} Kcal
              </Text>
            </View>
            <View
              row
              style={{ alignItems: "center", gap: spacing.spacing2 }}
            >
              <RNIcon
                name="clock"
                style={{ color: colors.greyscale300 }}
                height={15}
              />
              <Text
                style={[{ ...$sizeStyles.s, fontFamily: "sofia800", color: colors.greyscale300 }]}
              >
                {preparationTime} min
              </Text>
            </View>
          </View>
        </View>
      </RNShadowView>
    </Pressable>
  );
};

export default PersonalRecipeItem;

const styles = StyleSheet.create({
  $containerStyle: {
    height: "100%",
    width: "100%",
    gap: spacing.spacing8,
  },

  $imageStyle: {
    width: "100%",
    height: "50%",
    borderRadius: spacing.spacing16,
    display: "flex",
  },

  $placeholderstyle: {
    width: "100%",
    height: "50%",
    borderRadius: spacing.spacing16,
    backgroundColor: colors.greyscale200,
    justifyContent: "center",
    alignItems: "center",
  },

  $infoStyle: {
    flex: 1,
    justifyContent: "flex-end",
    gap: spacing.spacing4,
  },

  $recipeItemStyle: {
    width: itemSize,
    height: 198,
    padding: spacing.spacing12,
  },
});
