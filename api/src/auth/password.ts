import crypto from 'crypto';

const SALT_LENGTH = 16;
const ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

/** Helper to hash a password */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = await new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      ITERATIONS,
      KEY_LENGTH,
      DIGEST,
      (err, key) => {
        if (err) reject(err);
        else resolve(key.toString('hex'));
      },
    );
  });

  return `${salt}$${derivedKey}`;
}

/** Helper to verify password using "salt$hash" */
export async function verifyPassword({
  password,
  hash,
}: {
  password: string;
  hash: string;
}): Promise<boolean> {
  const [salt, storedHash] = hash.split('$');
  if (!salt || !storedHash) return false;

  const derivedKey = await new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      ITERATIONS,
      KEY_LENGTH,
      DIGEST,
      (err, key) => {
        if (err) reject(err);
        else resolve(key.toString('hex'));
      },
    );
  });

  return crypto.timingSafeEqual(
    Buffer.from(derivedKey, 'hex'),
    Buffer.from(storedHash, 'hex'),
  );
}
