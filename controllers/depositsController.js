const Order = require('../models/Order');

const toApiRow = (order, index) => ({
  sno: index + 1,
  depositDate: order.orderDate,
  memberId: order.shippingInformation?.find((field) => field.label === 'Contact No')?.value || '---',
  memberName: order.shippingInformation?.find((field) => field.label === 'Name')?.value || '---',
  mobileNo: order.shippingInformation?.find((field) => field.label === 'Contact No')?.value || '---',
  transactionId: order.orderNo,
  paymentMode: order.paymentMode,
  amount: Number(order.finalTotal || 0).toFixed(2),
  utrNumber: order.orderNo,
  slip: order.paymentScreenshot || '',
  status: order.orderStatus || 'Pending',
  remark: order.remark || '-',
});

exports.getDepositRequests = async (req, res) => {
  try {
    const status = String(req.query.status || '').trim();
    const filter = {};

    if (status) {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    const rows = orders.map((order, index) => toApiRow(order, index));

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDepositStatus = async (req, res) => {
  try {
    const { orderNo } = req.params;
    const { status, remark } = req.body;

    if (!['Pending', 'Approve', 'Succeed', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid deposit status' });
    }

    const order = await Order.findOne({ orderNo });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Deposit record not found' });
    }

    order.orderStatus = status;
    order.remark = remark || order.remark || '-';
    await order.save();

    res.status(200).json({ success: true, data: toApiRow(order, 0) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
