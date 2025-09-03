const Classroom = require('../models/Classroom');
const { validationResult } = require('express-validator');

const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.findAll();
    res.json({ classrooms });
  } catch (error) {
    console.error('Get classrooms error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getClassroomById = async (req, res) => {
  try {
    const { id } = req.params;
    const classroom = await Classroom.findById(id);
    
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    res.json({ classroom });
  } catch (error) {
    console.error('Get classroom error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createClassroom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const classroom = await Classroom.create(req.body);
    res.status(201).json({
      message: 'Classroom created successfully',
      classroom
    });
  } catch (error) {
    console.error('Create classroom error:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ message: 'Room number already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateClassroom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const classroom = await Classroom.update(id, req.body);
    
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    res.json({
      message: 'Classroom updated successfully',
      classroom
    });
  } catch (error) {
    console.error('Update classroom error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    await Classroom.delete(id);
    res.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    console.error('Delete classroom error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getClassroomsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const classrooms = await Classroom.findByType(type);
    res.json({ classrooms });
  } catch (error) {
    console.error('Get classrooms by type error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllClassrooms,
  getClassroomById,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  getClassroomsByType
};
