import { Buffer } from 'node:buffer';
import digestfactory from '../digestfactory';

interface BlobEntry {
  name: OciName;
  reference: OciReference;
  digest?: OciDigest;
  data: Buffer;
}

interface TagEntry {
  name: OciName;
  value: OciTag;
  digest?: OciDigest;
}

interface ManifestEntry {
  name: OciName;
  value: OciImageManifest;
  digest: OciDigest;
}

export class OciRangeError extends Error {}
export class OciBlobNotFound extends Error {}
export class OciManifestNotFound extends Error {}

export default class MemoryRepository implements Repository {
  private manifests: ManifestEntry[] = [];
  private blobs: BlobEntry[] = [];
  private tags: TagEntry[] = [];

  getTags(name: OciName): OciTag[] {
    return this.tags.filter((tag) => tag.name === name).map((tag) => tag.value);
  }

  addBlob(name: OciName, reference: OciReference, data: Buffer) {
    this.blobs.push({ name, reference, data });
  }

  getBlobLength(name: OciName, reference: OciReference) {
    const blob = this.blobs.find((blob) => blob.name === name && blob.reference === reference);
    if (!blob) {
      throw new OciBlobNotFound('Blob not found');
    }

    return blob.data.length;
  }

  updateBlob(name: OciName, reference: OciReference, rangeStart: number, rangeEnd: number, chunk: Buffer) {
    const blob = this.blobs.find((blob) => blob.name === name && blob.reference === reference);
    if (!blob) {
      throw new OciBlobNotFound('Blob not found');
    }

    const firstFreeBytePosition = blob.data.length === 0 ? 0 : blob.data.length + 1;

    if (rangeStart !== firstFreeBytePosition) {
      throw new OciRangeError('Range start is not contiguous with existing chunks');
    }

    if (rangeEnd > blob.data.length) {
      const newBuffer = Buffer.alloc(rangeEnd);
      blob.data.copy(newBuffer);
      blob.data = newBuffer;
    }

    chunk.copy(blob.data, rangeStart);
  }

  setBlobDigest(name: OciName, reference: OciReference, digest: OciDigest) {
    const blob = this.blobs.find((blob) => blob.name === name && blob.reference === reference);
    if (!blob) {
      throw new OciBlobNotFound('Blob not found');
    }
    blob.digest = digest;
  }

  getBlob(name: OciName, digest: OciDigest) {
    const blob = this.blobs.find((blob) => blob.name === name && blob.digest === digest);
    if (!blob) {
      throw new OciBlobNotFound('Blob not found');
    }

    return blob.data;
  }

  deleteBlob(name: OciName, digest: OciDigest) {
    this.blobs = this.blobs.filter((blob) => blob.name !== name && blob.digest !== digest);
  }

  getManifest(name: OciName, reference: OciReference) {
    const digest = this.isDigest(reference)
      ? reference
      : this.tags.find((tag) => tag.name === name && tag.value === reference)?.digest;

    const manifest = this.manifests.find((manifest) => manifest.name === name && manifest.digest === digest);
    if (!manifest) {
      throw new OciManifestNotFound('Manifest not found');
    }

    return manifest.value;
  }

  private isDigest(reference: OciReference) {
    return reference.includes(':');
  }

  setManifest(name: OciName, reference: OciReference, value: Buffer) {
    const json = JSON.parse(value.toString('utf8'));
    const digest = digestfactory(value) as OciDigest;

    this.manifests.push({ name, value: json, digest });
    if (!this.isDigest(reference)) {
      this.addTag(name, reference, digest);
    }

    return digest;
  }

  getReferrers(name: OciName): OciDescriptorV1[] {
    const dummyDescriptor: OciDescriptorV1 = {
      digest: 'sha256:dummy',
      mediaType: '',
      size: 0
    };

    return this.manifests
      .filter((manifest) => manifest.name === name && manifest.value.subject)
      .map((manifest) => ({
        artifactType: manifest.value.config?.mediaType ?? '',
        ...(manifest.value.subject ?? dummyDescriptor)
      }));
  }

  addTag(name: OciName, value: OciTag, digest: OciDigest) {
    // Remove existing tag with same value
    this.tags = this.tags.filter((tag) => tag.name !== name && tag.value !== value);
    this.tags.push({ name, value, digest });
  }

  deleteManifestOrTag(name: OciName, reference: OciReference) {
    if (this.isDigest(reference)) {
      // delete manifest
      this.manifests = this.manifests.filter((manifest) => manifest.name !== name && manifest.digest !== reference);
      this.tags = this.tags.filter((tag) => tag.name !== name && tag.digest !== reference);
    } else {
      // delete tag
      this.tags = this.tags.filter((tag) => tag.name !== name && tag.value !== reference);
    }
  }
}
