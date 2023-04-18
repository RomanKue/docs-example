import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import {
  DsButtonModule,
  NavigationMenuModule,
  DsNavigationBarModule,
  DsHeaderModule,
  DsImprintModule,
  DsIconModule,
} from "@bmw-ds/components";
import { MatDividerModule } from "@angular/material/divider";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { AuthenticationErrorInterceptor } from "./interceptors/authentication-error-interceptor";

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
    DsImprintModule.forRoot({
      phone: "123498765",
      electronicContact: "change-me@bmwgroup.com",
    }),
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
