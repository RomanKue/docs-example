import {DsHeaderTagConfiguration} from '@bmw-ds/components';
import {DsNavigationItem} from '@bmw-ds/components/ds-interfaces/navigation-bar.interface';
import {Component} from '@angular/core';

/**
 * Extract cookie value by name
 * @see https://stackoverflow.com/a/15724300/1458343
 */
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(';')?.shift() : undefined;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  //Tag with environment for header
  environmentTagConfig: Partial<DsHeaderTagConfiguration> = {label: getCookie('{{ .Env.REPO }}-{{ .Env.NAME }}-environment')};

  //Navigation configuration
  navigationItems: DsNavigationItem[] = [
    {
      label: 'Density Documentation',
      href: 'https://density.bmwgroup.net',
      target: '_blank',
      icon: 'book',
    },
    {
      label: 'Developer Resources',
      icon: 'code_box',
      children: [
        {
          label: 'Component Library',
          href: 'https://density.bmwgroup.net/components',
          target: '_blank',
        },
        {
          label: 'Density Icons',
          href: 'https://density.bmwgroup.net/foundations/icons/density-icons',
          target: '_blank',
        },
      ],
    },
    {
      label: 'Design Resources',
      href: 'https://density.bmwgroup.net/resources-downloads',
      target: '_blank',
      icon: 'figma',
    },
  ];

  title = '{{ .Env.APP_NAME }}';
}
