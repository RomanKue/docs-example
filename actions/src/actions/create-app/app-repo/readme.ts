import {AppSpec} from '../../../lib/unity/app-spec.js';

export const createReadme = (appSpec: Readonly<AppSpec>) => `
# ${appSpec.name}
`.trim();

