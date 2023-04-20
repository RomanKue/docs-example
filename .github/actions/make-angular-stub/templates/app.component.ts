import { DsHeaderTagConfiguration } from "@bmw-ds/components";
import { DsNavigationItem } from "@bmw-ds/components/ds-interfaces/navigation-bar.interface";
import { Component } from "@angular/core";

/**
 * Extract cookie value by name
 * @see https://stackoverflow.com/a/15724300/1458343
 */
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(";")?.shift() : undefined;
};

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  //Tag with environment for header
  environmentTagConfig: Partial<DsHeaderTagConfiguration> = {
    label: getCookie("{{ .Env.REPO }}-{{ .Env.NAME }}-environment"),
  };

  title = "{{ .Env.APP_NAME }}";

  //Navigation configuration
  navigationItems: DsNavigationItem[] = [
    {
      id: "home",
      label: "Home",
      routerLink: "/",
      icon: "apps",
    },
  ];
}
