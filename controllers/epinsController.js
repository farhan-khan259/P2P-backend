const mongoose = require('mongoose');
const User = require('../models/User');
const Epin = require('../models/Epin');
const EpinRequest = require('../models/EpinRequest');
const EpinTransfer = require('../models/EpinTransfer');
const EpinFranchise = require('../models/EpinFranchise');

const getUserIdentifiers = (req) => [req.user?.memberId, req.user?.epin, req.user?.id]
  .map((value) => String(value || '').trim())
  .filter(Boolean);

const isAdmin = (req) => req.user?.role === 'admin';

const seedEpins = [
  { epinName: 'Activation', epinNo: 'EPR1832459', cost: 10, generatedBy: 'DT101010', currentOwner: 'DT101010', status: 'Unused', usedBy: '-', usedDate: '-', deletedBy: '-', deletedDate: '-', deletedReason: '-' },
  { epinName: 'Activation', epinNo: 'EPR1276502', cost: 10, generatedBy: 'DT101010', currentOwner: 'DT101010', status: 'Unused', usedBy: '-', usedDate: '-', deletedBy: '-', deletedDate: '-', deletedReason: '-' },
  { epinName: 'Activation', epinNo: 'EPR1055966', cost: 10, generatedBy: 'DT101010', currentOwner: 'DT101010', status: 'Unused', usedBy: '-', usedDate: '-', deletedBy: '-', deletedDate: '-', deletedReason: '-' },
  { epinName: 'Activation', epinNo: 'EPR1980434', cost: 10, generatedBy: 'AH781347', currentOwner: 'AH781347', status: 'Used', usedBy: 'AH736651', usedDate: '22-11-2024', deletedBy: '-', deletedDate: '-', deletedReason: '-' },
  { epinName: 'Activation', epinNo: 'EPR1106324', cost: 10, generatedBy: 'AH781347', currentOwner: 'AH781347', status: 'Used', usedBy: 'AH517477', usedDate: '22-11-2024', deletedBy: '-', deletedDate: '-', deletedReason: '-' },
  { epinName: 'Activation', epinNo: 'EPR1018896', cost: 10, generatedBy: 'AH781347', currentOwner: 'AH781347', status: 'Used', usedBy: 'AH618556', usedDate: '22-11-2024', deletedBy: '-', deletedDate: '-', deletedReason: '-' },
  { epinName: 'Activation', epinNo: 'EPR1145517', cost: 10, generatedBy: 'DT101010', currentOwner: 'DT101010', status: 'Deleted', usedBy: '-', usedDate: '-', deletedBy: 'DT101010', deletedDate: '03-03-2026', deletedReason: 'Manual delete by admin' },
];

const seedTransfers = [
  { epinNo: 'EPR1832459', fromMember: 'DT101010', toMember: 'DT781347', amount: 10, status: 'Success' },
  { epinNo: 'EPR1276502', fromMember: 'DT101010', toMember: 'DT944734', amount: 10, status: 'Success' },
  { epinNo: 'EPR1055966', fromMember: 'DT101010', toMember: 'DT900001', amount: 10, status: 'Pending' },
];

const seedFranchises = [
  { franchiseId: 'EI45451278', franchiseName: 'AMRUTA SALUNKE', upiId: '9822834083@ybl', whatsappNo: '9822834083', city: 'PUNE', stock: 500, status: 'SHOWING' },
  { franchiseId: 'EI45451279', franchiseName: 'PUREX WATERTECH', upiId: '7250444555@ybl', whatsappNo: '7250444555', city: 'SATARA', stock: 200, status: 'HIDDEN' },
  { franchiseId: 'EI45451574', franchiseName: 'SONALI SHIRKE', upiId: '9822895623@paytm', whatsappNo: '9822895623', city: 'THANE', stock: 250, status: 'SHOWING' },
  { franchiseId: 'EI45451272', franchiseName: 'SNEHAL SHILIMKAR', upiId: '8956238956@ybl', whatsappNo: '8956238956', city: 'NAGPUR', stock: 100, status: 'SHOWING' },
  { franchiseId: 'EI45451273', franchiseName: 'MEGHA SHIRKE', upiId: '9822568956@ybl', whatsappNo: '9822568956', city: 'PATANA', stock: 500, status: 'SHOWING' },
  { franchiseId: 'EI45451274', franchiseName: 'DHANSHREE KATALE', upiId: '9823568955@ybl', whatsappNo: '9823568955', city: 'KOLHAPUR', stock: 450, status: 'SHOWING' },
  { franchiseId: 'EI45451275', franchiseName: 'RAJANI PATIL', upiId: '9822658984@ybl', whatsappNo: '9822658984', city: 'SANGALI', stock: 200, status: 'SHOWING' },
];

const formatDate = (date = new Date()) => new Date(date).toLocaleString('en-IN', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
});

const ensureSeed = async () => {
  if ((await Epin.countDocuments()) === 0) await Epin.insertMany(seedEpins);
  if ((await EpinTransfer.countDocuments()) === 0) await EpinTransfer.insertMany(seedTransfers);
  if ((await EpinFranchise.countDocuments()) === 0) await EpinFranchise.insertMany(seedFranchises);
};

