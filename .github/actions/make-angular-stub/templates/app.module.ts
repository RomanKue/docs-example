import {isDevMode, NgModule} from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import {
  DsButtonModule,
  NavigationMenuModule,
  DsNavigationBarModule,
  DsHeaderModule,
  DsIconModule,
} from "@bmw-ds/components";
import { MatDividerModule } from "@angular/material/divider";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { AuthenticationErrorInterceptor } from "./interceptors/authentication-error-interceptor";

if (isDevMode()) {
  document.cookie = `"{{ .Env.REPO }}-{{ .Env.NAME }}-environment"=dev; Secure; SameSite=Strict; Path=/{{ .Env.APP_NAME }}/{{ .Env.NAME }}`
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    DsButtonModule,
    DsIconModule,
    HttpClientModule,
    NavigationMenuModule,
    DsNavigationBarModule,
    DsHeaderModule,
    MatDividerModule,
  ],
  providers: [
    {
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationErrorInterceptor,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
