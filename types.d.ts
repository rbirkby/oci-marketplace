import { type Request } from 'express';
import { Buffer } from 'node:buffer';

declare global {
  type OciName = string; // [a-z0-9]+((\.|_|__|-+)[a-z0-9]+)*(\/[a-z0-9]+((\.|_|__|-+)[a-z0-9]+)*)*
  type OciAlgorithmComponent = string; // [a-z0-9]+]
  type OciEncoded = string; // [a-zA-Z0-9=_-]+
  type OciAlgorithmSeparator = '+' | '.' | '_' | '-';
  type OciOptionalAlgorithmComponent = `${OciAlgorithmSeparator}${OciAlgorithmComponent}` | ''; // FIXME:
  type OciAlgorithm = `${OciAlgorithmComponent}${OciOptionalAlgorithmComponent}`;
  type OciDigest = `${OciAlgorithm}:${OciEncoded}`;
  type OciTag = string; // [a-zA-Z0-9_][a-zA-Z0-9._-]{0,127}
  type OciReference = OciDigest | OciTag;
  type OciMediaType = string;
  // application/vnd.oci.descriptor.v1+json
  type OciDescriptorV1 = {
    mediaType: OciMediaType;
    digest: OciDigest;
    size: number;
    urls?: string[];
    annotations?: Record<string, string>;
    artifactType?: OciMediaType;
  };
  type OciImageManifest = {
    schemaVersion: 2;
    mediaType: OciMediaType;
    config: OciDescriptorV1;
    layers: OciDescriptorV1[];
    annotations?: Record<string, string>;
    subject?: OciDescriptorV1;
  };

  type OciRangeIndex = number;
  type OciRange = `${OciRangeIndex}-${OciRangeIndex}`; // ^[0-9]+-[0-9]+$
  type OciErrorCode =
    | 'BLOB_UNKNOWN'
    | 'BLOB_UPLOAD_INVALID'
    | 'BLOB_UPLOAD_UNKNOWN'
    | 'DIGEST_INVALID'
    | 'MANIFEST_BLOB_UNKNOWN'
    | 'MANIFEST_INVALID'
    | 'MANIFEST_UNKNOWN'
    | 'NAME_INVALID'
    | 'NAME_UNKNOWN'
    | 'SIZE_INVALID'
    | 'UNAUTHORIZED'
    | 'DENIED'
    | 'UNSUPPORTED'
    | 'TOOMANYREQUESTS';
}
declare global {
  type DigestRequest = Request<{ name: OciName; digest: OciDigest }>;
  type ReferenceRequest = Request<{ name: OciName; reference: OciReference }>;
  type DigestSearchRequest = Request<{ name: OciName }, unknown, Buffer, { digest?: OciDigest }>;
  type ReferenceDigestSearchRequest = Request<
    { name: OciName; reference: OciReference },
    unknown,
    Buffer,
    { digest: OciDigest }
  >;
  type PaginatedPlainRequest = Request<{ name: OciName }, unknown, Buffer, { n?: number; last?: OciTag }>;
  type MountRequest = Request<{ name: OciName }, unknown, Buffer, { mount?: OciDigest; from?: OciName }>;
  type DigestArtifactRequest = Request<{ name: OciName; digest: OciDigest }, { artifactType: string }>;
}
