import { formatCurrency, formatPercent } from "../utils/formatCurrency.js";
import { daysInMonth, monthLabel, parseMonth, shiftMonth } from "../utils/monthRange.js";

const UNCATEGORISED = "Uncategorized";
const WEEKS_PER_MONTH = 4.33;
const MIN_DAYS_FOR_PACE = 7;
const MIN_ITEMS_FOR_SHARE = 3;
const DOMINANT_SHARE = 0.5;
const RUNNER_UP_GAP = 0.6;

const round = (value) => Math.round(Number(value) || 0);

function amountOf(item) {
  const amount = Number(item?.amount);
  return Number.isFinite(amount) ? amount : 0;
}

function categoryNameOf(item) {
  return item?.categoryId?.name || UNCATEGORISED;
}

function isExpense(item) {
  return item?.type === "expense";
}

function totalOf(items) {
  return items.reduce((sum, item) => sum + amountOf(item), 0);
}

function ratio(numerator, denominator) {
  return denominator > 0 ? numerator / denominator : null;
}

function roundToStep(value, step) {
  return Math.round(value / step) * step;
}

function roundUpToStep(value, step) {
  return Math.ceil(value / step) * step;
}

function plural(count, singular, pluralForm = `${singular}s`) {
  return count === 1 ? singular : pluralForm;
}

/**
 * Rolls a set of transactions up into the numbers the copy is written from.
 */
export function summarise(transactions = []) {
  const expenseItems = transactions.filter(isExpense);
  const income = totalOf(transactions.filter((item) => item?.type === "income"));
  const expense = totalOf(expenseItems);
  const byCategory = {};

  for (const item of expenseItems) {
    const name = categoryNameOf(item);
    byCategory[name] = (byCategory[name] || 0) + amountOf(item);
  }

  const ranked = Object.entries(byCategory)
    .map(([name, amount]) => ({ name, amount, share: ratio(amount, expense) ?? 0 }))
    .sort((a, b) => b.amount - a.amount);

  return {
    income,
    expense,
    net: income - expense,
    count: transactions.length,
    expenseCount: expenseItems.length,
    ranked,
    top: ranked[0] || null,
    savingsRate: ratio(income - expense, income),
  };
}

function buildHeadline({ net, income, expense, savingsRate, top }) {
  if (income === 0 && expense === 0) return "No activity logged yet";
  if (expense === 0) return "Nothing spent — everything you brought in is still yours";
  if (income === 0) return "Spending recorded with no income logged yet";
  if (net < 0) {
    return top && top.share >= DOMINANT_SHARE
      ? `${top.name} spending is eating into your savings`
      : "Spending outpaced your income this month";
  }
  if (net === 0) return "Dead even — nothing left, nothing saved";
  if (savingsRate === null) return "In the black this month";

  const rate = formatPercent(savingsRate * 100);
  if (savingsRate >= 0.2) return `Solid month — you saved ${rate} of your income`;
  if (savingsRate >= 0.1) return `In the black — ${rate} of your income kept`;
  return `Ahead, but thin — just ${rate} of your income saved`;
}

function buildCategoryNote({ top, ranked, budgetForTop }) {
  if (!top) return "";
  const parts = [];
  const runnerUp = ranked[1];

  if (runnerUp) {
    parts.push(
      runnerUp.amount <= top.amount * RUNNER_UP_GAP
        ? `${runnerUp.name} was a distant second at ${formatCurrency(runnerUp.amount)}`
        : `${runnerUp.name} followed at ${formatCurrency(runnerUp.amount)}`,
    );
  }

  if (budgetForTop) {
    parts.push(
      top.amount > budgetForTop
        ? `${formatCurrency(top.amount - budgetForTop)} over your ${formatCurrency(budgetForTop)} budget`
        : `${formatCurrency(budgetForTop - top.amount)} under your ${formatCurrency(budgetForTop)} budget`,
    );
  }

  return parts.join(" · ");
}

