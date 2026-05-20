const WithdrawalRequest = require('../models/WithdrawalRequest');
const User = require('../models/User');

const buildRequestId = async () => {
  let requestId = '';
  let isUnique = false;

  while (!isUnique) {
    const suffix = Math.floor(100000 + Math.random() * 900000);
    requestId = `WDR${suffix}`;
    const existing = await WithdrawalRequest.findOne({ requestId });
    if (!existing) {
      isUnique = true;
    }
  }

  return requestId;
};

const formatDateTime = (value) => {
  const date = value || new Date();

  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const toApiRow = (request, index) => ({
  sNo: index + 1,
  requestDate: request.requestDate,
  requestId: request.requestId,
  memberId: request.memberId,
  memberName: request.memberName,
  mobileNo: request.mobileNo,
  upiId: request.upiId,
  bankAccountNo: request.bankAccountNo,
  bankName: request.bankName,
  branch: request.branch,
  ifscCode: request.ifscCode,
  amount: Number(request.amount || 0),
  charges: Number(request.charges || 0),
  netAmount: Number(request.netAmount || 0),
  paymentMethod: request.paymentMethod,
  status: request.status,
  remark: request.remark || '-',
});

const adjustWalletOnStatusChange = async (request, nextStatus) => {
  if (!request || request.status === nextStatus) {
    return;
  }

  const user = await User.findById(request.userId);
  if (!user) {
    return;
  }

  const currentBalance = Number(user.walletBalance || 0);
  const requestAmount = Number(request.netAmount || request.amount || 0);

  if (request.status === 'Reject' && nextStatus !== 'Reject') {
    user.walletBalance = currentBalance - requestAmount;
  }

  if (request.status !== 'Reject' && nextStatus === 'Reject') {
    user.walletBalance = currentBalance + requestAmount;
  }

  await user.save();
};

exports.createWithdrawalRequest = async (req, res) => {
  try {
    const amount = Number(req.body.amount || req.body.withdrawalAmount || 0);
    const paymentMethod = String(req.body.paymentMethod || req.body.transferMethod || '').trim();
    const transactionPassword = String(req.body.transactionPassword || '').trim();
    const confirmTransactionPassword = String(req.body.confirmTransactionPassword || '').trim();

    if (!amount || amount < 1000 || amount > 10000) {
      return res.status(400).json({ success: false, message: 'Withdrawal amount must be between 1000 and 10000' });
    }

    if (!['BANK TRANSFER', 'UPI ID', 'bank', 'upi'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Please select a valid transfer method' });
    }

    if (!transactionPassword || !confirmTransactionPassword) {
      return res.status(400).json({ success: false, message: 'Please enter both transaction passwords' });
    }

    if (transactionPassword !== confirmTransactionPassword) {
      return res.status(400).json({ success: false, message: 'Transaction passwords do not match' });
    }

    const user = await User.findById(req.user.id).select('+password +transactionPassword');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isPasswordValid = user.transactionPassword
      ? await user.matchTransactionPassword(transactionPassword)
      : await user.matchPassword(transactionPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Transaction password is incorrect' });
    }

    const availableBalance = Number((await User.findById(req.user.id).select('walletBalance')).walletBalance || 0);
    if (availableBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    const requestId = await buildRequestId();
    const requestDate = formatDateTime();
    const bankDetails = user.bankDetails || {};
    const paymentDetails = user.paymentDetails || {};
    const methodLabel = ['upi', 'UPI ID'].includes(paymentMethod) ? 'UPI ID' : 'BANK TRANSFER';
    const charges = 0;
    const netAmount = amount - charges;

    const request = await WithdrawalRequest.create({
      requestId,
      userId: req.user.id,
      requestDate,
      memberId: user.memberId || '---',
      memberName: user.name || '---',
      mobileNo: user.contactNo || '---',
      upiId: paymentDetails.upiId || '-',
      bankAccountNo: bankDetails.accountNo || '-',
      bankName: bankDetails.bankName || '-',
      branch: bankDetails.bankBranch || '-',
      ifscCode: bankDetails.ifsc || '-',
      amount,
      charges,
      netAmount,
      paymentMethod: methodLabel,
      status: 'Pending',
      remark: '-',
    });

    user.walletBalance = availableBalance - amount;
    await user.save();

    res.status(201).json({ success: true, request: toApiRow(request, 0) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWithdrawalRequests = async (req, res) => {
  try {
    const status = String(req.query.status || '').trim();
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (req.user.role !== 'admin') {
      filter.userId = req.user.id;
    }

    const requests = await WithdrawalRequest.find(filter).sort({ createdAt: -1 });
    const rows = requests.map((request, index) => toApiRow(request, index));

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWithdrawalSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const requests = await WithdrawalRequest.find({ userId: req.user.id }).sort({ createdAt: -1 });

    const totalWithdrawal = requests.reduce((sum, request) => sum + (request.status === 'Reject' ? 0 : Number(request.netAmount || 0)), 0);
    const walletBalance = Number(user?.walletBalance || 0);

    res.status(200).json({
      success: true,
      data: {
        eWalletBalance: walletBalance,
        rWalletBalance: 0,
        totalEarning: walletBalance + totalWithdrawal,
        totalWithdrawal,
        requests: requests.map((request, index) => toApiRow(request, index)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateWithdrawalStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, remark } = req.body;

    if (!['Pending', 'Approve', 'Reject', 'Succeed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal status' });
    }

    const request = await WithdrawalRequest.findOne({ requestId });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
    }

    await adjustWalletOnStatusChange(request, status);

    request.status = status;
    request.remark = remark || request.remark || '-';
    request.approvedAt = new Date();
    request.reviewedBy = req.user.id;
    await request.save();

    res.status(200).json({ success: true, data: toApiRow(request, 0) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
