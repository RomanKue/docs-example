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

 * CPU ≤ 1000 milli cores
 * Memory ≤ 1024MiB
