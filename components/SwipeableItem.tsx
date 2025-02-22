import React, { useCallback, useRef } from "react";
import { LayoutChangeEvent, DimensionValue, Pressable, StyleSheet } from "react-native";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { View } from "react-native-ui-lib";
import { colors } from "@/theme/colors";
import ReanimatedSwipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import RNIcon from "./shared/RNIcon";
import { useFocusEffect } from "expo-router";

type action = "delete" | "edit";

const ITEM_OFFSET = 64;

interface SwipeableListItemProps {
  onDelete?: () => void;
  onEdit?: () => void;
  children: React.ReactNode;
  actions: action[];
}

const SwipeableListItem: React.FC<SwipeableListItemProps> = (props) => {
  const { onDelete, onEdit, children, actions } = props;

  const swipeabeRef = useRef<SwipeableMethods>(null);

  const heightValue = useSharedValue<undefined | DimensionValue>("auto");

  const containerStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
  }));

  useFocusEffect(
    useCallback(() => {
      return () => {
        setTimeout(() => {
          if (swipeabeRef && swipeabeRef.current) {
            swipeabeRef.current!.reset();
          }
        }, 100);
      };
    }, []),
  );

  const deleteItem = () => {
    heightValue.value = withTiming(0, { duration: 300 }, (isFinished) => {
      if (isFinished) {
        runOnJS(onDelete!)();
      }
    });
  };

  const editItem = () => {
    onEdit!();
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (heightValue.value === "auto") {
      heightValue.value = height;
    }
  };

  const renderRightActions = (_: SharedValue<number>, drag: SharedValue<number>) => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + ITEM_OFFSET * actions.length }],
      };
    });

    return (
      <View style={{ width: ITEM_OFFSET * actions.length, flexDirection: "row" }}>
        {actions.map((action, key) => {
          let icon;
          let backgroundColor;

          switch (action) {
            case "delete":
              icon = (
                <Pressable
                  style={styles.$actionContainerStyle}
                  onPress={deleteItem}
                >
                  <RNIcon
                    name="trash"
                    color={colors.greyscale50}
                  />
                </Pressable>
              );
              backgroundColor = colors.red600;
              break;

            case "edit":
              icon = (
                <Pressable
                  style={styles.$actionContainerStyle}
                  onPress={editItem}
                >
                  <RNIcon
                    name="edit"
                    color={colors.greyscale50}
                  />
                </Pressable>
              );
              backgroundColor = colors.accent200;
          }

          return (
            <Animated.View
              key={`${action}-${key}`}
              style={[{ flex: 1 }, animatedStyle]}
            >
              <Pressable
                style={[
                  {
                    alignItems: "center",
                    flex: 1,
                    justifyContent: "center",
                    backgroundColor,
                  },
                  { width: ITEM_OFFSET },
                ]}
              >
                {icon}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  return (
    <ReanimatedSwipeable
      ref={swipeabeRef}
      overshootRight={false}
      friction={2}
      leftThreshold={80}
      enableTrackpadTwoFingerGesture
      rightThreshold={40}
      renderRightActions={renderRightActions}
    >
      <Animated.View
        style={[containerStyle]}
        onLayout={handleLayout}
      >
        <View row>{children}</View>
      </Animated.View>
    </ReanimatedSwipeable>
  );
};

export default SwipeableListItem;

const styles = StyleSheet.create({
  $actionContainerStyle: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
