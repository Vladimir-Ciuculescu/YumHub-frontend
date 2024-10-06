import {
  Text,
  Dimensions,
  StyleSheet,
  FlatList,
  ListRenderItem,
  Alert,
  Pressable,
} from "react-native";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import RNButton from "@/components/shared/RNButton";
import AntDesign from "@expo/vector-icons/AntDesign";
import { spacing } from "@/theme/spacing";
import { colors } from "@/theme/colors";
import Feather from "@expo/vector-icons/Feather";
import { View } from "react-native-ui-lib";
import { $sizeStyles } from "@/theme/typography";
import RNSegmentedControl, { SegmentItem } from "@/components/shared/RnSegmentedControl";
import IngredientsList from "@/components/IngredientsList";
import StepsList from "@/components/StepsList";
import NutritionalInfo from "@/components/NutritionalInfo";
import { useRecipe } from "@/hooks/recipes.hooks";
import { Skeleton } from "moti/skeleton";
import { MotiView } from "moti";
import { StatusBar } from "expo-status-bar";
import { IngredientItem, IngredientItemResponse } from "@/types/ingredient.types";
import { Step, StepItemResponse } from "@/types/step.types";
import useNutritionalTotals from "@/hooks/useNutritionalTotals";
import { Ionicons } from "@expo/vector-icons";
import * as DropdownMenu from "zeego/dropdown-menu";
import useRecipeStore from "@/zustand/useRecipeStore";
import FastImage from "react-native-fast-image";
import RNIcon from "@/components/shared/RNIcon";
import useUserData from "@/hooks/useUserData";
import LottieView from "lottie-react-native";
import { useIsFavorite } from "@/hooks/favorites.hooks";
import FavoritesService from "@/api/services/favorites.service";
import Toast from "react-native-toast-message";

const { height, width } = Dimensions.get("screen");

const SEGMENTS: SegmentItem[] = [{ label: "Ingredients" }, { label: "Instructions" }];

interface MenuItem {
  label: string;
  key: string;
  iosIcon: string;
  onSelect: () => void;
}

