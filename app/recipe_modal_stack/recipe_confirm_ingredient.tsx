import { Text, Pressable, StyleSheet, ScrollView, Platform } from "react-native";
import React, { FC, useEffect, useLayoutEffect, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import FoodService from "@/api/services/food.service";
import RNIcon from "@/components/shared/RNIcon";
import { $sizeStyles } from "@/theme/typography";
import {
  IngredientResponse,
  NutrientDetail,
  NutrientResponse,
  NutrientsRequestPayload,
} from "@/types/ingredient";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { spacing } from "@/theme/spacing";
import { SegmentedControl, View } from "react-native-ui-lib";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { colors } from "@/theme/colors";
import RnInput from "@/components/shared/RNInput";
import { formatFloatingValue } from "@/utils/formatFloatingValue";
import RNPickerSelect from "react-native-picker-select";
import useRecipeStore from "@/zustand/useRecipeStore";
import RNSegmentedControl from "@/components/shared/RnSegmentedControl";

const nutrientsLabelMapping: any = {
  ENERC_KCAL: "Calories",
  FAT: "Fats",
  FASAT: "Total saturated fats",
  FAMS: "Monosaturated fats",
  FAPU: "Polyunsaturated fats",
  CHOCDF: "Carbohydrates",
  "CHOCDF.net": "Net Carbohydrates",
  NA: "Sodium",
  CA: "Calcium",
  MG: "Magnesium",
  K: "Potasium",
  FE: "Iron",
  ZN: "Zinc",
  P: "Phosporus",
  VITC: "Vitamin C",
  VITD: "Vitamin D",
};

const getMeasureAbbreviation = (measure: string) => {
  const measureMap: any = {
    Serving: "serving",
    Ounce: "oz",
    Spray: "spr",
    Gram: "g",
    Grain: "gr",
    Pound: "lb",
    Kilogram: "kg",
    Strip: "strip",
    Pinch: "pinch",
    Liter: "L",
    Slice: "slice",
    Handful: "handful",
    Whole: "whole",
    "Fluid ounce": "fl oz",
    Gallon: "gal",
    Pint: "pt",
    Quart: "qt",
    Milliliter: "mL",
    Drop: "drop",
    Cup: "cup",
    Tablespoon: "tbsp",
    Teaspoon: "tsp",
  };

  return measureMap[measure] || null;
};

interface NutrientItemProps {
  nutrient: [string, NutrientDetail];
}

const segments = [{ label: "Measures" }, { label: "Percentage" }];

const NutrientItem: FC<NutrientItemProps> = ({ nutrient }) => {
  const label = nutrient[0];
  const quantity = nutrient[1].quantity;
  const unitMeasure = nutrient[1].unit;

  const nutrientLabel = nutrientsLabelMapping[label] || nutrient[1].label;
  return (
    <View
      row
      style={{ justifyContent: "space-between" }}
    >
      <Text style={styles.$nutrientLabelStyle}>{nutrientLabel}</Text>
      <Text style={styles.$nutrientValueStyle}>
        {formatFloatingValue(quantity)} {unitMeasure}
      </Text>
    </View>
  );
};

export default function RecipeConfirmIngredient() {
  const { ingredient } = useLocalSearchParams<any>();
  const navigation = useNavigation();
  const router = useRouter();
  const [nutrientsInfo, setNutrientsInfo] = useState<NutrientResponse>();
  const [unitMeasure, setUnitMeasure] = useState("Gram");
  const [pickerDismissed, setPickerDismissed] = useState(true);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [quantity, setQuantity] = useState("100");
  const addIngredientAction = useRecipeStore.use.addIngredientAction();

  const parsedIngredient: IngredientResponse = JSON.parse(ingredient);

  const defaultMeasurementObject = {
    foodId: parsedIngredient.food.foodId,
    measureURI: "http://www.edamam.com/ontologies/edamam.owl#Measure_gram",
    quantity: 100,
  };

  const measures = parsedIngredient.measures
    .filter((measure) => measure.label)
    .map((measure) => ({
      label: `1 ${measure.label}`,
      value: measure.label,
      uri: measure.uri,
    }));

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable onPress={gotBack}>
          <RNIcon
            name="arrow_left"
            color={colors.brandPrimary}
          />
        </Pressable>
      ),

      headerTitle: () => <Text style={[$sizeStyles.h3]}>Confirm ingredient</Text>,
      headerRight: () => (
        <Pressable onPress={addIngredient}>
          <AntDesign
            name="check"
            size={24}
            color={colors.accent200}
          />
        </Pressable>
      ),
    });
  }, [navigation, unitMeasure, quantity, nutrientsInfo]);

  useEffect(() => {
    if (pickerDismissed || Platform.OS === "android") {
      const measure = measures.find((item) => item.value === unitMeasure);

      let payload: any = {};

      if (measure) {
        payload = {
          foodId: parsedIngredient.food.foodId,
          measureUri: measure!.uri,
          quantity: parseInt(quantity),
        };
      } else {
        payload = defaultMeasurementObject;
      }

      getNutritionData(payload.foodId, payload.measureUri, payload.quantity);
    }
  }, [pickerDismissed, unitMeasure]);

  const addIngredient = () => {
    const payload = {
      foodId: parsedIngredient.food.foodId,
      title: parsedIngredient.food.label,
      measure: unitMeasure,
      quantity: quantity,
      calories: nutrientsInfo?.totalNutrients.ENERC_KCAL!.quantity!,
      carbs: nutrientsInfo?.totalNutrients.CHOCDF!.quantity,
      proteins: nutrientsInfo?.totalNutrients.PROCNT!.quantity,
      fats: nutrientsInfo?.totalNutrients.FAT?.quantity,
    };

    addIngredientAction(payload);
    router.dismiss(2);
  };

  const getNutritionData = async (foodId: string, uri: string, quantity: number) => {
    let payload: NutrientsRequestPayload | undefined;

    try {
      payload = { foodId, measureURI: uri, quantity };
      const data = await FoodService.getNutritionData(payload);
      setNutrientsInfo(data);
    } catch (error) {
      console.log(error);
    }
  };

  const gotBack = () => {
    router.back();
  };

  const submitQuantity = async () => {
    const measure = measures.find((item) => item.value === unitMeasure);

    getNutritionData(parsedIngredient.food.foodId, measure!.uri, parseInt(quantity));
  };

  return (
    <GestureHandlerRootView>
      <ScrollView
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.$contentContainerstyle}
        style={styles.$containerStyle}
      >
        <View style={{ gap: spacing.spacing24 }}>
          <Text style={$sizeStyles.h1}>{parsedIngredient.food.label}</Text>

          <View style={styles.$baseWrapperStyle}>
            <Text style={[$sizeStyles.n, styles.$labelStyle]}>Unit measure</Text>

            <RNPickerSelect
              placeholder={{}}
              doneText="Search"
              onOpen={() => setPickerDismissed(false)}
              onClose={() => setPickerDismissed(true)}
              value={unitMeasure}
              onValueChange={setUnitMeasure}
              onDonePress={() => setPickerDismissed(true)}
              items={measures}
              style={{
                chevronUp: { display: "none" },
                chevronDown: { display: "none" },
                inputIOS: styles.$inputAndroidStyle,
                inputAndroid: styles.$inputIOSStyle,

                iconContainer: styles.$iconContainerStyle,
              }}
              useNativeAndroidPickerStyle={false}
              Icon={() => {
                return <RNIcon name="cook" />;
              }}
            />
          </View>
          <RnInput
            onSubmitEditing={submitQuantity}
            keyboardType="numeric"
            returnKeyType="done"
            onChangeText={(value: any) => setQuantity(value)}
            autoCapitalize="none"
            value={quantity}
            label="Quantity"
            placeholder="Enter quantity"
          />
          <View style={styles.$baseWrapperStyle}>
            <Text style={[$sizeStyles.h3, styles.$labelStyle]}>Nutritional information</Text>

            <RNSegmentedControl
              initialIndex={segmentIndex}
              segments={segments}
              onChangeIndex={setSegmentIndex}
            />

            {nutrientsInfo &&
              Object.entries(
                segmentIndex === 0 ? nutrientsInfo.totalNutrients : nutrientsInfo.totalDaily,
              ).map((nutrient, index, array) => {
                return (
                  <React.Fragment
                    key={`${nutrient[0]}-${nutrient[1].quantity}-${nutrient[1].unit}`}
                  >
                    <NutrientItem nutrient={nutrient} />
                    {index < array.length - 1 && <View style={styles.separator} />}
                  </React.Fragment>
                );
              })}
          </View>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  $containerStyle: {
    paddingHorizontal: spacing.spacing24,
    paddingTop: spacing.spacing24,
  },

  $contentContainerstyle: {
    flexGrow: 1,
    paddingBottom: 60,
  },

  $pickerContainerStyle: {
    borderRadius: 16,
    borderStyle: "solid",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderColor: colors.greyscale150,
    borderWidth: 2.5,
    height: 54,
    color: "red",
  },

  $baseWrapperStyle: {
    gap: spacing.spacing12,
  },

  $inputAndroidStyle: {
    height: 54,
    borderColor: colors.greyscale150,
    borderWidth: 2,
    fontFamily: "sofia800",
    paddingHorizontal: 16,
    borderRadius: 16,
    color: colors.slate900,
  },

  $inputIOSStyle: {
    height: 54,
    borderColor: colors.greyscale150,
    color: colors.slate900,
    borderWidth: 2,
    fontFamily: "sofia800",
    paddingHorizontal: 16,
    borderRadius: 16,
  },

  $iconContainerStyle: {
    top: 14,
    right: spacing.spacing16,
  },

  $labelStyle: { fontFamily: "sofia800", color: colors.greyscale500 },
  separator: {
    height: 3,
    backgroundColor: colors.accent200,
  },

  $nutrientLabelStyle: {
    ...$sizeStyles.n,
    fontFamily: "sofia800",
    color: colors.greyscale300,
  },

  $nutrientValueStyle: {
    ...$sizeStyles.n,
    color: colors.greyscale400,
    fontFamily: "sofia800",
  },

  $segmentStyle: {
    height: 54,
  },

  $segmentLabelstyle: {
    ...$sizeStyles.n,
  },
});
