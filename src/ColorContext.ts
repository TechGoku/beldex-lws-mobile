import React from 'react';

interface ColorContextScheme {
    toggleColorMode: () => void;
}

export const ColorContext = React.createContext<ColorContextScheme>({} as ColorContextScheme)