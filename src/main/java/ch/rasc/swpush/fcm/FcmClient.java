package ch.rasc.swpush.fcm;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import org.springframework.stereotype.Service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.TopicManagementResponse;
import com.google.firebase.messaging.WebpushConfig;
import com.google.firebase.messaging.WebpushNotification;

import ch.rasc.swpush.Application;
import ch.rasc.swpush.FcmSettings;

@Service
public class FcmClient {

  public FcmClient(FcmSettings settings) {
    Path p = Paths.get(settings.getServiceAccountFile());
    try (InputStream serviceAccount = Files.newInputStream(p)) {
      FirebaseOptions options = new FirebaseOptions.Builder()
          .setCredentials(GoogleCredentials.fromStream(serviceAccount)).build();

      FirebaseApp.initializeApp(options);
    }
    catch (IOException e) {
      Application.logger.error("init fcm", e);
    }
  }

  public void send(Map<String, String> data)
      throws InterruptedException, ExecutionException {

//    Message message = Message.builder().putAllData(data).setTopic("chuck")
//        .setWebpushConfig(WebpushConfig.builder().putHeader("ttl", "300")
//            .setNotification(new WebpushNotification("Superchat nofication (server)",
//                "This is a message from the superchat app (server)" , "mail2.png"))
//            .build())
//        .build();

    var message = toMessage(data);

    String response = FirebaseMessaging.getInstance().sendAsync(message).get();
    System.out.println("Sent message: " + response);
  }

  private Message toMessage(Map<String, String> data) {
      var builder = Message.builder();

      builder.putAllData(data);
      builder.setTopic("chuck");
      builder.setWebpushConfig(getWebpushConfig());

      return builder.build();
  }

  private WebpushConfig getWebpushConfig() {
    var builder = WebpushConfig.builder();
    builder.putHeader("ttl","300");
    builder.setNotification(getWebpushNotification());

    return builder.build();
  }

  private WebpushNotification getWebpushNotification() {
     var builder = WebpushNotification.builder();
     builder.setTitle("Superchat nofication (server)");
     builder.setBody("This is a message from the superchat app (server)");
     builder.setIcon("sc_logo.png");
     builder.addAction(getGoToConversationAction());
     return builder.build();
  }

  private WebpushNotification.Action getGoToConversationAction() {
      var action =  new WebpushNotification.Action("Go to superchat app","Go");
      return action;
  }

  public void subscribe(String topic, String clientToken) {
    try {
      TopicManagementResponse response = FirebaseMessaging.getInstance()
          .subscribeToTopicAsync(Collections.singletonList(clientToken), topic).get();
      System.out
          .println(response.getSuccessCount() + " tokens were subscribed successfully");
    }
    catch (InterruptedException | ExecutionException e) {
      Application.logger.error("subscribe", e);
    }
  }
}
