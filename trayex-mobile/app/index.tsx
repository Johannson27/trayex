import { View } from "react-native";
import { WebView } from "react-native-webview";

export default function Index() {
    return (
        <View style={{ flex: 1 }}>
            <WebView
                source={{ uri: "https://trayex.vercel.app" }}
                style={{ flex: 1 }}
                originWhitelist={["*"]}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                mixedContentMode="always"
            />
        </View>
    );
}