// Mock implementation of lib/utils for testing
const actual = jest.requireActual("@/lib/utils");

export const cn = jest.fn(
  (...classes: (string | undefined | null | boolean)[]) => {
    return classes.filter(Boolean).join(" ");
  },
);

export const getTypeLabel = jest.fn((type: string) => {
  const labels: { [key: string]: string } = {
    url: "URL",
    text: "텍스트",
    wifi: "Wi-Fi",
    email: "이메일",
    sms: "SMS",
    vcard: "연락처",
    location: "위치",
  };
  return labels[type] || type;
});

// Export all other utilities from the actual module
module.exports = {
  ...actual,
  cn,
  getTypeLabel,
};
