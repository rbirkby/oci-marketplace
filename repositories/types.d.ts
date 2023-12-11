import { type Buffer } from 'node:buffer';

declare global {
  interface Repository {
    addBlob(name: OciName, reference: OciReference, data: Buffer): void;
    getBlobLength(name: OciName, reference: OciReference): number;
    getBlob(name: OciName, digest: OciDigest): Buffer;
    getTags(name: OciName): OciTag[];
    deleteBlob(name: OciName, digest: OciDigest): void;
    getManifest(name: OciName, reference: OciReference): unknown;
    setManifest(name: OciName, reference: OciReference, value: unknown): OciDigest;
    deleteManifestOrTag(name: OciName, reference: OciReference): void;
    updateBlob(name: OciName, reference: OciReference, rangeStart: number, rangeEnd: number, chunk: Buffer): void;
    setBlobDigest(name: OciName, reference: OciReference, digest: OciDigest): void;
    getReferrers(name: OciName, digest: OciDigest): OciDescriptorV1[];
    getDebugInfo(): Record<string, string>;
  }
}
