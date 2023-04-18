import { TestBed } from "@angular/core/testing";
import { AppComponent } from "./app.component";
import { BrowserModule } from "@angular/platform-browser";
import { MatDividerModule } from "@angular/material/divider";
import {
  DsBoxModule,
  DsButtonModule,
  DsHeaderModule,
  DsImprintModule,
  DsNavigationBarModule,
  NavigationMenuModule,
  DsIconModule,
} from "@bmw-ds/components";
import { HttpClientModule } from "@angular/common/http";

describe("AppComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        BrowserModule,
        DsButtonModule,
        DsIconModule,
        HttpClientModule,
        NavigationMenuModule,
        MatDividerModule,
        DsNavigationBarModule,
        DsHeaderModule,
        DsImprintModule.forRoot({
          phone: "5555555",
          electronicContact: "change-me@bmwgroup.com",
        }),
        DsBoxModule,
        DsButtonModule,
      ],
    }).compileComponents();
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title '{{ .Env.APP_NAME }}'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual("{{ .Env.APP_NAME }}");
  });
});
