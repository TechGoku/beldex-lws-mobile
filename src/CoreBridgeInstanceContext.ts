import React from 'react';

interface CoreBridgeInstanceContextScheme {
    beldex_utils: any;
    set_Utils_data: any;
    hostedMoneroAPIClient: any;
    backgroundAPIResponseParser: any;
    nettype: number | string;
    apiUrl: string;
    version: number | string;
    name: string
}

export const CoreBridgeInstanceContext = React.createContext<CoreBridgeInstanceContextScheme>({} as CoreBridgeInstanceContextScheme)