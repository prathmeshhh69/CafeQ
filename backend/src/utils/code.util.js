const crypto = require('crypto');

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRandomCode(length) {
  const bytes = crypto.randomBytes(length);
  let code = '';

  for (const byte of bytes) {
    code += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  }

  return code;
}

async function generateUniqueCode(model, field, formatCode) {
  let code;

  do {
    code = formatCode(generateRandomCode(6));
  } while (await model.exists({ [field]: code }));

  return code;
}

module.exports = { generateUniqueCode };
