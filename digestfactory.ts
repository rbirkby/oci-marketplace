import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';

export default (value: Buffer) => `sha256:${createHash('sha256').update(value).digest('hex')}`;
