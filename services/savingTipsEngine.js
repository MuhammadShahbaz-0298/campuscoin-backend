export function getSavingTips(byCategory = {}, budgets = []) {
  const tips = [];

  for (const [name, amount] of Object.entries(byCategory)) {
    const budget = budgets.find(
      (item) => item.categoryId?.name?.toLowerCase() === name.toLowerCase(),
    );

    if (budget && amount > budget.limitAmount) {
      tips.push({
        title: `Trim ${name} spending`,
        body: `You are ${Math.round((amount / budget.limitAmount - 1) * 100)}% over your monthly budget.`,
        impact: amount - budget.limitAmount,
        category: name,
        kind: "over-budget",
      });
    } else if (amount > 100) {
      tips.push({
        title: `Review ${name} purchases`,
        body: `Small changes in ${name} could unlock meaningful savings this month.`,
        impact: Math.round(amount * 0.1),
        category: name,
        kind: "opportunity",
      });
    }
  }

  return tips.sort((a, b) => b.impact - a.impact).slice(0, 4);
}
