import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getSavingTips } from '../services/savingTipsEngine.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [transactions, budgets] = await Promise.all([
    Transaction.find({ userId: req.user.id, date: { $gte: start, $lt: end } }).populate('categoryId').sort({ date: -1, createdAt: -1 }),
    Budget.find({ userId: req.user.id, month }).populate('categoryId'),
  ]);

  const income = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const byCategory = transactions.filter((item) => item.type === 'expense').reduce((totals, item) => {
    const key = item.categoryId?._id?.toString();
    if (key) totals[key] = (totals[key] || 0) + item.amount;
    return totals;
  }, {});
  const topEntry = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topEntry ? {
    categoryId: topEntry[0],
    name: transactions.find((item) => item.categoryId?._id?.toString() === topEntry[0])?.categoryId?.name,
    amount: topEntry[1],
  } : null;
  const budgetData = budgets.map((budget) => {
    const spent = byCategory[budget.categoryId?._id?.toString()] || 0;
    const percentage = budget.limitAmount ? Math.min(100, Math.round((spent / budget.limitAmount) * 100)) : 0;
    return { categoryId: budget.categoryId, limitAmount: budget.limitAmount, spent, percentage };
  });
  const tips = getSavingTips(Object.fromEntries(Object.entries(byCategory).map(([id, amount]) => [transactions.find((item) => item.categoryId?._id?.toString() === id)?.categoryId?.name || id, amount])), budgets);

  res.json({ success: true, data: { income, expense, balance: income - expense, topCategory, budgets: budgetData, recentTransactions: transactions.slice(0, 6), tips, month } });
});
