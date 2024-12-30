import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { spacing } from "@/theme/spacing";
import { colors } from "@/theme/colors";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/scale";
import RNShadowView from "./shared/RNShadowView";
import RNIcon from "./shared/RNIcon";
import { $sizeStyles } from "@/theme/typography";

interface NotificationItemProps {}

const NotificationItem: React.FC<NotificationItemProps> = () => {
  return (
    <RNShadowView>
      <View style={styles.$containerStyle}>
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: spacing.spacing8, flex: 1 }}
        >
          <View style={styles.$iconContainerStyle}>
            <RNIcon
              name="bowl"
              color={colors.accent200}
            />
          </View>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.$notificationTextStyle}
          >
            X-ulescu has appreciated your recipe
          </Text>
        </View>
        <View
          style={{
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: verticalScale(spacing.spacing12),
          }}
        >
          <Text style={[{ marginLeft: spacing.spacing8 }, styles.$notificationTimeLapseStyle]}>
            2m ago
          </Text>
          <View
            style={{
              height: horizontalScale(8),
              width: horizontalScale(8),
              borderRadius: 16,
              backgroundColor: colors.red400,
            }}
          />
        </View>
      </View>
    </RNShadowView>
  );
};

const styles = StyleSheet.create({
  $containerStyle: {
    height: moderateScale(80),
    width: "100%",
    borderRadius: spacing.spacing16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(spacing.spacing16),
    justifyContent: "space-between",
  },

  $iconContainerStyle: {
    height: horizontalScale(48),
    width: horizontalScale(48),
    backgroundColor: colors.greyscale150,
    borderRadius: spacing.spacing8,
    justifyContent: "center",
    alignItems: "center",
  },

  $notificationTextStyle: {
    flex: 1,
    ...$sizeStyles.xs,
    fontFamily: "sofia400",
  },

  $notificationTimeLapseStyle: {
    ...$sizeStyles.xs,
    fontFamily: "sofia200",
  },
});

export default NotificationItem;
