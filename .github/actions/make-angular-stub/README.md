# Make [Angular](https://angular.io) Stub

# [`templates`](./templates)

The templates folder contains a set of Go templates that can be evaluated with
e.g. [gomplate](https://github.com/hairyhenderson/gomplate)

To test a template locally, first install gomplate locally, e.g. with npm

```bash
npm install --location=global gomplate
```

Then execute a template with
```bash
< .github/actions/make-angular-stub/templates/workflows/ci.yaml NAME=ci gomplate
```
