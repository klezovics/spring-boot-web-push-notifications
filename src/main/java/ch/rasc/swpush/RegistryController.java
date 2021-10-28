package ch.rasc.swpush;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import ch.rasc.swpush.fcm.FcmClient;
import reactor.core.publisher.Mono;

@RestController
@CrossOrigin
public class RegistryController {

  private final FcmClient fcmClient;

  public RegistryController(FcmClient fcmClient) {
    this.fcmClient = fcmClient;
  }

  //@PostMapping(value = "/register", consumes = {MediaType.ALL_VALUE})
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public Mono<Void> register(@RequestBody Mono<String> token) {
    Application.logger.info("Request to regiester token received");
    return token.doOnNext(t -> this.fcmClient.subscribe("chuck", t)).then();
  }

  @PostMapping(value = "/register", consumes = {MediaType.ALL_VALUE})
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void register1(@RequestBody String token) {
    Application.logger.info("Request to regiester token received");
    this.fcmClient.subscribe("chuck",token);
  }

}
