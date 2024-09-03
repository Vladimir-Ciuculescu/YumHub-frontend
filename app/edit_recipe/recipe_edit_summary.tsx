import {
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ListRenderItem,
  Dimensions,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { $sizeStyles } from "@/theme/typography";
import { View } from "react-native-ui-lib";
import RnInput from "@/components/shared/RNInput";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { spacing } from "@/theme/spacing";
import { colors } from "@/theme/colors";
import FastImage from "react-native-fast-image";
import RNButton from "@/components/shared/RNButton";
import { Formik, FormikProps, FormikValues } from "formik";
import { recipeEditSchema } from "@/yup/recipe-edit.schema";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as ImagePicker from "expo-image-picker";
import RNSegmentedControl, { SegmentItem } from "@/components/shared/RnSegmentedControl";
import IngredientsList from "@/components/IngredientsList";
import StepsList from "@/components/StepsList";
import { IngredientItem } from "@/types/ingredient.types";
import { Step } from "@/types/step.types";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useRecipeStore from "@/zustand/useRecipeStore";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDeleteRecipeImageMutation,
  useEditRecipeMutation,
  useUploadToS3Mutation,
} from "@/hooks/recipes.hooks";
import useUserData from "@/hooks/useUserData";
import { AddPhotoRequest } from "@/types/s3.types";
import { EditRecipeRequest, RecipeBriefResponse } from "@/types/recipe.types";
import Toast from "react-native-toast-message";
import toastConfig from "@/components/Toast/ToastConfing";
import RNIcon from "@/components/shared/RNIcon";

const { width } = Dimensions.get("screen");

const SEGMENTS: SegmentItem[] = [{ label: "Ingredients" }, { label: "Instructions" }];
export const getImageUrlWithCacheBuster = (url: string) => {
  const timestamp = new Date().getTime();
  return `${url}?t=${timestamp}`;
};

