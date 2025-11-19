import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: "https://trayex.vercel.app/app" }}
        style={{ flex: 1 }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});