import { createStackNavigator } from "@react-navigation/stack";
import { withLayoutContext } from "expo-router";

const JsStack = createStackNavigator();
export const Stack = withLayoutContext(JsStack.Navigator);
