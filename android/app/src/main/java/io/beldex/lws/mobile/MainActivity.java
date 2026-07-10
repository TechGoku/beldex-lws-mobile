package io.beldex.lws.mobile;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppProxyPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
