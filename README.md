<h3 align="center"> maaspiar/oats </h3>

<p align="center">
OpenApi Typescript Server generator <br />
Interactive CLI to scaffold server-stubs (express-typescript) using OAS3.0 spec file
</p>

---


#### Usage

```sh
npx @maaspiar/oats api.yaml
```

#### Contents

Generated server-stub is an ExpressJs app which comes with:

- Request/Responses Valdiation
- Typescript interfaces
- Routing (only methods need to written)
- Mongoose models Generation (opt-in)
- VS-Code debugging setup (to be expanded to other IDEs)
- Deployment Scripts (AWS/GCP)

#### Update mode

This generator can accomodate updates in your api-spec. Just run the following commands and all the required types, models and routes will be implemented for you:

```sh
npx @maaspiar/oats api.yaml --update
```

> **Note**: Models and interfaces are expected to be overwritten. But as they're autogenerated by the package itself no apparent difference would be observed

#### Credits

This wouldn't be possible without the following projects:

- [@openapitoolsopenapi-generator-cli](https://www.npmjs.com/package/@openapitools/openapi-generator-cli)
- [express-openapi-validator](https://www.npmjs.com/package/express-openapi-validator)

Special thanks to team@[create-t3-app](https://github.com/t3-oss/create-t3-app) 
