<!-- DOCTOC SKIP -->

# Terms of Service

The UNITY platform offers services in a shared responsibility model.

The UNITY team is responsible for

* running the platform
* providing integration with WebEAM to offer authentication and authorization for UNITY apps.

The app developers are responsible for

* building their UNITY app
* configuring their UNITY app inside UNITY
* patching vulnerabilities inside their UNITY app

## Databases

Databases of type PostgreSQL are experimental and may be used for prototyping only.

* PostgreSQL databases must not be used in production.
* PostgreSQL databases are not backed up
* PostgreSQL databases cannot be restored

## Resources

UNITY is built for small, lean apps. That means, only apps with resource requirements within the following limits may
run on UNITY.

* CPU limit ≤ 1000 milli cores (request ≤ 500 milli cores) per container
* Memory limit ≤ 2048 MiB (request ≤ 1024 MiB) per container

## Information Protection

An app developer is granted access to secrets (tokens, passwords) and confidential information (model types, SOP,
EOP, ...).
The app developer is responsible for protecting that information according to the
[corporate security](https://contenthub-de.bmwgroup.net/web/corporatesecurity/informationsschutz-informationssicherheit)
guidelines.

Specifically, tokens, passwords or other secrets must not be sent to the end user at any time.
Data, sent to the end user, must be limited according to the need to know principle.

For data precessed in the app, the Information Classification (ICL), Information Objects (IOBs) and Privacy Impact
Assessment (PIA)  must be maintained by the app developers.

Data, classified "strictly confidential" must not be processed in a UNITY app, as the UNITY platform is not approved
for apps requiring the information security class "highest protection".

## IT Security

The app developer is responsible for maintaining the IT security documentation for the UNITY app.
This includes application clearing and managing IT risks.

Furthermore, Common Vulnerabilities and Exposures (CVEs) found in the app by automatic security scanning solutions
provided by the UNITY platform must be fixed by the app developers.

