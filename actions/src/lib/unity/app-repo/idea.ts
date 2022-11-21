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
