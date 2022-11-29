import {ReadonlyDeep} from 'type-fest';
import {NewAppIssue} from '../issues/new-app/new-app-issue.js';
import {repoName} from '../app-spec.js';
import {angularStubName, quarkusStubName} from '../config.js';
import {trimEmptyLines} from '../../strings/whitespace.js';

export const createJsonSchemas = () => `
<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="JsonSchemaMappingsProjectConfiguration">
    <state>
      <map>
        <entry key="unity-app.schema">
          <value>
            <SchemaInfo>
              <option name="generatedName" value="New Schema" />
              <option name="name" value="unity-app.schema" />
              <option name="relativePathToSchema" value="https://unity.bmwgroup.net/unity/unity-app.schema.json" />
              <option name="schemaVersion" value="JSON Schema version 7" />
              <option name="patterns">
                <list>
                  <Item>
                    <option name="pattern" value="true" />
                    <option name="path" value="unity-app.**.yaml" />
                    <option name="mappingKind" value="Pattern" />
                  </Item>
                </list>
              </option>
            </SchemaInfo>
          </value>
        </entry>
      </map>
    </state>
  </component>
</project>
`.trim();

export const createVcs = () => `
<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="VcsDirectoryMappings">
    <mapping directory="" vcs="Git" />
  </component>
</project>
`.trim();

export const createEncodings = () => `
<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="Encoding" defaultCharsetForPropertiesFiles="UTF-8">
    <file url="PROJECT" charset="UTF-8" />
  </component>
</project>
`.trim();

export const createModules = (newAppIssue: ReadonlyDeep<NewAppIssue>) => trimEmptyLines(`
<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="ProjectModuleManager">
    <modules>
      <module fileurl="file://$PROJECT_DIR$/.idea/${repoName(newAppIssue.appSpec?.name)}.iml" filepath="$PROJECT_DIR$/.idea/${repoName(newAppIssue.appSpec?.name)}.iml" />
      ${newAppIssue.generateQuarkusStub ? `<module fileurl="file://$PROJECT_DIR$/${quarkusStubName}/${quarkusStubName}.iml" filepath="$PROJECT_DIR$/${quarkusStubName}/${quarkusStubName}.iml" />` : ''}
      ${newAppIssue.generateAngularStub ? `<module fileurl="file://$PROJECT_DIR$/${angularStubName}/${angularStubName}.iml" filepath="$PROJECT_DIR$/${angularStubName}/${angularStubName}.iml" />` : ''}
    </modules>
  </component>
</project>
`.trim());

export const createAngularModule = () => trimEmptyLines(`
<?xml version="1.0" encoding="UTF-8"?>
<module type="WEB_MODULE" version="4">
  <component name="NewModuleRootManager" inherit-compiler-output="true">
    <exclude-output />
    <content url="file://$MODULE_DIR$">
      <excludeFolder url="file://$MODULE_DIR$/dist" />
      <excludeFolder url="file://$MODULE_DIR$/tmp" />
    </content>
    <orderEntry type="inheritedJdk" />
    <orderEntry type="sourceFolder" forTests="false" />
  </component>
</module>
`.trim());

export const createQuarkusModule = () => trimEmptyLines(`
<?xml version="1.0" encoding="UTF-8"?>
<module org.jetbrains.idea.maven.project.MavenProjectsManager.isMavenModule="true" type="JAVA_MODULE" version="4">
  <component name="NewModuleRootManager" LANGUAGE_LEVEL="JDK_17">
    <output url="file://$MODULE_DIR$/target/classes" />
    <output-test url="file://$MODULE_DIR$/target/test-classes" />
    <content url="file://$MODULE_DIR$">
      <sourceFolder url="file://$MODULE_DIR$/src/main/java" isTestSource="false" />
      <sourceFolder url="file://$MODULE_DIR$/src/main/resources" type="java-resource" />
      <sourceFolder url="file://$MODULE_DIR$/src/test/java" isTestSource="true" />
      <excludeFolder url="file://$MODULE_DIR$/target" />
    </content>
    <orderEntry type="inheritedJdk" />
    <orderEntry type="sourceFolder" forTests="false" />
  </component>
</module>
`.trim());
