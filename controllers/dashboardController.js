const User = require('../models/User');

// @desc Admin dashboard metrics
// @route GET /api/dashboard/admin
// @access Private (admin)
exports.adminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersLast7Days = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    const usersWithBank = await User.countDocuments({ 'bankDetails.accountNo': { $exists: true, $ne: '' } });

    // Top sponsors (by direct referrals)
    const topSponsorsAgg = await User.aggregate([
      { $match: { sponsorId: { $exists: true, $ne: '' } } },
      { $group: { _id: '$sponsorId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const topSponsors = topSponsorsAgg.map((s) => ({ sponsorId: s._id, referrals: s.count }));

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        newUsersLast7Days,
        usersWithBank,
        topSponsors,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching admin dashboard', error: error.message });
  }
};

// @desc User dashboard data for logged-in user
// @route GET /api/dashboard/user
// @access Private
exports.userDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('memberId name joiningPackage createdAt role rank');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Count direct referrals
    const referralsCount = await User.countDocuments({ sponsorId: user.memberId });

    const recentReferrals = await User.find({ sponsorId: user.memberId })
      .select('memberId name contactNo createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Build complete dashboard response with placeholders for financial data (models pending)
    res.status(200).json({
      success: true,
      data: {
        memberId: user.memberId,
        name: user.name,
        joiningPackage: user.joiningPackage || '---',
        registeredAt: user.createdAt,
        referralsCount,
        recentReferrals,
        // Financial metrics (placeholder values until Income/Transaction models created)
        totalEarning: '₹ 0',
        lastMonthIncome: '₹ 0',
        pendingHelp: '₹ 0',
        givenHelp: '₹ 0',
        receivedHelp: '₹ 0',
        yesterdayReceivedHelp: '₹ 0',
        levelIncome: '₹ 0',
        yesterdayLevelIncome: '₹ 0',
        repurchaseIncome: '₹ 0',
        yesterdayRepurchaseIncome: '₹ 0',
        totalLRIncome: '₹ 0',
        yesterdayTotalIncome: '₹ 0',
        totalTeam: referralsCount,
        yesterdayJoining: 0,
        unlockLevel: '---',
        upgradedLevel: '---',
        rank: user.rank || '---',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user dashboard', error: error.message });
  }
};

// @desc Admin full dashboard metrics (fallback values where data models missing)
// @route GET /api/dashboard/admin/full
// @access Private (admin)
exports.adminFullDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaysJoiningMembers = await User.countDocuments({ createdAt: { $gte: startOfToday } });

    // Define active as users created in last 90 days (best-effort without activity model)
    const nintyDaysAgo = new Date();
    nintyDaysAgo.setDate(nintyDaysAgo.getDate() - 90);
    const activeMembers = await User.countDocuments({ createdAt: { $gte: nintyDaysAgo } });

    const inactiveMembers = Math.max(0, totalUsers - activeMembers);

    // Build admin stats — many values are placeholders until corresponding models exist
    const adminStats = [
      { label: 'Total Joining Turnover', value: '₹ 0' },
      { label: 'Profit on Joining', value: '₹ 0' },
      { label: 'Total Donation Amount', value: '₹ 0' },
      { label: "Yesterday's Donation Amount", value: '₹ 0' },
      { label: 'Total Level Income', value: '₹ 0' },
      { label: "Yesterday's Level Income", value: '₹ 0' },
      { label: 'Total Repurchase Income', value: '₹ 0' },
      { label: "Yesterday's Repurchase Income", value: '₹ 0' },
      { label: 'Generated Total Income', value: '₹ 0' },
      { label: 'Total Deducted Charges', value: '₹ 0' },
      { label: 'Total Payout Amount', value: '₹ 0' },
      { label: 'Succeed Payout', value: '₹ 0' },
      { label: 'Awaiting Payout Request', value: '₹ 0' },
      { label: 'Pending Payout', value: '₹ 0' },
      { label: 'TDS Deducted 5%', value: '₹ 0' },
      { label: 'Deducted Admin Charge 5%', value: '₹ 0' },
      { label: 'Total Joining Members', value: `${totalUsers}` },
      { label: "Today's Joining Members", value: `${todaysJoiningMembers}` },
      { label: 'Active Members', value: `${activeMembers}` },
      { label: 'In-Active Members', value: `${inactiveMembers}` },
      { label: 'Total Generated ePins', value: '0' },
      { label: 'Pending ePin Request', value: '0' },
      { label: 'Used ePins', value: '0' },
      { label: 'Unused ePins', value: '0' },
      { label: 'Alloted ePins', value: '0' },
      { label: 'Unallotted ePins', value: '0' },
      { label: 'Total sales Packages', value: '0' },
      { label: 'Delivered Package', value: '0' },
      { label: 'Awaiting Package Request', value: '0' },
      { label: 'Pending Package Orders', value: '0' },
      { label: 'Development Fund', value: '₹ 0' },
      { label: 'Product Fund', value: '₹ 0' },
      { label: 'Total Coupons', value: '0' },
      { label: 'Used Coupons', value: '0' },
      { label: 'Active Coupons', value: '0' },
      { label: 'Expired Coupons', value: '0' }
    ];

    res.status(200).json({ success: true, data: { stats: adminStats } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching full admin dashboard', error: error.message });
  }
};
