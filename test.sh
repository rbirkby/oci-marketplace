#!/bin/sh

# Registry details
export OCI_ROOT_URL="http://localhost:3000/"
export OCI_NAMESPACE="myorg/myrepo"
export OCI_CROSSMOUNT_NAMESPACE="myorg/other"
export OCI_USERNAME="myuser"
export OCI_PASSWORD="mypass"

# Which workflows to run
export OCI_TEST_PULL=1
export OCI_TEST_PUSH=1
export OCI_TEST_CONTENT_DISCOVERY=1
export OCI_TEST_CONTENT_MANAGEMENT=1

# Extra settings
export OCI_HIDE_SKIPPED_WORKFLOWS=0
export OCI_DEBUG=1
export OCI_DELETE_MANIFEST_BEFORE_BLOBS=0 # defaults to OCI_DELETE_MANIFEST_BEFORE_BLOBS=1 if not set

../distribution-spec/conformance/conformance.test
