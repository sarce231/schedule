import express from 'express';
import Schedule from '../models/Schedule.js'; // Perhatikan tambahan ".js"

const router = express.Router();

// Endpoint untuk menambahkan jadwal
router.post('/', async (req, res) => {
  const newSchedule = new Schedule(req.body);
  try {
    await newSchedule.save();
    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add schedule', details: error.message });
  }
});

// Endpoint untuk mendapatkan semua jadwal
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.json(schedules);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch schedules', details: error.message });
  }
});

// Endpoint untuk mengedit jadwal
router.put('/:id', async (req, res) => {
  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSchedule);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update schedule', details: error.message });
  }
});

// Endpoint untuk menghapus jadwal
router.delete('/:id', async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    return res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete schedule', details: error.message });
  }
});

export default router;
