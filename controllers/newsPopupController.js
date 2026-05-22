const NewsPopup = require('../models/NewsPopup');

const seedRows = [
  { type: 'News', title: 'Welcome', description: 'Welcome to the member dashboard', displayOn: 'Member', publishDate: '28-02-2025', uptoDate: '28-02-2026', status: 'Published' },
];

const ensureSeed = async () => {
  if ((await NewsPopup.countDocuments()) === 0) {
    await NewsPopup.insertMany(seedRows);
  }
};

exports.getNewsPopupList = async (req, res) => {
  try {
    await ensureSeed();
    const { type } = req.query;
    const filter = {};
    if (type && type !== 'All') filter.type = type;
    const rows = await NewsPopup.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, items: rows.map((doc, index) => ({ id: index + 1, title: doc.title, type: doc.type, displayOn: doc.displayOn, publishDate: doc.publishDate, uptoDate: doc.uptoDate, status: doc.status, description: doc.description })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createNewsPopup = async (req, res) => {
  try {
    const payload = req.body || {};
    const item = await NewsPopup.create({
      type: payload.type || 'News',
      title: payload.title || 'Untitled',
      description: payload.description || '',
      displayOn: payload.displayOn || 'Member',
      publishDate: payload.publishDate || new Date().toLocaleDateString('en-GB'),
      uptoDate: payload.uptoDate || new Date().toLocaleDateString('en-GB'),
      status: payload.status || 'Published',
    });
    res.status(201).json({ success: true, item: { id: item._id, title: item.title, type: item.type, displayOn: item.displayOn, publishDate: item.publishDate, uptoDate: item.uptoDate, status: item.status, description: item.description } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateNewsPopup = async (req, res) => {
  try {
    const item = await NewsPopup.findById(req.params.newsId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    Object.assign(item, req.body || {});
    await item.save();
    res.json({ success: true, item: { id: item._id, title: item.title, type: item.type, displayOn: item.displayOn, publishDate: item.publishDate, uptoDate: item.uptoDate, status: item.status, description: item.description } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNewsPopup = async (req, res) => {
  try {
    const item = await NewsPopup.findById(req.params.newsId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    await item.deleteOne();
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};