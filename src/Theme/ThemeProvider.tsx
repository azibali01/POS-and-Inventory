import { MantineProvider, type MantineThemeOverride } from "@mantine/core";
import "@mantine/core/styles.css";
import type { PropsWithChildren } from "react";

const theme: MantineThemeOverride = {
  fontFamily:
    "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
};

type Props = PropsWithChildren;

const ThemeProvider = (props: Props) => {
  return <MantineProvider theme={theme}>{props.children}</MantineProvider>;
};

export default ThemeProvider;
