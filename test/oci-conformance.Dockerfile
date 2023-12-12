FROM golang as builder

RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/opencontainers/distribution-spec.git
RUN cd distribution-spec/conformance && go test -c


FROM node

RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /go/distribution-spec/conformance/conformance.test conformance.test
RUN git clone https://github.com/rbirkby/oci-marketplace.git
RUN cd oci-marketplace && npm ci && npm run test

ENV OCI_ROOT_URL http://localhost:3000/
ENV OCI_NAMESPACE mytestorg/mytestrepo
# ENV OCI_USERNAME ${{ secrets.MY_REGISTRY_USERNAME }}
# ENV OCI_PASSWORD ${{ secrets.MY_REGISTRY_PASSWORD }}
ENV OCI_TEST_PULL 1
ENV OCI_TEST_PUSH 1
ENV OCI_TEST_CONTENT_DISCOVERY 1
ENV OCI_TEST_CONTENT_MANAGEMENT 1
ENV OCI_HIDE_SKIPPED_WORKFLOWS 0
ENV OCI_DEBUG 0
ENV OCI_DELETE_MANIFEST_BEFORE_BLOBS 0

CMD cd oci-marketplace && npm run start > /dev/null & sleep 1; /conformance.test
