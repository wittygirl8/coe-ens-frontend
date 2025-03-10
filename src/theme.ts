import { createTheme, MantineColorsTuple } from '@mantine/core';

const lightBlue: MantineColorsTuple = [
  '#ebf8ff',
  '#d6edfa',
  '#a7dbf8',
  '#77c8f6',
  '#56b8f5',
  '#45aef5',
  '#3ca9f6',
  '#3093db',
  '#2383c4',
  '#0071ad',
];

const primaryColor: MantineColorsTuple = [
  '#eff6fa',
  '#e0e9ef',
  '#bcd3e0',
  '#95bbd2',
  '#76a6c5',
  '#629abe',
  '#5694bc',
  '#4680a6',
  '#3b7295',
  '#296384',
];

const secondaryColor: MantineColorsTuple = [
  '#f0f6f9',
  '#e2e8ec',
  '#c0d0db',
  '#9bb6ca',
  '#7da1bb',
  '#6993b3',
  '#5e8db0',
  '#4e7a9b',
  '#426c8b',
  '#325e7c',
];

export const theme = createTheme({
  /* Put your mantine theme override here */
  primaryColor: 'darkBlue',
  colors: {
    lightBlue,
    darkBlue: primaryColor,
    secondary: secondaryColor,
  },
});
