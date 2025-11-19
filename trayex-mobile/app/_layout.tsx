import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export default function RootLayout() {
  return (
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});