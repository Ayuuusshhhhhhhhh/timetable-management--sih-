const User = require('../models/User');
const { validationResult } = require('express-validator');
const db = require('../config/database');

const getAllFaculty = async (req, res) => {
  try {
    const { department } = req.query;
    
    let faculty;
    if (department) {
      faculty = await db('users')
        .where({ role: 'faculty', is_active: true, department })
        .select('id', 'first_name', 'last_name', 'email', 'department', 'phone');
    } else {
      faculty = await User.findFaculty();
    }

    res.json({ faculty });
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;
    const faculty = await User.findById(id);

    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json({ faculty });
  } catch (error) {
    console.error('Get faculty by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getFacultySubjects = async (req, res) => {
  try {
    const { id } = req.params;
    
    const facultySubjects = await db('faculty_subjects')
      .join('subjects', 'faculty_subjects.subject_id', 'subjects.id')
      .join('users', 'faculty_subjects.faculty_id', 'users.id')
      .where('faculty_subjects.faculty_id', id)
      .select(
        'subjects.*',
        'faculty_subjects.id as assignment_id',
        'users.first_name',
        'users.last_name'
      );

    res.json({ assignments: facultySubjects });
  } catch (error) {
    console.error('Get faculty subjects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const assignFacultyToSubject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { faculty_id, subject_id } = req.body;

    // Check if assignment already exists
    const existingAssignment = await db('faculty_subjects')
      .where({ faculty_id, subject_id })
      .first();

    if (existingAssignment) {
      return res.status(400).json({ message: 'Faculty is already assigned to this subject' });
    }

    const [assignmentId] = await db('faculty_subjects').insert({
      faculty_id,
      subject_id,
      assigned_at: new Date()
    });

    res.status(201).json({
      message: 'Faculty assigned to subject successfully',
      assignment_id: assignmentId
    });
  } catch (error) {
    console.error('Assign faculty to subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const removeFacultyFromSubject = async (req, res) => {
  try {
    const { faculty_id, subject_id } = req.params;

    const deletedRows = await db('faculty_subjects')
      .where({ faculty_id, subject_id })
      .del();

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Faculty assignment not found' });
    }

    res.json({ message: 'Faculty removed from subject successfully' });
  } catch (error) {
    console.error('Remove faculty from subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getFacultyStats = async (req, res) => {
  try {
    const stats = await db.raw(`
      SELECT 
        COUNT(*) as total_faculty,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_faculty,
        COUNT(DISTINCT department) as departments
      FROM users 
      WHERE role = 'faculty'
    `);

    const workloadStats = await db.raw(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        COUNT(fs.subject_id) as subject_count
      FROM users u
      LEFT JOIN faculty_subjects fs ON u.id = fs.faculty_id
      WHERE u.role = 'faculty' AND u.is_active = 1
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY subject_count DESC
      LIMIT 10
    `);

    res.json({ 
      stats: stats[0][0] || stats[0],
      workload: workloadStats[0] || workloadStats
    });
  } catch (error) {
    console.error('Get faculty stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllFaculty,
  getFacultyById,
  getFacultySubjects,
  assignFacultyToSubject,
  removeFacultyFromSubject,
  getFacultyStats
};
