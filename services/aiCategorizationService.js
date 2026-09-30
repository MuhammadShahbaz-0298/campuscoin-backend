const rules = [
  [
    "food",
    ["cafe", "food", "lunch", "dinner", "snack", "restaurant", "delivery"],
  ],
  ["transport", ["bus", "uber", "taxi", "metro", "train", "fuel"]],
  ["academics", ["book", "tuition", "stationery", "course"]],
  ["subscriptions", ["netflix", "spotify", "subscription", "app"]],
  ["entertainment", ["movie", "cinema", "outing", "concert"]],
  ["hostel/rent", ["rent", "hostel", "room"]],
  ["allowance", ["allowance", "pocket money"]],
  ["part-time job", ["salary", "freelance", "job"]],
];

export function suggestCategory(description = "") {
  const normalized = description.toLowerCase();
  return (
    rules.find(([, words]) =>
      words.some((word) => normalized.includes(word)),
    )?.[0] || "miscellaneous"
  );
}
