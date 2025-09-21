export function base64ArrayBuffer(arrayBuffer) {
  let base64 = '';
  const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  const bytes = new Uint8Array(arrayBuffer);
  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;

  let a, b, c, d;
  let chunk;

  // Main loop deals with bytes in chunks of 3
  for (let i = 0; i < mainLength; i += 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk >> 18) & 63;
    b = (chunk >> 12) & 63;
    c = (chunk >> 6) & 63;
    d = chunk & 63;

    // Convert the 6-bit segments to base64 digits
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }

  // Deal with the remaining bytes
  if (byteRemainder === 1) {
    chunk = bytes[mainLength];

    a = (chunk >> 2) & 63;
    b = (chunk << 4) & 63;

    base64 += encodings[a] + encodings[b] + '==';
  } else if (byteRemainder === 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

    a = (chunk >> 10) & 63;
    b = (chunk >> 4) & 63;
    c = (chunk << 2) & 63;

    base64 += encodings[a] + encodings[b] + encodings[c] + '=';
  }

  return base64;
}