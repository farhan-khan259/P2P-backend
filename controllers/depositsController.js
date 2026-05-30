const DepositRequest = require('../models/DepositRequest');
const User = require('../models/User');

const buildDepositId = async () => {
  let depositId = '';
  let isUnique = false;

  while (!isUnique) {
    const suffix = Math.floor(100000 + Math.random() * 900000);
    depositId = `DPT${suffix}`;
    const existing = await DepositRequest.findOne({ depositId });
    if (!existing) {
      isUnique = true;
    }
  }

  return depositId;
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

const normalizeStatus = (status) => (status === 'Reject' ? 'Rejected' : status);

const toApiRow = (request, index) => ({
  sno: index + 1,
  depositDate: request.depositDate,
  memberId: request.memberId,
  memberName: request.memberName,
  mobileNo: request.mobileNo,
  transactionId: request.depositId,
  paymentMode: request.paymentMode,
  amount: Number(request.amount || 0).toFixed(2),
  utrNumber: request.utrNumber,
  slip: request.slip || '',
  status: request.status,
  remark: request.remark || '-',
  description: request.description || 'E-Wallet',
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
  const requestAmount = Number(request.amount || 0);

  if (request.status === 'Succeed' && nextStatus !== 'Succeed') {
    user.walletBalance = currentBalance - requestAmount;
  }

  if (request.status !== 'Succeed' && nextStatus === 'Succeed') {
    user.walletBalance = currentBalance + requestAmount;
  }

  await user.save();
};

exports.createDepositRequest = async (req, res) => {
  try {
    const amount = Number(req.body.amount || req.body.depositAmount || 0);
    const paymentMode = String(req.body.paymentMode || req.body.transferMethod || '').trim();
    const transactionPassword = String(req.body.transactionPassword || '').trim();
    const confirmTransactionPassword = String(req.body.confirmTransactionPassword || '').trim();
    const paymentScreenshot = String(req.body.paymentScreenshot || req.body.slip || '').trim();
    const description = String(req.body.description || 'E-Wallet').trim();

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Deposit amount must be greater than zero' });
    }

    if (!['BANK TRANSFER', 'UPI ID', 'bank', 'upi'].includes(paymentMode)) {
      return res.status(400).json({ success: false, message: 'Please select a valid payment method' });
    }

    if (!paymentScreenshot) {
      return res.status(400).json({ success: false, message: 'Please upload payment screenshot' });
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

    const depositId = await buildDepositId();
    const depositDate = formatDateTime();
    const methodLabel = ['upi', 'UPI ID'].includes(paymentMode) ? 'UPI ID' : 'Bank Transfer';

    const request = await DepositRequest.create({
      depositId,
      userId: req.user.id,
      depositDate,
      memberId: user.memberId || '---',
      memberName: user.name || '---',
      mobileNo: user.contactNo || '---',
      paymentMode: methodLabel,
      amount,
      utrNumber: depositId,
      slip: paymentScreenshot,
      description,
      status: 'Pending',
      remark: '-',
    });

    res.status(201).json({ success: true, request: toApiRow(request, 0) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDepositRequests = async (req, res) => {
  try {
    const status = String(req.query.status || '').trim();
    const filter = {};

    if (status) {
      filter.status = normalizeStatus(status);
    }

    const requests = await DepositRequest.find(filter).sort({ createdAt: -1 });
    const rows = requests.map((request, index) => toApiRow(request, index));

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyDepositRequests = async (req, res) => {
  try {
    const status = String(req.query.status || '').trim();
    const filter = { userId: req.user.id };

    if (status) {
      filter.status = normalizeStatus(status);
    }

    const requests = await DepositRequest.find(filter).sort({ createdAt: -1 });
    const rows = requests.map((request, index) => toApiRow(request, index));

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDepositSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const requests = await DepositRequest.find({ userId: req.user.id }).sort({ createdAt: -1 });

    const totalDeposit = requests.reduce(
      (sum, request) => sum + (request.status === 'Rejected' ? 0 : Number(request.amount || 0)),
      0
    );

    res.status(200).json({
      success: true,
      data: {
        eWalletBalance: Number(user?.walletBalance || 0),
        rWalletBalance: 0,
        totalEarning: Number(user?.walletBalance || 0) + totalDeposit,
        totalWithdrawal: 0,
        requests: requests.map((request, index) => toApiRow(request, index)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDepositStatus = async (req, res) => {
  try {
    const { orderNo } = req.params;
    const { status, remark } = req.body;

    if (!['Pending', 'Approve', 'Succeed', 'Rejected', 'Reject'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid deposit status' });
    }

    const request = await DepositRequest.findOne({ depositId: orderNo });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Deposit record not found' });
    }

    const normalizedStatus = normalizeStatus(status);
    await adjustWalletOnStatusChange(request, normalizedStatus);

    request.status = normalizedStatus;
    request.remark = remark || request.remark || '-';
    request.approvedAt = new Date();
    request.reviewedBy = req.user.id;
    await request.save();

    res.status(200).json({ success: true, data: toApiRow(request, 0) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