function buildFooterText({ current, previous, previousLabel, isCurrentMonth, dayOfMonth, totalDays }) {
  if (!previous || previous.count === 0) return "";

  const parts = [];
  const delta = round(current.expense - previous.expense);

  if (delta === 0) {
    parts.push(`Compared to ${previousLabel}: spending was flat.`);
  } else {
    const change = previous.expense > 0
      ? ` (${formatPercent((Math.abs(delta) / previous.expense) * 100)} ${delta < 0 ? "lower" : "higher"})`
      : "";
    parts.push(`Compared to ${previousLabel}: spending ${delta < 0 ? "down" : "up"} ${formatCurrency(Math.abs(delta))}${change}.`);
  }

  if (isCurrentMonth && dayOfMonth >= MIN_DAYS_FOR_PACE && current.expense > 0) {
    const projected = Math.round((current.expense / dayOfMonth) * totalDays);
    parts.push(`On pace to finish near ${formatCurrency(projected)}.`);
  }

  return parts.join(" ");
}

function buildSummary({ label, income, expense, net, savingsRate, isCurrentMonth, dayOfMonth }) {
  const opener = isCurrentMonth
    ? dayOfMonth <= 3
      ? `Early in ${label}`
      : `So far this ${label}`
    : `In ${label}`;

  if (income === 0 && expense === 0) {
    return `Nothing has been logged for ${label} yet. Add a transaction or two and this page fills itself in.`;
  }

  if (income === 0) {
    return `${opener}, you logged ${formatCurrency(expense)} of spending and no income yet — worth checking that your allowance or paycheck landed.`;
  }

  if (expense === 0) {
    return `${opener}, nothing has left your account. All ${formatCurrency(income)} you brought in is still with you.`;
  }

  const rateClause = savingsRate === null ? "" : ` — that is about ${formatPercent(savingsRate * 100)} of your income`;

  if (net > 0) {
    return `${opener}, you brought in ${formatCurrency(income)} and spent ${formatCurrency(expense)}, keeping ${formatCurrency(net)} back${rateClause}.`;
  }

  if (net < 0) {
    const spendNote = savingsRate !== null && savingsRate >= 0 ? ` That is ${formatPercent((1 - savingsRate) * 100)} of your income.` : "";
    return `${opener}, you brought in ${formatCurrency(income)} and spent ${formatCurrency(expense)} — ${formatCurrency(-net)} more going out than coming in.${spendNote}`;
  }

  return `${opener}, you brought in ${formatCurrency(income)} and spent ${formatCurrency(expense)} — a dead heat, which is still a month in control.`;
}

function buildRecommendation({ label, top, expense, net, income, savingsRate, budgetForTop, expenseCount, isCurrentMonth }) {
  if (expense === 0) {
    return income > 0
      ? `Nothing needs trimming yet — if you want to get ahead, move part of that ${formatCurrency(income)} into savings before it has a chance to drift.`
      : "Add your first transaction and next month we will show you exactly where the money went.";
  }

  if (!top) {
    return "Tag your expenses with categories so we can point at the one worth trimming first.";
  }

  if (top.name === UNCATEGORISED) {
    return `${formatCurrency(top.amount)} of this month's spending is sitting in ${UNCATEGORISED}, so there is no clear target yet. Tag those transactions and next month we can point at the exact category worth capping.`;
  }

  const weeklyCap = Math.max(roundToStep(top.amount / WEEKS_PER_MONTH, 5), 5);
  const tenPercent = roundToStep(top.amount * 0.1, 5);
  const trimToCover = (target) => Math.min(roundUpToStep(target, 5), roundUpToStep(top.amount / 3, 5));

  if (net < 0) {
    const gap = -net;
    const trim = trimToCover(gap);
    return `You are ${formatCurrency(gap)} in the red, so start with ${top.name}: coming in ${formatPercent(ratio(trim, top.amount) * 100)} under there — about ${formatCurrency(trim)} — wipes the gap out on its own. The smaller categories can pick up whatever is left.`;
  }

  if (expenseCount < MIN_ITEMS_FOR_SHARE && isCurrentMonth) {
    const logged = `${expenseCount} ${plural(expenseCount, "expense")}`;
    return `${expenseCount === 1 ? "Just" : "Only"} ${logged} logged so far, so the picture is still forming. Keep tagging as you go and next month we can tell you which category actually moved.`;
  }

  if (budgetForTop && top.amount > budgetForTop) {
    const over = round(top.amount - budgetForTop);
    const trim = trimToCover(over);
    return `You are ${formatCurrency(over)} over your ${top.name} budget for ${label}. Trimming ${formatPercent(ratio(trim, top.amount) * 100)} off that one category — about ${formatCurrency(trim)} — brings the whole thing back on plan without touching anything else.`;
  }

  if (top.share >= DOMINANT_SHARE && expenseCount >= MIN_ITEMS_FOR_SHARE) {
    return `${top.name} is ${formatPercent(top.share * 100)} of everything you spend, so it is where the leverage is. A ${formatCurrency(weeklyCap)} weekly cap keeps it honest, and setting aside 10% of it — ${formatCurrency(tenPercent)} a month — would build roughly ${formatCurrency(tenPercent * 12)} over a year.`;
  }

  if (savingsRate !== null && savingsRate < 0.1) {
    return `Saving ${formatCurrency(net)} is a start, but it is only ${formatPercent(savingsRate * 100)} of your income. Shifting 5% more — about ${formatCurrency(roundToStep(income * 0.05, 5))} — into savings next month is a small change with a real payoff.`;
  }

  if (savingsRate !== null && savingsRate >= 0.3) {
    return `Saving ${formatPercent(savingsRate * 100)} of your income is genuinely strong. Consider parking part of ${top.name} — around ${formatCurrency(tenPercent)} — into a separate account so the habit survives a busy month.`;
  }

  return `Your numbers are balanced this ${label}. A ${formatCurrency(weeklyCap)} weekly ceiling on ${top.name} is an easy line to hold, and trimming 10% there frees up ${formatCurrency(tenPercent)} without feeling like a cut.`;
}

