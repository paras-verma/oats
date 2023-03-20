export interface IOpenApiSpec {
  openapi: string;
  info: {
    title: string;
    description?: string;
    version: string;
    contact?: {
      name?: string;
      email?: string;
      url?: string;
    };
    license?: {
      name: string;
      url?: string;
    };
  };
  servers?: Array<{
    url: string;
    description?: string;
    variables?: {
      [key: string]: {
        default: string;
        description?: string;
        enum?: string[];
      };
    };
  }>;
  paths: {
    [path: string]: {
      [method: string]: {
        tags?: string[];
        summary?: string;
        description?: string;
        operationId?: string;
        parameters?: Array<{
          name: string;
          in: string;
          description?: string;
          required?: boolean;
          schema?: any;
          example?: any;
          deprecated?: boolean;
        }>;
        requestBody?: {
          description?: string;
          content: {
            [mediaType: string]: {
              schema?: any;
              example?: any;
            };
          };
          required?: boolean;
        };
        responses: {
          [statusCode: string]: {
            description: string;
            content?: {
              [mediaType: string]: {
                schema?: any;
                example?: any;
              };
            };
            headers?: {
              [headerName: string]: {
                description: string;
                schema?: any;
                example?: any;
              };
            };
          };
        };
      };
    };
  };
  components?: {
    schemas?: {
      [schemaName: string]: any;
    };
    responses?: {
      [responseName: string]: any;
    };
    parameters?: {
      [parameterName: string]: any;
    };
    examples?: {
      [exampleName: string]: any;
    };
    requestBodies?: {
      [requestBodyName: string]: any;
    };
    headers?: {
      [headerName: string]: any;
    };
    securitySchemes?: {
      [securitySchemeName: string]: any;
    };
    links?: {
      [linkName: string]: any;
    };
    callbacks?: {
      [callbackName: string]: any;
    };
  };
  security?: Array<{
    [securitySchemeName: string]: string[];
  }>;
  tags?: Array<{
    name: string;
    description?: string;
    externalDocs?: {
      description?: string;
      url: string;
    };
  }>;
  externalDocs?: {
    description?: string;
    url: string;
  };
}
