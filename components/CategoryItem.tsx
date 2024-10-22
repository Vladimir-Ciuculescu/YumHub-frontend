import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { spacing } from "@/theme/spacing";
import { colors } from "@/theme/colors";
import FastImage from "react-native-fast-image";
import { $sizeStyles } from "@/theme/typography";

const CategoryItem: React.FC<any> = ({ category }) => {
  const { path, title } = category;

  return (
    <View style={{ alignItems: "center", gap: spacing.spacing8 }}>
      <Pressable style={styles.$containerStyle}>
        <FastImage
          source={path}
          style={{ width: 25, height: 25 }}
        />
      </Pressable>
      <Text style={styles.$titleStyle}>{title}</Text>
    </View>
  );
};

export default CategoryItem;

const styles = StyleSheet.create({
  $containerStyle: {
    height: 65,
    width: 65,
    borderRadius: spacing.spacing64,
    backgroundColor: colors.accent200,
    justifyContent: "center",
    alignItems: "center",
  },

  $titleStyle: {
    ...$sizeStyles.s,
    fontFamily: "sofia600",
  },
});