/**
 * OMEGA Integrity Service (v7.2.3)
 * Provides cryptographic hashing for manifest firmware integrity checks.
 */
export class IntegrityService {
  /**
   * Generates a SHA-256 hash of the manifest object.
   * Uses canonical normalization (alphabetical key sorting and minification).
   */
  static async generateManifestHash(manifest: any): Promise<string> {
    const { hash, ...cleanManifest } = manifest;
    
    // Canonical Normalization: Recursive Key Sorting
    const sortObject = (obj: any): any => {
      if (obj === null || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) return obj.map(sortObject);
      
      return Object.keys(obj).sort().reduce((acc: any, key: string) => {
        acc[key] = sortObject(obj[key]);
        return acc;
      }, {});
    };

    const canonicalJson = JSON.stringify(sortObject(cleanManifest));
    const encoder = new TextEncoder();
    const data = encoder.encode(canonicalJson);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verifies if a manifest matches a given hash.
   */
  static async verifyIntegrity(manifest: any, expectedHash: string): Promise<boolean> {
    const currentHash = await this.generateManifestHash(manifest);
    return currentHash === expectedHash;
  }
}
