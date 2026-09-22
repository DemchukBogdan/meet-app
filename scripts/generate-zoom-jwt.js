#!/usr/bin/env node
/**
 * Meeting SDK JWT helper.
 * Used by app.config.js (Node) so the Client Secret never ships in the app bundle.
 * CLI: npm run zoom:jwt (reads .env) or ZOOM_CLIENT_ID=... ZOOM_CLIENT_SECRET=... npm run zoom:jwt
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function loadLocalEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const DEFAULT_TTL_SECONDS = 7200;
const IAT_SKEW_SECONDS = 30;

function toBase64Url(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function createMeetingSdkJwt(options = {}) {
  const clientId = (options.clientId ?? process.env.ZOOM_CLIENT_ID)?.trim();
  const clientSecret = (
    options.clientSecret ?? process.env.ZOOM_CLIENT_SECRET
  )?.trim();
  const meetingNumber = (
    options.meetingNumber ?? process.env.ZOOM_MEETING_NUMBER
  )?.trim();
  const role = options.role ?? process.env.ZOOM_ROLE;
  const ttlSeconds = Number(
    options.ttlSeconds ?? process.env.ZOOM_TTL_SECONDS ?? DEFAULT_TTL_SECONDS
  );

  if (!clientId || !clientSecret) {
    throw new Error(
      'ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET are required to sign a Meeting SDK JWT.'
    );
  }

  if (!Number.isFinite(ttlSeconds) || ttlSeconds < 1800) {
    throw new Error('JWT TTL must be at least 1800 seconds.');
  }

  const now = Math.floor(Date.now() / 1000) - IAT_SKEW_SECONDS;
  const exp = now + ttlSeconds;
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    appKey: clientId,
    sdkKey: clientId,
    iat: now,
    exp,
    tokenExp: exp,
  };

  if (meetingNumber) {
    payload.mn = meetingNumber;
  }

  if (role !== undefined && role !== '') {
    payload.role = Number(role);
  }

  const unsigned = `${toBase64Url(header)}.${toBase64Url(payload)}`;
  const signature = crypto
    .createHmac('sha256', clientSecret)
    .update(unsigned)
    .digest('base64url');

  return `${unsigned}.${signature}`;
}

module.exports = { createMeetingSdkJwt };

if (require.main === module) {
  try {
    const token = createMeetingSdkJwt();
    const clientId = process.env.ZOOM_CLIENT_ID.trim();
    console.error(
      `Signed JWT for appKey=${clientId.slice(0, 4)}… (iat skewed -${IAT_SKEW_SECONDS}s, sdkKey included)`
    );
    process.stdout.write(`${token}\n`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
