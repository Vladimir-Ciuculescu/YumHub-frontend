import { Text, Pressable, StyleSheet } from "react-native";
import React from "react";
import { MostPopularRecipeResponse } from "@/types/recipe.types";
import RNShadowView from "./shared/RNShadowView";
import FastImage from "react-native-fast-image";
import { Feather, Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { $sizeStyles } from "@/theme/typography";
import { View } from "react-native-ui-lib";
import RNIcon from "./shared/RNIcon";
import { useRouter } from "expo-router";
import { horizontalScale, moderateScale } from "@/utils/scale";

interface MostPopulaerRecipeItemProps {
  item: MostPopularRecipeResponse;
}

const MostPopularRecipeItem: React.FC<MostPopulaerRecipeItemProps> = ({ item }) => {
  const { photoUrl, user } = item;

  const router = useRouter();

  const goToRecipe = () => {
    router.navigate({ pathname: "/recipe_details", params: { id: item.id, userId: user.id } });
  };

  return (
    <Pressable onPress={goToRecipe}>
      <RNShadowView style={styles.$containerStyle}>
        {photoUrl ? (
          <View style={styles.$imageStyle}>
            <FastImage
              source={{
                uri: photoUrl,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.web,
              }}
              style={{ flex: 1 }}
            />
          </View>
        ) : (
          <View style={styles.$placeholderstyle}>
            <Ionicons
              name="image-outline"
              size={moderateScale(48)}
              color={colors.greyscale400}
            />
          </View>
        )}

        <View style={styles.$innerContainerStyle}>
          <Text
            style={{ ...$sizeStyles.n, fontFamily: "sofia800" }}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <View
            row
            style={{ justifyContent: "space-between" }}
          >
            <View
              row
              style={{ alignItems: "center", gap: spacing.spacing4 }}
            >
              {user.photoUrl ? (
                <FastImage
                  source={{ uri: user.photoUrl }}
                  style={styles.$userImageStyle}
                />
              ) : (
                <View style={styles.$userImagePlaceholderStyle}>
                  <Feather
                    name="user"
                    size={15}
                    color={colors.greyscale50}
                  />
                </View>
              )}
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.$ownerNameStyle}
              >
                {`${item.user.lastName}`}
              </Text>
            </View>
            <View
              row
              style={{ alignItems: "center", gap: spacing.spacing4 }}
            >
              <RNIcon
                name="clock"
                height={moderateScale(18)}
                width={moderateScale(18)}
                style={{ color: colors.greyscale300 }}
              />
              <Text style={styles.$preparationTimeStyle}>{item.preparationTime}</Text>
            </View>
          </View>
        </View>
      </RNShadowView>
    </Pressable>
  );
};

export default MostPopularRecipeItem;

const styles = StyleSheet.create({
  $containerStyle: {
    height: 240,
    width: 200,
    justifyContent: "space-between",
    padding: spacing.spacing16,
  },

  $imageStyle: {
    width: "100%",
    height: "50%",
    borderRadius: spacing.spacing16,
    display: "flex",
    overflow: "hidden",
  },

  $placeholderstyle: {
    width: "100%",
    height: "50%",
    borderRadius: spacing.spacing16,
    backgroundColor: colors.greyscale200,
    justifyContent: "center",
    alignItems: "center",
  },

  $innerContainerStyle: {
    paddingTop: spacing.spacing8,
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
  },

  $userImageStyle: {
    width: horizontalScale(26),
    height: moderateScale(26),
    borderRadius: spacing.spacing16,
    borderWidth: 1,
    borderColor: colors.accent200,
  },

  $userImagePlaceholderStyle: {
    width: horizontalScale(26),
    height: moderateScale(26),
    borderRadius: spacing.spacing16,
    backgroundColor: colors.greyscale300,
    justifyContent: "center",
    alignItems: "center",
  },

  $ownerNameStyle: {
    ...$sizeStyles.xs,
    fontFamily: "sofia400",
    color: colors.greyscale300,
    maxWidth: horizontalScale(90),
  },

  $preparationTimeStyle: {
    ...$sizeStyles.xs,
    color: colors.greyscale300,
  },
});
