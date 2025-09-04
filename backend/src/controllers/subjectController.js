const Subject = require('../models/Subject');
const { validationResult } = require('express-validator');

const getAllSubjects = async (req, res) => {
  try {
    const { department, type } = req.query;
    
    let subjects;
    if (department) {
      subjects = await Subject.findByDepartment(department);
    } else if (type) {
      subjects = await Subject.findByType(type);
    } else {
      subjects = await Subject.findAll();
    }

    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ subject });
  } catch (error) {
    console.error('Get subject by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSubjectWithFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const subjectWithFaculty = await Subject.getWithFaculty(id);

    if (!subjectWithFaculty || subjectWithFaculty.length === 0) {
      return res.status(404).json({ message: 'Subject not found or no faculty assigned' });
    }

    res.json({ subject: subjectWithFaculty });
  } catch (error) {
    console.error('Get subject with faculty error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createSubject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject_code } = req.body;
    
    // Check if subject code already exists
    const existingSubject = await Subject.findByCode(subject_code);
    if (existingSubject) {
      return res.status(400).json({ message: 'Subject code already exists' });
    }

    const newSubject = await Subject.create(req.body);
    res.status(201).json({
      message: 'Subject created successfully',
      subject: newSubject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateSubject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { subject_code } = req.body;

    // Check if subject exists
    const existingSubject = await Subject.findById(id);
    if (!existingSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if subject code is being changed and if it already exists
    if (subject_code && subject_code !== existingSubject.subject_code) {
      const codeExists = await Subject.findByCode(subject_code);
      if (codeExists) {
        return res.status(400).json({ message: 'Subject code already exists' });
      }
    }

    const updatedSubject = await Subject.update(id, req.body);
    res.json({
      message: 'Subject updated successfully',
      subject: updatedSubject
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const existingSubject = await Subject.findById(id);
    if (!existingSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await Subject.delete(id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSubjectStats = async (req, res) => {
  try {
    const stats = await Subject.getStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get subject stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const searchSubjects = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const subjects = await Subject.findAll();
    const filteredSubjects = subjects.filter(subject => 
      subject.subject_name.toLowerCase().includes(q.toLowerCase()) ||
      subject.subject_code.toLowerCase().includes(q.toLowerCase()) ||
      subject.department.toLowerCase().includes(q.toLowerCase())
    );

    res.json({ subjects: filteredSubjects });
  } catch (error) {
    console.error('Search subjects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  getSubjectWithFaculty,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectStats,
  searchSubjects
};
