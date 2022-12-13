import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {DsButtonModule,} from '@bmw-ds/components';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {AuthenticationErrorInterceptor} from './authentication-error-interceptor';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    DsButtonModule,
    HttpClientModule
  ],
  providers: [
    {
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationErrorInterceptor,
    }
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
