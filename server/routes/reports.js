import express from 'express';
import Report from '../models/Report.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'firstName lastName mediaOrganization')
      .populate('event', 'title date location')
      .sort({ date: -1 });
    res.json(reports);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single report
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'firstName lastName mediaOrganization')
      .populate('event', 'title date location');
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create report (reporters only)
router.post('/', authenticate, authorize('reporter'), async (req, res) => {
  try {
    const report = new Report({
      ...req.body,
      reporter: req.user._id
    });
    await report.save();
    await report.populate('reporter', 'firstName lastName mediaOrganization');
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update report
router.put('/:id', authenticate, authorize('reporter'), async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, reporter: req.user._id });
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found or unauthorized' });
    }

    Object.assign(report, req.body);
    await report.save();
    
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete report
router.delete('/:id', authenticate, authorize('reporter'), async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, reporter: req.user._id });
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found or unauthorized' });
    }
    
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
