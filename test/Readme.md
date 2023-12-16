# Conformance suites

Run against this code using:

### OCI Distribution conformance suite

```bash
docker build -f ./oci-conformance.Dockerfile . -t oci-conformance
docker run oci-conformance
```

```bash
docker build -f ./oci-conformance.bun.Dockerfile . -t oci-conformance.bun
docker run oci-conformance.bun
```
