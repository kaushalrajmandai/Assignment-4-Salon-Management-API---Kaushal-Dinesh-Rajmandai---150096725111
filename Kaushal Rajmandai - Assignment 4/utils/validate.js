const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isValidEmail = (value) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidUsername = (value) =>
  typeof value === 'string' && /^[a-zA-Z0-9._-]{3,50}$/.test(value);

const isUUID = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const isValidRating = (value) => {
  const num = Number(value);
  return !Number.isNaN(num) && num >= 0 && num <= 5;
};

const isValidPrice = (value) => {
  const num = Number(value);
  return !Number.isNaN(num) && num >= 0;
};

const isValidDuration = (value) =>
  typeof value === 'string' && /^\d+\s*\w+/.test(value.trim());

const trimString = (value) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value);

module.exports = {
  isNonEmptyString,
  isValidEmail,
  isValidUsername,
  isUUID,
  isValidRating,
  isValidPrice,
  isValidDuration,
  trimString
};