function findBudgetFor(budgets, top) {
  if (!top || !Array.isArray(budgets) || budgets.length === 0) return 0;
  const match = budgets.find((budget) => budget?.categoryId?.name?.toLowerCase() === top.name.toLowerCase());
  return match ? round(match.limitAmount) : 0;
}

export function generateMonthlyInsight(transactions = [], month, { previousTransactions = [], budgets = [], now = new Date() } = {}) {
  const current = summarise(transactions);
  const previous = previousTransactions.length ? summarise(previousTransactions) : null;
  const currentMonth = parseMonth(month);
  const label = monthLabel(month, { withYear: false });
  const isCurrentMonth = Boolean(currentMonth && now.getFullYear() === currentMonth.getFullYear() && now.getMonth() === currentMonth.getMonth());
  const dayOfMonth = isCurrentMonth ? now.getDate() : daysInMonth(month);
  const totalDays = daysInMonth(month);
  const budgetForTop = findBudgetFor(budgets, current.top);
  const expenseCount = current.expenseCount;

  const summaryText = buildSummary({
    label,
    income: current.income,
    expense: current.expense,
    net: current.net,
    savingsRate: current.savingsRate,
    isCurrentMonth,
    dayOfMonth,
  });

  const previousMonthKey = shiftMonth(month, -1);
  const previousLabel = monthLabel(previousMonthKey);

  const footerText = buildFooterText({
    current,
    previous,
    previousLabel,
    isCurrentMonth,
    dayOfMonth,
    totalDays,
  });

  const tipText = buildRecommendation({
    label,
    top: current.top,
    expense: current.expense,
    net: current.net,
    income: current.income,
    savingsRate: current.savingsRate,
    budgetForTop,
    expenseCount,
    isCurrentMonth,
  });

  return {
    headline: buildHeadline({
      net: current.net,
      income: current.income,
      expense: current.expense,
      savingsRate: current.savingsRate,
      top: current.top,
    }),
    summaryText,
    tipText,
    footerText,
    metrics: {
      income: round(current.income),
      expense: round(current.expense),
      net: round(current.net),
      savingsRate: current.savingsRate === null ? null : Number((current.savingsRate * 100).toFixed(1)),
      transactionCount: current.count,
      expenseCount,
      topCategory: current.top
        ? {
            name: current.top.name,
            amount: round(current.top.amount),
            share: Number((current.top.share * 100).toFixed(1)),
            note: buildCategoryNote({ top: current.top, ranked: current.ranked, budgetForTop }),
          }
        : null,
      comparison: previous
        ? {
            month: previousMonthKey,
            label: previousLabel,
            expense: round(previous.expense),
            expenseDelta: round(current.expense - previous.expense),
            expenseDeltaPct: previous.expense > 0
              ? Number((((current.expense - previous.expense) / previous.expense) * 100).toFixed(1))
              : null,
          }
        : null,
    },
  };
}