const cleanupDemoRequests = async () => {
  await EpinRequest.deleteMany({
    $or: [
      { clientId: 'DT781347', name: 'REKHA DEVI' },
      { clientId: 'DT944734', name: 'SEEMA' },
      { clientId: 'DT101010', name: 'AASHA ASHIYANA ATITHI SEVA HRIDAY AASHRAM' },
      { clientId: '23323', name: 'Muhammad Farhan', packageCost: 'basic', qty: 2, paidAmount: 200, mobile: '3333333333' },
    ],
  });
};

const mapEpin = (doc, index) => ({
  id: index + 1,
  epinName: doc.epinName,
  epin: doc.epinNo,
  cost: String(doc.cost),
  genDate: formatDate(doc.createdAt),
  genBy: doc.generatedBy,
  currentOwner: doc.currentOwner,
  status: doc.status,
  usedBy: doc.usedBy || '-',
  usedDate: doc.usedDate || '-',
});

const mapRequest = (doc, index) => ({
  _id: String(doc._id),
  id: index + 1,
  clientId: doc.clientId,
  name: doc.name,
  packageCost: doc.packageCost,
  qty: doc.qty,
  paidAmount: Number(doc.paidAmount).toFixed(2),
  mobile: doc.mobile,
  date: formatDate(doc.createdAt).split(',')[0],
  status: doc.status,
});