const RecipeDetails = () => {
  const ITEMS: MenuItem[] = [
    { label: "Edit", key: "edit", iosIcon: "pencil", onSelect: () => openEditModal() },
    {
      label: "Add to favorites",
      key: "favorites",
      iosIcon: "heart",
      onSelect: () => openAddToFavoritesAlert(),
    },
    { label: "Delete", key: "trash", iosIcon: "trash", onSelect: () => openDeleteAlert() },
  ];

  const [index, setIndex] = useState(0);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const addInfoAction = useRecipeStore.use.addInfoAction();
  const setIngredientsAction = useRecipeStore.use.setIngredientsAction();
  const setStepsAction = useRecipeStore.use.addStepsAction();

  const navigation = useNavigation();

  const router = useRouter();

  const heartRef = useRef<LottieView>(null);

  const inputsFlatlListRef = useRef<FlatList>(null);

  const [isFavorite, setIsFavotite] = useState(false);

  const user = useUserData();

  const { id, userId } = useLocalSearchParams<{ id: string; userId: string }>();

  const belongsToCurrentUser = parseInt(userId!) === user.id;

  const { data: recipe, isLoading } = useRecipe(parseInt(id!));

  const recipeId = recipe ? recipe.id : null;

  //This api call will not execute unless the recipe id does not exist or  the recipe does not belong to the current logged i user
  const { data: isInFavorites, isFetching } = useIsFavorite(
    { recipeId: parseInt(id!), userId: user.id },
    !!recipeId && !belongsToCurrentUser,
  );

  useFocusEffect(
    useCallback(() => {
      if (!belongsToCurrentUser && !isFetching) {
        if (isInFavorites) {
          heartRef.current?.play(140, 144);
          setIsFavotite(true);
        } else {
          heartRef.current?.reset();
        }
      }
    }, [id, isInFavorites, isFetching, belongsToCurrentUser]),
  );

  const toggleFavorite = async () => {
    const payload = { recipeId: parseInt(id!), userId: user.id };

    await FavoritesService.toggleFavoriteRecipe(payload);

    if (isFavorite) {
      heartRef.current?.reset();
    } else {
      heartRef.current?.play(30, 144);
    }

    setIsFavotite((oldValue) => !oldValue);

    Toast.show({
      type: "success",
      props: {
        title: isFavorite ? "Recipe removed from favorites !" : "Recipe added to favorites !",
        icon: (
          <AntDesign
            name="check"
            size={24}
            color={colors.greyscale50}
          />
        ),
      },
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <RNButton
          onPress={goBack}
          style={styles.$headerBtnStyle}
          iconSource={() => (
            <AntDesign
              name="close"
              size={24}
              color="black"
            />
          )}
        />
      ),
      headerTitle: "",
      headerRight: () =>
        belongsToCurrentUser ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <RNButton
                style={styles.$headerBtnStyle}
                iconSource={() => (
                  <Feather
                    name="menu"
                    size={24}
                    color="black"
                  />
                )}
              />
            </DropdownMenu.Trigger>
            {/* @ts-ignore */}
            <DropdownMenu.Content>
              {ITEMS.map((item) => (
                <DropdownMenu.Item
                  onSelect={item.onSelect}
                  key={item.key}
                >
                  <DropdownMenu.ItemTitle>{item.label}</DropdownMenu.ItemTitle>
                  <DropdownMenu.ItemIcon ios={{ name: item.iosIcon }} />
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ) : (
          <Pressable
            onPress={toggleFavorite}
            style={[
              styles.$headerBtnStyle,
              { borderRadius: spacing.spacing8, justifyContent: "center", alignItems: "center" },
            ]}
          >
            <LottieView
              loop={false}
              ref={heartRef}
              autoPlay={false}
              style={{
                //flex: 1,
                height: 50,
                width: 50,
              }}
              // Find more Lottie files at https://lottiefiles.com/featured
              source={require("../assets/gifs/heart.json")}
            />
          </Pressable>
        ),
    });
  }, [navigation, recipe, isFavorite]);

  const handleIndex = (index: number) => {
    setIndex(index);
  };

  const heightValue = height / 2;

  const goBack = () => {
    router.back();
  };

  const openAddToFavoritesAlert = () => {
    Alert.alert("Feature under development", "", [{ text: "OK" }]);
  };

  const openEditModal = () => {
    const payload = {
      id: recipe?.id,
      title: recipe!.title,
      servings: recipe!.servings,
      photo: recipe!.photoUrl || "",
      preparationTime: recipe!.preparationTime,
      type: recipe!.type,
    };

    const parsedIngredients: IngredientItem[] = recipe!.ingredients.map(
      (ingredient: IngredientItemResponse) => ({
        nutritionalInfoId: ingredient.nutritionalInfoId,
        id: ingredient.id,
        foodId: ingredient.foodId,
        measure: ingredient.unit,
        allMeasures: ingredient.allUnits,
        quantity: ingredient.quantity,
        title: ingredient.name,
        calories: ingredient.calories,
        carbs: ingredient.carbs,
        proteins: ingredient.proteins,
        fats: ingredient.fats,
      }),
    );

    const parsedSteps: Step[] = recipe!.steps.map((step: StepItemResponse) => ({
      id: step.id,
      step: step.step,
      number: step.step,
      description: step.text,
    }));

    addInfoAction(payload);
    setIngredientsAction(parsedIngredients);
    setStepsAction(parsedSteps);

    router.navigate("edit_recipe/recipe_edit_summary");
  };

  const openDeleteAlert = () => {};

  const ingredients: IngredientItem[] = recipe
    ? recipe.ingredients.map((ingredient: IngredientItemResponse) => ({
        foodId: ingredient.foodId,
        measure: ingredient.unit,
        quantity: ingredient.quantity,
        title: ingredient.name,
        calories: ingredient.calories,
        carbs: ingredient.carbs,
        proteins: ingredient.proteins,
        fats: ingredient.fats,
      }))
    : [];

  const steps: Step[] = recipe
    ? recipe.steps.map((step: StepItemResponse) => ({
        id: step.id,
        step: step.step,
        number: step.step,
        description: step.text,
      }))
    : [];

  const { totalCalories, totalCarbs, totalFats, totalProteins } = useNutritionalTotals(ingredients);

  const sections = [
    {
      section: (
        <IngredientsList
          editable={false}
          loading={isLoading}
          ingredients={ingredients}
        />
      ),
    },
    {
      section: (
        <StepsList
          loading={isLoading}
          swipeable={false}
          steps={steps}
        />
      ),
    },
  ];

  const renderItem: ListRenderItem<any> = ({ item }) => {
    return <View style={{ width }}>{item.section}</View>;
  };

  const handleSegmentIndex = (index: number) => {
    inputsFlatlListRef.current!.scrollToIndex({ index: index, animated: true });
    setSegmentIndex(index);
  };

  return (
    <>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        {isLoading || !recipe || !recipe.photoUrl ? (
          <View
            style={[
              { height: heightValue },
              styles.$imageBackgroundStyle,
              {
                backgroundColor: colors.greyscale200,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Ionicons
              name="image-outline"
              size={120}
              color={colors.greyscale400}
            />
          </View>
        ) : (
          <FastImage
            resizeMode="cover"
            source={{ uri: recipe.photoUrl, cache: FastImage.cacheControl.web }}
            style={[{ height: heightValue }, styles.$imageBackgroundStyle]}
          />
        )}
        <BottomSheet
          enableOverDrag={false}
          index={index}
          onChange={handleIndex}
          handleIndicatorStyle={styles.$bottomSheetHandleStyle}
          animateOnMount={false}
          backgroundStyle={styles.$bottomSheetBackgroundStyle}
          snapPoints={[height - heightValue + 20, "85%"]}
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.$bottomSheetScrollViewStyle}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.$contentStyle}>
              <View
                style={{
                  paddingHorizontal: spacing.spacing24,
                  gap: spacing.spacing24,
                }}
              >
                {recipe ? (
                  <>
                    {/* <Text style={[$sizeStyles.h3]}>{recipe!.title}</Text> */}
                    <View
                      row
                      style={{
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={[$sizeStyles.h3]}>{recipe!.title}</Text>

                      <View
                        row
                        style={{ gap: spacing.spacing8, alignItems: "center" }}
                      >
                        <RNIcon
                          name="clock"
                          color={colors.greyscale350}
                        />
                        <Text
                          style={{
                            ...$sizeStyles.n,
                            fontFamily: "sofia400",
                            color: colors.greyscale350,
                          }}
                        >
                          {recipe.preparationTime} Min
                        </Text>
                      </View>
                    </View>
                    <NutritionalInfo
                      nutritionInfo={{
                        totalCalories,
                        totalCarbs,
                        totalFats,
                        totalProteins,
                      }}
                    />
                  </>
                ) : (
                  <Skeleton.Group show>
                    <Skeleton
                      colorMode="light"
                      height={25}
                      width="40%"
                    />
                    <MotiView style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <MotiView style={{ gap: spacing.spacing16 }}>
                        <MotiView
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing.spacing16,
                          }}
                        >
                          <Skeleton
                            colorMode="light"
                            height={40}
                            width={40}
                          />
                          <Skeleton
                            colorMode="light"
                            height={25}
                            width={100}
                          />
                        </MotiView>
                        <MotiView
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing.spacing16,
                          }}
                        >
                          <Skeleton
                            colorMode="light"
                            height={40}
                            width={40}
                          />
                          <Skeleton
                            colorMode="light"
                            height={25}
                            width={100}
                          />
                        </MotiView>
                      </MotiView>
                      <MotiView style={{ gap: spacing.spacing16 }}>
                        <MotiView
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing.spacing16,
                          }}
                        >
                          <Skeleton
                            colorMode="light"
                            height={40}
                            width={40}
                          />
                          <Skeleton
                            colorMode="light"
                            height={25}
                            width={100}
                          />
                        </MotiView>
                        <MotiView
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing.spacing16,
                          }}
                        >
                          <Skeleton
                            colorMode="light"
                            height={40}
                            width={40}
                          />
                          <Skeleton
                            colorMode="light"
                            height={25}
                            width={100}
                          />
                        </MotiView>
                      </MotiView>
                    </MotiView>
                  </Skeleton.Group>
                )}

                <RNSegmentedControl
                  borderRadius={16}
                  segments={SEGMENTS}
                  initialIndex={segmentIndex}
                  onChangeIndex={handleSegmentIndex}
                />
              </View>

              <FlatList
                scrollEnabled={false}
                ref={inputsFlatlListRef}
                data={sections}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
              />
            </View>
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </>
  );
};

export default RecipeDetails;

const styles = StyleSheet.create({
  $containerStyle: {
    paddingBottom: 50,
  },

  $headerBtnStyle: {
    backgroundColor: "#fff",
    height: 40,
    width: 40,
  },

  $imageBackgroundStyle: {
    width: "100%",
    alignSelf: "center",
    position: "absolute",
    top: 0,
  },

  $bottomSheetHandleStyle: {
    width: 50,
    height: 5,
    borderRadius: spacing.spacing16,
  },

  $bottomSheetBackgroundStyle: {
    backgroundColor: "#fff",
    borderRadius: spacing.spacing24,
  },

  $bottomSheetScrollViewStyle: {
    paddingBottom: 50,
  },

  $contentStyle: {
    flex: 1,
    paddingTop: spacing.spacing16,
    gap: spacing.spacing24,
    backgroundColor: "white",
    overflow: "hidden",
  },
});