export default function RecipeEditSummary() {
  const router = useRouter();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const user = useUserData();

  const recipedId = useRecipeStore.use.id!();
  const title = useRecipeStore.use.title();
  const servings = useRecipeStore.use.servings();
  const photo = useRecipeStore.use.photo();
  const ingredients = useRecipeStore.use.ingredients();
  const steps = useRecipeStore.use.steps();
  const removeStepAction = useRecipeStore.use.removeStepAction();
  const removeIngredientAction = useRecipeStore.use.removeIngredientAction();
  const { showActionSheetWithOptions } = useActionSheet();
  const [segmentIndex, setSegmentIndex] = useState(0);
  const inputsFlatlListRef = useRef<FlatList>(null);

  //List of ids that needs to be deleted from DB if ingredients are deleted from FE
  const [ingredientIds, setingredientIds] = useState<number[]>([]);
  const [nutritionalInfoIds, setNutritionalInfoIds] = useState<number[]>([]);
  const [stepsIds, setStepsIds] = useState<number[]>([]);

  const { mutateAsync: editRecipeMutation, isPending: editRecipePending } = useEditRecipeMutation();
  const { mutateAsync: uploadToS3Mutation, isPending: uploadToS3Pending } = useUploadToS3Mutation();
  const { mutateAsync: deleteRecipeImageMutation, isPending: deleteRecipeImagePending } =
    useDeleteRecipeImageMutation();

  const isLoading = editRecipePending || uploadToS3Pending || deleteRecipeImagePending;

  const formikRef = useRef<FormikProps<any>>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () =>
        isLoading ? (
          <ActivityIndicator color={colors.accent200} />
        ) : (
          <Pressable
            onPress={() => {
              if (formikRef.current) {
                formikRef.current.submitForm();
              }
            }}
          >
            <Text style={[{ ...$sizeStyles.l }, { color: colors.accent200 }]}>Save</Text>
          </Pressable>
        ),
      headerRight: () => (
        <RNButton
          onPress={cancel}
          link
          iconSource={() => (
            <AntDesign
              name="close"
              size={24}
              color="black"
            />
          )}
        />
      ),
      headerTitle: () => <Text style={[$sizeStyles.h3]}>Edit recipe</Text>,
    });
  }, [navigation, isLoading]);

  const onDeleteIngredient = useCallback((ingredient: IngredientItem) => {
    removeIngredientAction(ingredient);
    setingredientIds((oldValue) => [...oldValue, ingredient.id!]);
    setNutritionalInfoIds((oldValue) => [...oldValue, ingredient.nutritionalInfoId!]);
  }, []);

  const onDeleteStep = useCallback((step: Step) => {
    setStepsIds((oldValue) => [...oldValue, step.id!]);
    removeStepAction(step);
  }, []);

  const onEditIngreidient = (ingredient: IngredientItem) => {
    router.navigate({
      pathname: "edit_recipe/recipe_edit_ingredient",
      params: { ingredient: JSON.stringify(ingredient) },
    });
  };

  const onEditStep = (step: Step) => {
    router.navigate({
      pathname: "edit_recipe/recipe_edit_step",
      params: { step: JSON.stringify(step) },
    });
  };

  const sections = [
    {
      section: (
        <IngredientsList
          editable
          loading={false}
          onDelete={onDeleteIngredient}
          onEdit={onEditIngreidient}
          ingredients={ingredients}
        />
      ),
    },
    {
      section: (
        <StepsList
          onDelete={onDeleteStep}
          onEdit={onEditStep}
          swipeable
          loading={false}
          steps={steps}
        />
      ),
    },
  ];

  const renderItem: ListRenderItem<any> = ({ item }) => {
    return <View style={{ width: width }}>{item.section}</View>;
  };

  const cancel = () => {
    router.back();
  };

  const initialValues = {
    title,
    servings: servings.toString(),
    photoUrl: photo,
  };

  const handleSegmentIndex = (index: number) => {
    inputsFlatlListRef.current!.scrollToIndex({ index: index, animated: true });
    setSegmentIndex(index);
  };

  const openGallery = async (setFieldValue: (label: string, value: string) => void) => {
    const response = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (response.canceled) {
      return;
    }

    const [image] = response.assets!;

    setFieldValue("photoUrl", image.uri);
  };

  const removePhoto = (setFieldValue: (label: string, value: string) => void) => {
    setFieldValue("photoUrl", "");
  };

  const openSheet = (setFieldValue: (label: string, value: string) => void) => {
    const options = ["Choose anoher photo", "Remove photo", "Cancel"];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      //@ts-ignore
      (selectedIndex: number) => {
        switch (selectedIndex) {
          case 0:
            openGallery(setFieldValue);
            break;

          case 1:
            removePhoto(setFieldValue);
            break;
        }
      },
    );
  };

  const handleSave = async (values: FormikValues) => {
    if (!ingredients.length || !steps.length) {
      Toast.show({
        type: "error",
        props: {
          msg: "Each recipe must have at least one ingredient and one step",
          icon: (
            <RNIcon
              name="cook"
              color={colors.greyscale50}
            />
          ),
        },
      });

      return;
    }

    const { title, servings, photoUrl } = values;

    try {
      let photo = "";

      if (photoUrl) {
        const uploadToS3Payload: AddPhotoRequest = {
          userId: user.id,
          id: recipedId!,
          photoUrl,
        };
        const url = await uploadToS3Mutation(uploadToS3Payload);
        photo = url;
      } else {
        const removeRecipeImageFromS3Payload = {
          userId: user.id,
          recipeId: recipedId!,
        };

        await deleteRecipeImageMutation(removeRecipeImageFromS3Payload);
      }

      const recipe = {
        id: recipedId!,
        title,
        servings: parseInt(servings),
        photoUrl: photo,
        ingredients,
        steps,
      };

      let payload: EditRecipeRequest = { recipe };

      //If ingredients were deleted from FE, append to payload the list of ids that needs to be deleted
      if (ingredientIds.length) {
        payload.ingredientsIds = ingredientIds;
      }

      if (nutritionalInfoIds.length) {
        payload.nutritionalInfoIds = nutritionalInfoIds;
      }

      //If steps were deleted from FE, append to payload the list of ids that needs to be deleted
      if (stepsIds.length) {
        payload.stepsIds = stepsIds;
      }

      await editRecipeMutation(payload);

      //Update the recipe details screen with the new data
      queryClient.setQueryData(["recipe"], (oldData: any) => {
        const updatedRecipe = {
          ...oldData.recipe,
          photoUrl: getImageUrlWithCacheBuster(oldData.photoUrl),
          title: payload.recipe.title,
          ingredients: payload.recipe.ingredients?.map((ingredient) => ({
            ...ingredient,
            allUnits: ingredient.allMeasures,
            name: ingredient.title,
            unit: ingredient.measure,
          })),
          steps: payload.recipe.steps?.map((step) => ({
            id: step.id,
            step: step.step,
            text: step.description,
          })),
        };

        return { ...oldData, ...updatedRecipe };
      });

      //Update the my recipes request
      queryClient.setQueryData(["recipes-per-user"], (oldData: RecipeBriefResponse[]) => {
        return oldData.map((recipe) =>
          recipe.id === recipedId
            ? {
                ...recipe,
                title: payload.recipe.title,
                servings: payload.recipe.servings,
                photoUrl: getImageUrlWithCacheBuster(payload.recipe.photoUrl),
              }
            : recipe,
        );
      });

      router.back();
    } catch (error) {
      console.error("Could not edit recipe !:", error);
    }
  };

  return (
    <GestureHandlerRootView>
      <KeyboardAwareScrollView
        extraScrollHeight={160}
        enableAutomaticScroll
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.$containerStyle}
      >
        {Platform.OS === "android" && <StatusBar style="dark" />}

        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          onSubmit={handleSave}
          validationSchema={recipeEditSchema}
        >
          {({ values, handleSubmit, handleChange, setFieldValue, dirty, isValid }) => {
            return (
              <View style={{ width: "100%", gap: spacing.spacing32 }}>
                <View
                  style={{
                    width: "100%",
                    gap: spacing.spacing32,
                    paddingHorizontal: spacing.spacing24,
                  }}
                >
                  <RnInput
                    value={values.title}
                    onChangeText={handleChange("title")}
                    label="Title"
                    placeholder="Title"
                    wrapperStyle={{ width: "100%" }}
                  />
                  <RnInput
                    value={values.servings}
                    onChangeText={handleChange("servings")}
                    keyboardType="numeric"
                    label="Servings"
                    placeholder="Servings"
                    wrapperStyle={{ width: "100%" }}
                  />

                  {!values.photoUrl ? (
                    <RNButton
                      onPress={() => openGallery(setFieldValue)}
                      label="Add photo"
                      style={styles.$addPhotoBtnStye}
                      labelStyle={[{ color: colors.greyscale50 }, $sizeStyles.l]}
                      iconSource={() => (
                        <FontAwesome
                          name="photo"
                          size={20}
                          color={colors.greyscale50}
                        />
                      )}
                    />
                  ) : (
                    <View style={{ width: "100%", height: 183 }}>
                      <Pressable
                        onPress={() => openSheet(setFieldValue)}
                        style={styles.$removePhotoBtnStyle}
                      >
                        <AntDesign
                          name="close"
                          size={24}
                          color={colors.greyscale50}
                        />
                      </Pressable>

                      <FastImage
                        style={styles.$imageStyle}
                        source={{
                          uri: values.photoUrl,
                          priority: FastImage.priority.normal,
                        }}
                      />
                    </View>
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
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={renderItem}
                />
              </View>
            );
          }}
        </Formik>
      </KeyboardAwareScrollView>
      <Toast
        config={toastConfig}
        visibilityTime={3000}
        position="bottom"
        bottomOffset={-50}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  $containerStyle: {
    alignItems: "center",
    paddingBottom: 100,
    flexGrow: 1,
    gap: spacing.spacing24,
    paddingTop: spacing.spacing24,
  },

  $addPhotoBtnStye: {
    backgroundColor: colors.accent200,
    width: "100%",
    borderColor: colors.accent200,
    borderWidth: 2,
    borderStyle: "solid",
  },

  $removePhotoBtnStyle: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 40,
    height: 40,
    backgroundColor: colors.accent400,
    borderRadius: 12,
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  $imageStyle: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
});