exports.getEpinRequests = async (req, res) => {
  try {
    await ensureSeed();
    await cleanupDemoRequests();
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Not authorized to access ePin requests' });
    }
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const rows = await EpinRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, requests: rows.map(mapRequest) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createEpinRequest = async (req, res) => {
  try {
    const payload = req.body || {};
    const request = await EpinRequest.create({
      clientId: payload.clientId || req.user?.memberId || req.user?.epin || 'UNKNOWN',
      name: payload.name || req.user?.name || 'Member',
      packageCost: payload.packageCost || 'Activation-10.00',
      qty: Number(payload.qty || payload.numberOfEpins || 1),
      paidAmount: Number(payload.paidAmount || payload.totalPaidAmount || 0),
      mobile: payload.mobile || req.user?.contactNo || '-',
      status: 'Pending',
    });

    res.status(201).json({ success: true, request: mapRequest(request, 0) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEpinRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: 'Invalid request id' });
    }

    const request = await EpinRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    request.status = req.body.status || request.status;
    await request.save();
    res.json({ success: true, request: mapRequest(request, 0) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEpins = async (req, res) => {
  try {
    await ensureSeed();
    const { status, generatedBy, currentOwner, epin } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (epin) filter.epinNo = new RegExp(epin, 'i');
    if (isAdmin(req)) {
      if (generatedBy) filter.generatedBy = generatedBy;
      if (currentOwner) filter.currentOwner = currentOwner;
    } else {
      const identifiers = getUserIdentifiers(req);
      if (!identifiers.length) {
        return res.status(403).json({ success: false, message: 'Not authorized to view ePins' });
      }
      filter.$or = [
        { generatedBy: { $in: identifiers } },
        { currentOwner: { $in: identifiers } },
        { usedBy: { $in: identifiers } },
        { deletedBy: { $in: identifiers } },
      ];
    }
    const rows = await Epin.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, epins: rows.map(mapEpin) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateEpins = async (req, res) => {
  try {
    const qty = Math.max(1, Number(req.body.qty || req.body.numberOfEpins || 1));
    const epinName = String(req.body.epinName || 'Activation').trim();
    const identifiers = getUserIdentifiers(req);
    if (!isAdmin(req) && !identifiers.length) {
      return res.status(403).json({ success: false, message: 'Not authorized to generate ePins' });
    }
    const generatedBy = isAdmin(req)
      ? String(req.body.generatedBy || req.user?.memberId || req.user?.epin || 'ADMIN').trim()
      : identifiers[0];
    const currentOwner = String((isAdmin(req) ? req.body.currentOwner : undefined) || generatedBy).trim();
    const cost = Number(req.body.cost || 10);

    const created = [];
    for (let index = 0; index < qty; index += 1) {
      let epinNo = '';
      let exists = true;
      while (exists) {
        epinNo = `EPR${Math.floor(1000000 + Math.random() * 9000000)}`;
        // eslint-disable-next-line no-await-in-loop
        exists = Boolean(await Epin.findOne({ epinNo }));
      }
      // eslint-disable-next-line no-await-in-loop
      const doc = await Epin.create({ epinName, epinNo, cost, generatedBy, currentOwner, status: 'Unused', usedBy: '-', usedDate: '-', deletedBy: '-', deletedDate: '-', deletedReason: '-' });
      created.push(mapEpin(doc, created.length));
    }

    res.status(201).json({ success: true, epins: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEpinStatus = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update ePin status' });
    }
    const epin = await Epin.findOne({ epinNo: req.params.epinNo });
    if (!epin) return res.status(404).json({ success: false, message: 'ePin not found' });
    const status = String(req.body.status || '').trim();
    if (status) epin.status = status;
    if (status === 'Used') {
      epin.usedBy = req.body.usedBy || epin.usedBy || '-';
      epin.usedDate = req.body.usedDate || formatDate();
    }
    if (status === 'Deleted') {
      epin.deletedBy = req.body.deletedBy || req.user?.memberId || req.user?.epin || '-';
      epin.deletedDate = req.body.deletedDate || formatDate();
      epin.deletedReason = req.body.deletedReason || 'Manual delete by admin';
    }
    await epin.save();
    res.json({ success: true, epin: mapEpin(epin, 0) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.transferEpin = async (req, res) => {
  try {
    const epin = await Epin.findOne({ epinNo: req.params.epinNo });
    if (!epin) return res.status(404).json({ success: false, message: 'ePin not found' });
    const identifiers = getUserIdentifiers(req);
    if (!isAdmin(req) && !identifiers.includes(epin.currentOwner)) {
      return res.status(403).json({ success: false, message: 'You can only transfer your own ePins' });
    }
    const toMember = String(req.body.toMember || '').trim();
    if (!toMember) {
      return res.status(400).json({ success: false, message: 'toMember is required' });
    }
    const transfer = await EpinTransfer.create({
      epinNo: epin.epinNo,
      fromMember: String(isAdmin(req) ? req.body.fromMember || epin.currentOwner : epin.currentOwner).trim(),
      toMember,
      amount: Number(req.body.amount || epin.cost || 0),
      status: String(req.body.status || 'Success').trim(),
    });
    epin.currentOwner = transfer.toMember;
    epin.status = req.body.status === 'Pending' ? 'Unused' : epin.status;
    await epin.save();
    res.status(201).json({ success: true, transfer: { id: transfer._id, epin: transfer.epinNo, fromMember: transfer.fromMember, toMember: transfer.toMember, transferDate: formatDate(transfer.createdAt), amount: Number(transfer.amount).toFixed(2), status: transfer.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTransferHistory = async (req, res) => {
  try {
    await ensureSeed();
    const transfers = await EpinTransfer.find().sort({ createdAt: -1 });
    if (isAdmin(req)) {
      res.json({ success: true, transfers: transfers.map((doc, index) => ({ id: index + 1, epin: doc.epinNo, fromMember: doc.fromMember, toMember: doc.toMember, transferDate: formatDate(doc.createdAt), amount: Number(doc.amount).toFixed(2), status: doc.status })) });
      return;
    }

    const identifiers = getUserIdentifiers(req);
    if (!identifiers.length) {
      return res.status(403).json({ success: false, message: 'Not authorized to view transfer history' });
    }

    const rows = transfers
      .filter((doc) => identifiers.includes(doc.fromMember) || identifiers.includes(doc.toMember))
      .map((doc, index) => ({ id: index + 1, epin: doc.epinNo, fromMember: doc.fromMember, toMember: doc.toMember, transferDate: formatDate(doc.createdAt), amount: Number(doc.amount).toFixed(2), status: doc.status }));

    res.json({ success: true, transfers: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFranchises = async (req, res) => {
  try {
    await ensureSeed();
    const filter = isAdmin(req) ? {} : { status: 'SHOWING' };
    const rows = await EpinFranchise.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, franchises: rows.map((doc, index) => ({ id: index + 1, franchiseId: doc.franchiseId, name: doc.franchiseName, upi: doc.upiId, whatsapp: doc.whatsappNo, city: doc.city, stock: doc.stock, status: doc.status })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOrUpdateFranchise = async (req, res) => {
  try {
    const payload = req.body || {};
    const franchiseId = String(payload.franchiseId || payload.id || '').trim();
    if (!franchiseId) return res.status(400).json({ success: false, message: 'franchiseId is required' });
    const franchise = await EpinFranchise.findOneAndUpdate(
      { franchiseId },
      {
        franchiseName: payload.franchiseName || payload.name || 'Franchise',
        upiId: payload.upiId || payload.upi || '-',
        whatsappNo: payload.whatsappNo || payload.whatsapp || '-',
        city: payload.city || '-',
        stock: Number(payload.stock || 0),
        status: payload.status || 'SHOWING',
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ success: true, franchise: { franchiseId: franchise.franchiseId, name: franchise.franchiseName, upi: franchise.upiId, whatsapp: franchise.whatsappNo, city: franchise.city, stock: franchise.stock, status: franchise.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFranchise = async (req, res) => {
  try {
    const franchise = await EpinFranchise.findOne({ franchiseId: req.params.franchiseId });
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }

    franchise.status = 'HIDDEN';
    await franchise.save();

    res.json({
      success: true,
      franchise: {
        franchiseId: franchise.franchiseId,
        name: franchise.franchiseName,
        upi: franchise.upiId,
        whatsapp: franchise.whatsappNo,
        city: franchise.city,
        stock: franchise.stock,
        status: franchise.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};