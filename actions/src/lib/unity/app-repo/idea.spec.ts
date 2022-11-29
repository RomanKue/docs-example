import {createModules} from './idea.js';
import {AppSpecV1Beta1} from '../app-spec.js';
import {NewAppIssue} from '../issues/new-app/new-app-issue.js';

describe('idea', () => {
  const v1beta1: AppSpecV1Beta1 = {apiVersion: 'v1beta1', name: 'foo'};
  let newAppIssue: NewAppIssue;
  describe('createModules', () => {
    it('should create modules without angular and quarkus modules when no stubs are generated', () => {
      newAppIssue = new NewAppIssue(v1beta1, true, false, false);
      expect(createModules(newAppIssue)).toContain(`
<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="ProjectModuleManager">
    <modules>
      <module fileurl="file://$PROJECT_DIR$/.idea/app-foo.iml" filepath="$PROJECT_DIR$/.idea/app-foo.iml" />
    </modules>
  </component>
</project>
`.trim());
    });
    it('should create modules with angular and quarkus modules when stubs are generated', () => {
      newAppIssue = new NewAppIssue(v1beta1, true, true, true);
      expect(createModules(newAppIssue)).toContain(`
<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="ProjectModuleManager">
    <modules>
      <module fileurl="file://$PROJECT_DIR$/.idea/app-foo.iml" filepath="$PROJECT_DIR$/.idea/app-foo.iml" />
      <module fileurl="file://$PROJECT_DIR$/api/api.iml" filepath="$PROJECT_DIR$/api/api.iml" />
      <module fileurl="file://$PROJECT_DIR$/ui/ui.iml" filepath="$PROJECT_DIR$/ui/ui.iml" />
    </modules>
  </component>
</project>
      `.trim());
    });
  });
});
