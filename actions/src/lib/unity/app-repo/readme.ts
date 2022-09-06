import {AppSpec} from '../app-spec.js';

export const createReadme = (appSpec: Readonly<AppSpec>) => `
# ${appSpec.name}
`.trim();

