import { StyleSheet } from "react-native-unistyles";
import { breakpoints } from "./breakpoints";
import { appThemes } from "./theme";

type AppBreakpoints = typeof breakpoints;
type AppThemes = typeof appThemes;

declare module "react-native-unistyles" {
  export interface UnistylesBreakpoints extends AppBreakpoints {} // eslint-disable-line  @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {} // eslint-disable-line  @typescript-eslint/no-empty-object-type
}

StyleSheet.configure({
  themes: appThemes,
  breakpoints,
});
