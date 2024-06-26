import { colors } from "@/theme/colors";
import {
  ActivityIndicator,
  ImageStyle,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import { Button, ButtonProps } from "react-native-ui-lib";
import RNIcon from "./RNIcon";
import { ImageSourceType } from "react-native-ui-lib/src/components/image";
import { spacing } from "@/theme/spacing";

interface RNButtonProps extends TouchableOpacityProps {
  link?: boolean;
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  iconSource?:
    | ImageSourceType
    | ((iconStyle?: StyleProp<ImageStyle>[] | undefined) => JSX.Element)
    | null;
}

export default function RNButton(props: RNButtonProps) {
  const { link, label, labelStyle, style, loading, iconSource, ...rest } = props;

  const buttonProps: ButtonProps = { ...rest };

  if (loading) {
    buttonProps.iconSource = () => (
      <ActivityIndicator color={link ? colors.brandPrimary : colors.greyscale50} />
    );
  } else {
    buttonProps.label = label;
  }

  return (
    <Button
      iconSource={iconSource}
      disabled={buttonProps.disabled || loading}
      link={link || false}
      labelStyle={[styles.$baselabelStyle, link ? styles.$linkLabelStyle : {}, labelStyle]}
      style={[
        styles.$baseViewStyle,
        !link && styles.$containedViewStyle,
        (loading || buttonProps.disabled) && styles.$loading,
        style,
      ]}
      {...buttonProps}
    />
  );
}

const styles = StyleSheet.create({
  $baseViewStyle: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    //height: 54,
    gap: spacing.spacing16,
  },

  $containedViewStyle: {
    backgroundColor: colors.brandPrimary,
  },

  $loading: {
    opacity: 0.7,
  },

  $baselabelStyle: {
    fontSize: 16,
    fontFamily: "sofia800",
    fontStyle: "normal",
  },

  $linkLabelStyle: {
    color: colors.brandPrimary,
  },
});
