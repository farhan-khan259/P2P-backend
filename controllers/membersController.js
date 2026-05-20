const User = require('../models/User');

const formatDate = (value) => {
  if (!value) {
    return '---';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '---';
  }

  return date.toLocaleDateString('en-GB');
};

const buildReferralGraph = (users) => {
  const childrenBySponsor = new Map();

  users.forEach((user) => {
    const sponsorKey = String(user.sponsorId || '').trim();
    if (!sponsorKey) {
      return;
    }

    if (!childrenBySponsor.has(sponsorKey)) {
      childrenBySponsor.set(sponsorKey, []);
    }

    childrenBySponsor.get(sponsorKey).push(user);
  });

  return childrenBySponsor;
};

const collectDescendants = (memberId, childrenBySponsor) => {
  const stack = [...(childrenBySponsor.get(memberId) || [])];
  const descendants = [];

  while (stack.length > 0) {
    const current = stack.pop();
    descendants.push(current);

    const nextChildren = childrenBySponsor.get(current.memberId) || [];
    stack.push(...nextChildren);
  }

  return descendants;
};

const getKycSnapshot = (user) => ({
  sNo: 0,
  status: user.kycStatus === 'REJECTED' ? 'REJECT' : (user.kycStatus || 'PENDING'),
  memberId: user.memberId || '---',
  name: user.name || '---',
  mobile: user.contactNo || '---',
  googlePay: user.kycDetails?.googlePayNumber || user.paymentDetails?.googlePay || '---',
  phonePe: user.kycDetails?.phonePeNumber || user.paymentDetails?.phonePe || '---',
  upiId: user.kycDetails?.upiId || user.paymentDetails?.upiId || '---',
  panNo: user.kycDetails?.panNo || user.panNo || '---',
  adharNo: user.kycDetails?.aadharCardNumber || user.aadharNo || '---',
  accountHolder: user.kycDetails?.accountHolderName || user.bankDetails?.holderName || '---',
  accountNo: user.kycDetails?.bankAccountNumber || user.bankDetails?.accountNo || '---',
  bankName: user.kycDetails?.bankName || user.bankDetails?.bankName || '---',
  branch: user.kycDetails?.bankBranch || user.bankDetails?.bankBranch || '---',
  ifscCode: user.kycDetails?.ifscCode || user.bankDetails?.ifsc || '---',
  createdAt: user.createdAt,
});

exports.getAdminKycRequests = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    const rows = users.map((user, index) => ({
      ...getKycSnapshot(user),
      sNo: index + 1,
    }));

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching KYC requests',
      error: error.message,
    });
  }
};

exports.updateKycStatus = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { status, remarks } = req.body;

    if (!['APPROVED', 'PENDING', 'REJECT', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid KYC status',
      });
    }

    const normalizedStatus = status === 'REJECT' ? 'REJECTED' : status;

    const user = await User.findOneAndUpdate(
      { memberId: memberId.toUpperCase(), role: 'user' },
      {
        kycStatus: normalizedStatus,
        kycRemarks: remarks || '',
        kycReviewedAt: new Date(),
        kycReviewedBy: req.user.id,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'KYC status updated successfully',
      data: getKycSnapshot(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating KYC status',
      error: error.message,
    });
  }
};

exports.getAllMembersList = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });

    const rows = users.map((user, index) => ({
      sNo: index + 1,
      sponsorId: user.sponsorId || '---',
      memberId: user.memberId || '---',
      name: user.name || '---',
      mobile: user.contactNo || '---',
      joinDate: formatDate(user.createdAt),
      joinDateRaw: user.createdAt,
      jLevel: user.joiningLevel || 1,
      city: user.city || '---',
      status: user.accountStatus || 'ACTIVE',
      password: '********',
      transPassword: '********',
      wallet: Number(user.walletBalance || 0).toFixed(2),
    }));

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching members list',
      error: error.message,
    });
  }
};

exports.getMembersLocation = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });

    const rows = users.map((user, index) => ({
      srNo: String(index + 1),
      memberId: user.memberId || '---',
      name: user.name || '---',
      mobile: user.contactNo || '---',
      dob: formatDate(user.dateOfBirth),
      joinDate: formatDate(user.createdAt),
      joinDateRaw: user.createdAt,
      adharNo: user.aadharNo || '---',
      panNo: user.panNo || '---',
      address: user.address || '---',
      state: user.state || '---',
      district: user.district || '---',
      city: user.city || '---',
      pinCode: user.pincode || '---',
      emailId: user.email || '---',
      status: user.accountStatus || 'ACTIVE',
    }));

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching members location',
      error: error.message,
    });
  }
};

exports.getMemberPerformance = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    const childrenBySponsor = buildReferralGraph(users);

    const rows = users.map((user, index) => {
      const descendants = collectDescendants(user.memberId, childrenBySponsor);
      const activeDescendants = descendants.filter((descendant) => descendant.accountStatus === 'ACTIVE');
      const inactiveDescendants = descendants.filter((descendant) => descendant.accountStatus !== 'ACTIVE');
      const totalTeamCount = descendants.length;
      const activeTeamCount = activeDescendants.length;
      const inactiveTeamCount = inactiveDescendants.length;
      const levelIncome = totalTeamCount * 100;
      const repurchaseIncome = totalTeamCount * 100;
      const donationIncome = totalTeamCount * 50;
      const totalIncome = levelIncome + repurchaseIncome + donationIncome;

      return {
        sNo: index + 1,
        memberId: user.memberId || '---',
        memberName: user.name || '---',
        mobile: user.contactNo || '---',
        joinDate: formatDate(user.createdAt),
        joinDateRaw: user.createdAt,
        status: user.accountStatus || 'ACTIVE',
        joiningLevel: user.joiningLevel || 1,
        unlockLevel: user.unlockLevel || 1,
        rank: user.rank || '---',
        activeTeamCount,
        inactiveTeamCount,
        totalTeamCount,
        levelIncome,
        repurchaseIncome,
        donationIncome,
        totalIncome,
      };
    });

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching member performance',
      error: error.message,
    });
  }
};