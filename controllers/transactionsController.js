const Order = require('../models/Order');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const Epin = require('../models/Epin');
const EpinTransfer = require('../models/EpinTransfer');

const formatDateTime = (value) => new Date(value).toLocaleString('en-IN', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
});

const buildTransactionRows = async (scope, memberIdentifiers = []) => {
  const rows = [];

  const orders = await Order.find().sort({ createdAt: -1 });
  orders.forEach((order) => {
    rows.push({
      dateTime: formatDateTime(order.createdAt),
      transactionId: order.orderNo,
      memberId: String(order.userId),
      description: 'PRODUCT PURCHASE',
      credit: 0,
      debit: Number(order.finalTotal || 0),
    });
  });

  const withdrawals = await WithdrawalRequest.find().sort({ createdAt: -1 });
  withdrawals.forEach((withdrawal) => {
    rows.push({
      dateTime: formatDateTime(withdrawal.createdAt),
      transactionId: withdrawal.requestId,
      memberId: withdrawal.memberId,
      description: `WITHDRAWAL ${withdrawal.status}`,
      credit: 0,
      debit: Number(withdrawal.amount || 0),
    });
  });

  const epins = await Epin.find().sort({ createdAt: -1 });
  epins.forEach((epin) => {
    rows.push({
      dateTime: formatDateTime(epin.createdAt),
      transactionId: epin.epinNo,
      memberId: epin.generatedBy,
      description: 'EPIN GENERATION',
      credit: 0,
      debit: Number(epin.cost || 0),
    });
  });

  const transfers = await EpinTransfer.find().sort({ createdAt: -1 });
  transfers.forEach((transfer) => {
    rows.push({
      dateTime: formatDateTime(transfer.createdAt),
      transactionId: transfer.epinNo,
      memberId: transfer.fromMember,
      description: 'EPIN TRANSFER',
      credit: 0,
      debit: Number(transfer.amount || 0),
    });
  });

  if (scope === 'user' && memberIdentifiers.length) {
    return rows.filter((row) => memberIdentifiers.includes(row.memberId) || memberIdentifiers.includes(row.transactionId));
  }

  return rows;
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const requestedScope = String(req.query.scope || 'admin').toLowerCase();
    const scope = req.user?.role === 'admin' ? requestedScope : 'user';
    const memberIdentifiers = [req.query.memberId, req.user?.memberId, req.user?.epin, req.user?.id]
      .map((value) => String(value || '').trim())
      .filter(Boolean);
    const rows = await buildTransactionRows(scope, memberIdentifiers);
    let runningBalance = 0;
    const mappedRows = rows.map((row, index) => {
      runningBalance += Number(row.credit || 0) - Number(row.debit || 0);
      return {
        sNo: index + 1,
        dateTime: row.dateTime,
        transactionId: row.transactionId,
        memberId: row.memberId,
        description: row.description,
        credit: Number(row.credit || 0),
        debit: Number(row.debit || 0),
        balance: runningBalance,
      };
    });

    res.json({ success: true, transactions: mappedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};