import {AppSpec} from '../app-spec.js';
import {ReadonlyDeep} from 'type-fest';

export const createReadme = (appSpec: ReadonlyDeep<AppSpec>) => `
# ${appSpec.name}

## Configuration

A UNITY app is configured via one [YAML](https://yaml.org) file per environment.

 * [unity-app.int.yaml](./unity-app.int.yaml) is the configuration that should be deployed on the int stage.
 * [unity-app.prod.yaml](./unity-app.prod.yaml) is the configuration that should be deployed on the prod stage.

Usually, these configurations differ in the image tags of your app versions.
`.trim();

