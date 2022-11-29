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
`.trimStart();

export const createVcs = () => `
<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="VcsDirectoryMappings">
    <mapping directory="" vcs="Git" />
  </component>
</project>
`.trimStart();

export const createEncodings = () => `
<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="Encoding" defaultCharsetForPropertiesFiles="UTF-8">
    <file url="PROJECT" charset="UTF-8" />
  </component>
</project>
`.trimStart();

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
`.trimStart());


export const createRootModule = (newAppIssue: ReadonlyDeep<NewAppIssue>) => trimEmptyLines(`
<?xml version="1.0" encoding="UTF-8"?>
<module type="JAVA_MODULE" version="4">
  <component name="Go" enabled="true" />
  <component name="NewModuleRootManager" inherit-compiler-output="true">
    <exclude-output />
    <content url="file://$MODULE_DIR$">
    </content>
    <orderEntry type="inheritedJdk" />
    <orderEntry type="sourceFolder" forTests="false" />
  </component>
</module>
`.trimStart());

export const createAngularModule = (newAppIssue: ReadonlyDeep<NewAppIssue>) => trimEmptyLines(`
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
`.trimStart());

export const createQuarkusModule = (newAppIssue: ReadonlyDeep<NewAppIssue>, javaVersion: number) => trimEmptyLines(`
<?xml version="1.0" encoding="UTF-8"?>
<module org.jetbrains.idea.maven.project.MavenProjectsManager.isMavenModule="true" type="JAVA_MODULE" version="4">
  <component name="NewModuleRootManager" LANGUAGE_LEVEL="JDK_${javaVersion}">
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
`.trimStart());

export const createMisc = (javaVersion: number) => trimEmptyLines(`
<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="MavenProjectsManager">
    <option name="originalFiles">
      <list>
        <option value="$PROJECT_DIR$/api/pom.xml" />
      </list>
    </option>
  </component>
  <component name="ProjectRootManager" version="2" languageLevel="JDK_${javaVersion}" project-jdk-name="graalvm-ce-${javaVersion}" project-jdk-type="JavaSDK" />
  <component name="ProjectType">
    <option name="id" value="jpab" />
  </component>
</project>
`.trimStart());

export const createQuarkusDevRunConfig = () => trimEmptyLines(`
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="api" type="QuarkusRunConfigurationType" factoryName="Quarkus">
    <module name="${quarkusStubName}" />
    <QsMavenRunConfiguration>
      <MavenSettings>
        <option name="myGeneralSettings" />
        <option name="myRunnerSettings" />
        <option name="myRunnerParameters">
          <MavenRunnerParameters>
            <option name="profiles">
              <set />
            </option>
            <option name="goals">
              <list>
                <option value="quarkus:dev" />
              </list>
            </option>
            <option name="pomFileName" value="pom.xml" />
            <option name="profilesMap">
              <map />
            </option>
            <option name="resolveToWorkspace" value="false" />
            <option name="workingDirPath" value="$PROJECT_DIR$/${quarkusStubName}" />
          </MavenRunnerParameters>
        </option>
      </MavenSettings>
      <targetMavenLocalRepo />
    </QsMavenRunConfiguration>
    <method v="2">
      <option name="Make" enabled="true" />
    </method>
  </configuration>
</component>
`.trimStart());

export const createNpmInstallRunConfig = () => trimEmptyLines(`
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="install" type="js.build_tools.npm" nameIsGenerated="true">
    <package-json value="$PROJECT_DIR$/${angularStubName}/package.json" />
    <command value="install" />
    <node-interpreter value="project" />
    <envs />
    <method v="2" />
  </configuration>
</component>
`.trimStart());

export const createNpmStartRunConfig = () => trimEmptyLines(`
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="start" type="js.build_tools.npm" nameIsGenerated="true">
    <package-json value="$PROJECT_DIR$/${angularStubName}/package.json" />
    <command value="start" />
    <node-interpreter value="project" />
    <envs />
    <method v="2" />
  </configuration>
</component>
`.trimStart());
