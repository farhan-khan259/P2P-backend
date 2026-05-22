const SiteSetting = require('../models/SiteSetting');

const defaultPlanSetting = {
  levelIncome: ['00.00', '20.00', '20.00', '20.00', '20.00', '20.00', '20.00', '20.00', '20.00', '20.00'],
  repurchaseIncome: ['10.00', '10.00', '10.00', '10.00', '10.00', '10.00', '10.00', '10.00', '10.00', '10.00'],
  donationIncome: ['300.00', '1000.00', '2000.00', '4000.00', '8000.00', '16000.00', '32000.00', '64000.00', '128000.00', '-'],
  tdsCharge: '5 %',
  adminCharges: '5 %',
  idRenewalCharge: '₹ 350',
};

const defaultBankAccount = {
  bankName: 'State Bank Of India',
  bankBranch: 'Pashan Pune',
  accountHolderName: 'Elcon Network',
  accountNo: '458578525894',
  accountType: 'Current Account',
  ifscCode: 'SBIN004736',
  upiId: 'Elcon.network@oksbi',
};

const ensureSeed = async () => {
  const plan = await SiteSetting.findOne({ settingKey: 'plan-setting' });
  if (!plan) await SiteSetting.create({ settingKey: 'plan-setting', data: defaultPlanSetting });
  const bank = await SiteSetting.findOne({ settingKey: 'bank-account' });
  if (!bank) await SiteSetting.create({ settingKey: 'bank-account', data: defaultBankAccount });
};

exports.getPlanSetting = async (req, res) => {
  try {
    await ensureSeed();
    const setting = await SiteSetting.findOne({ settingKey: 'plan-setting' });
    res.json({ success: true, planSetting: setting?.data || defaultPlanSetting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePlanSetting = async (req, res) => {
  try {
    const setting = await SiteSetting.findOneAndUpdate(
      { settingKey: 'plan-setting' },
      { data: { ...defaultPlanSetting, ...(req.body || {}) } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, planSetting: setting.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBankAccount = async (req, res) => {
  try {
    await ensureSeed();
    const setting = await SiteSetting.findOne({ settingKey: 'bank-account' });
    res.json({ success: true, bankAccount: setting?.data || defaultBankAccount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBankAccount = async (req, res) => {
  try {
    const setting = await SiteSetting.findOneAndUpdate(
      { settingKey: 'bank-account' },
      { data: { ...defaultBankAccount, ...(req.body || {}) } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, bankAccount: setting.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};