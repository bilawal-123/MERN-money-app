export default function DecimalConversion({ value }) {
  // Check if the value is a whole number
  if (Number.isInteger(value)) {
    return value?.toString(); // Return the whole number as it is
  }

  // Check if the value is a decimal with .5
  if (value % 1 === 0.5) {
    const wholePart = Math.floor(value);
    return `${wholePart}:1/2`;
  }

  // If the value is in the format of x:y/z, return it as it is
  const match = value?.toString().match(/^(\d+):(\d+)\/(\d+)$/);
  if (match) {
    return value?.toString();
  }

  // If the value is neither a whole number nor a decimal with .5, return it as it is
  return value?.toString();
}
