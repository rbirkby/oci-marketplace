# OCI Marketplace

Implementation of the [OCI Distribution specification](https://github.com/opencontainers/distribution-spec/tree/main/conformance) in NodeJS/TypeScript.

## Compatibility

[![](https://github.com/rbirkby/oci-marketplace/workflows/oci-distribution-conformance/badge.svg)](https://github.com/rbirkby/oci-marketplace/actions?query=workflow%3Aoci-distribution-conformance)

- In-memory only storage
- Validated against the OCI Distribution conformance suite only
- 70 tests pass, 4 fail (referrer)

### Debugging

```
PINO_LOG_LEVEL=debug DEBUG=express:* npm run start
```
