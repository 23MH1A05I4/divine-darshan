const NAME_ONLY = /[^A-Za-z\s]/g;
const DIGITS_ONLY = /[^0-9]/g;

const normalizeEmail = (value = "") =>
  String(value).trim().toLowerCase();

const onlyName = (value = "") => String(value).replace(NAME_ONLY, "");

const onlyDigits = (value = "", maxLength = Infinity) =>
  String(value).replace(DIGITS_ONLY, "").slice(0, maxLength);

const onlyPhone = (value = "") => onlyDigits(value, 10);

const isValidEmail = (email) =>
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(String(email).trim());

const isGmailEmail = (email) =>
  /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(String(email).trim());

const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

const isValidName = (name) => /^[A-Za-z\s]{2,}$/.test(String(name).trim());

const isValidAge = (age) => {
  const n = Number(age);
  return Number.isInteger(n) && n >= 1 && n <= 120;
};

export {
  normalizeEmail,
  onlyName,
  onlyDigits,
  onlyPhone,
  isValidEmail,
  isGmailEmail,
  isValidPhone,
  isValidName,
  isValidAge,
};
