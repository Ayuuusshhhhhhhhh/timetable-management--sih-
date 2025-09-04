const Batch = require('../models/Batch');
const { validationResult } = require('express-validator');

const getAllBatches = async (req, res) => {
  try {
    const { department, academic_year } = req.query;
    
    let batches;
    if (department) {
      batches = await Batch.findByDepartment(department);
    } else if (academic_year) {
      batches = await Batch.findByAcademicYear(academic_year);
    } else {
      batches = await Batch.findAll();
    }

    res.json({ batches });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json({ batch });
  } catch (error) {
    console.error('Get batch by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getBatchWithSubjects = async (req, res) => {
  try {
    const { id } = req.params;
    const batchWithSubjects = await Batch.getWithSubjects(id);

    if (!batchWithSubjects || batchWithSubjects.length === 0) {
      return res.status(404).json({ message: 'Batch not found or no subjects assigned' });
    }

    res.json({ batch: batchWithSubjects });
  } catch (error) {
    console.error('Get batch with subjects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getBatchTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { academic_year } = req.query;

    if (!academic_year) {
      return res.status(400).json({ message: 'Academic year is required' });
    }

    const timetable = await Batch.getTimetable(id, academic_year);
    res.json({ timetable });
  } catch (error) {
    console.error('Get batch timetable error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createBatch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { batch_name, department, academic_year } = req.body;
    
    // Check if batch name already exists for the same department and academic year
    const existingBatches = await Batch.findByAcademicYear(academic_year);
    const duplicateBatch = existingBatches.find(batch => 
      batch.batch_name === batch_name && batch.department === department
    );
    
    if (duplicateBatch) {
      return res.status(400).json({ 
        message: 'Batch with this name already exists for the department and academic year' 
      });
    }

    const newBatch = await Batch.create(req.body);
    res.status(201).json({
      message: 'Batch created successfully',
      batch: newBatch
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateBatch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { batch_name, department, academic_year } = req.body;

    // Check if batch exists
    const existingBatch = await Batch.findById(id);
    if (!existingBatch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check for duplicate batch name if it's being changed
    if (batch_name && (batch_name !== existingBatch.batch_name || 
        department !== existingBatch.department || 
        academic_year !== existingBatch.academic_year)) {
      
      const currentAcademicYear = academic_year || existingBatch.academic_year;
      const existingBatches = await Batch.findByAcademicYear(currentAcademicYear);
      const duplicateBatch = existingBatches.find(batch => 
        batch.id !== parseInt(id) &&
        batch.batch_name === batch_name && 
        batch.department === (department || existingBatch.department)
      );
      
      if (duplicateBatch) {
        return res.status(400).json({ 
          message: 'Batch with this name already exists for the department and academic year' 
        });
      }
    }

    const updatedBatch = await Batch.update(id, req.body);
    res.json({
      message: 'Batch updated successfully',
      batch: updatedBatch
    });
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const existingBatch = await Batch.findById(id);
    if (!existingBatch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    await Batch.delete(id);
    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getBatchStats = async (req, res) => {
  try {
    const stats = await Batch.getStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get batch stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const searchBatches = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const batches = await Batch.findAll();
    const filteredBatches = batches.filter(batch => 
      batch.batch_name.toLowerCase().includes(q.toLowerCase()) ||
      batch.department.toLowerCase().includes(q.toLowerCase()) ||
      batch.academic_year.toLowerCase().includes(q.toLowerCase())
    );

    res.json({ batches: filteredBatches });
  } catch (error) {
    console.error('Search batches error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllBatches,
  getBatchById,
  getBatchWithSubjects,
  getBatchTimetable,
  createBatch,
  updateBatch,
  deleteBatch,
  getBatchStats,
  searchBatches
};
