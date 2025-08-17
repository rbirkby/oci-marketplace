# OCI Marketplace

Implementation of the [OCI Distribution specification](https://github.com/opencontainers/distribution-spec/tree/main/conformance) in NodeJS/TypeScript.

## Compatibility

[![](https://github.com/rbirkby/oci-marketplace/actions/workflows/node.js.yml/badge.svg)](https://github.com/rbirkby/oci-marketplace/actions?query=workflow%3Anode.js)

- In-memory only storage
- Validated against the OCI Distribution conformance suite only

### Debugging

```
PINO_LOG_LEVEL=debug DEBUG=express:* npm run start
```

Visit http://localhost:3000/debug/health or http://localhost:3000/debug/dashboard
