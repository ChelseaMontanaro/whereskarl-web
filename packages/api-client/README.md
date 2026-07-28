# `@whereskarl/api-client`

HTTP transport and endpoint functions for Where's Karl backend APIs.

Apps resolve the API base URL from environment and inject it via `createApiClient`
or per-call `ApiClientConfig`. This package does not read `process.env`.
