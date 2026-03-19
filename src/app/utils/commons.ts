export function validateEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function formatName(value: string) {
  if(value.toUpperCase() == value)
    return value;
  else
    return value[0].toUpperCase() + value.slice(1).toLowerCase();
}