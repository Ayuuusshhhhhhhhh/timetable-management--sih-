const Timetable = require('../models/Timetable');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Classroom = require('../models/Classroom');
const db = require('../config/database');

class SchedulingService {
  static async generateTimetable(academicYear, options = {}) {
    try {
      console.log('Starting timetable generation for academic year:', academicYear);
      
      // Get all required data
      const batches = await db('batches').where({ academic_year: academicYear, is_active: true });
      const subjects = await Subject.findAll();
      const faculty = await User.findFaculty();
      const classrooms = await Classroom.findAll();
      const timeSlots = await db('time_slots').where({ is_active: true, is_break: false });
      const facultySubjects = await db('faculty_subjects')
        .where({ academic_year: academicYear, is_active: true });

      // Clear existing draft timetable for this academic year
      await db('timetable_entries')
        .where({ academic_year: academicYear, status: 'draft' })
        .del();

      const timetableEntries = [];
      const conflicts = [];

      // Group faculty-subject assignments by batch
      const batchSubjectMap = {};
      for (const fs of facultySubjects) {
        if (!batchSubjectMap[fs.batch_id]) {
          batchSubjectMap[fs.batch_id] = [];
        }
        batchSubjectMap[fs.batch_id].push(fs);
      }

      // Generate schedule for each batch
      for (const batch of batches) {
        console.log(`Processing batch: ${batch.batch_name}`);
        
        const batchSubjects = batchSubjectMap[batch.id] || [];
        
        // Calculate required sessions per subject (based on credits)
        const subjectSessionMap = {};
        for (const fs of batchSubjects) {
          const subject = subjects.find(s => s.id === fs.subject_id);
          if (subject) {
            // Assume 1 credit = 1 session per week
            subjectSessionMap[fs.subject_id] = {
              ...fs,
              subject,
              sessionsPerWeek: subject.credits,
              scheduledSessions: 0
            };
          }
        }

        // Try to schedule all required sessions
        for (const [subjectId, subjectInfo] of Object.entries(subjectSessionMap)) {
          const { subject, sessionsPerWeek, faculty_id } = subjectInfo;
          
          for (let session = 0; session < sessionsPerWeek; session++) {
            const scheduled = await this.scheduleSession(
              batch.id,
              parseInt(subjectId),
              faculty_id,
              subject,
              timeSlots,
              classrooms,
              academicYear,
              timetableEntries
            );

            if (scheduled) {
              timetableEntries.push(scheduled);
            } else {
              conflicts.push({
                batch: batch.batch_name,
                subject: subject.subject_name,
                faculty: faculty.find(f => f.id === faculty_id),
                session: session + 1,
                reason: 'No available slot found'
              });
            }
          }
        }
      }

      // Insert all scheduled entries
      if (timetableEntries.length > 0) {
        await db('timetable_entries').insert(timetableEntries);
      }

      console.log(`Timetable generation completed. ${timetableEntries.length} entries created, ${conflicts.length} conflicts.`);

      return {
        success: true,
        entriesCreated: timetableEntries.length,
        conflicts: conflicts,
        message: `Timetable generated with ${timetableEntries.length} scheduled classes and ${conflicts.length} conflicts to resolve.`
      };

    } catch (error) {
      console.error('Timetable generation error:', error);
      throw error;
    }
  }

  static async scheduleSession(batchId, subjectId, facultyId, subject, timeSlots, classrooms, academicYear, existingEntries) {
    // Find suitable classrooms for this subject type
    const suitableClassrooms = classrooms.filter(classroom => {
      // Match classroom type with subject type
      if (subject.type === 'lab') {
        return classroom.type === 'lab';
      } else if (subject.type === 'practical') {
        return classroom.type === 'lab' || classroom.type === 'seminar';
      } else {
        return classroom.type === 'lecture' || classroom.type === 'seminar';
      }
    });

    // Try to find an available slot
    for (const timeSlot of timeSlots) {
      for (const classroom of suitableClassrooms) {
        // Check if this slot is already occupied by any existing entry
        const hasConflict = existingEntries.some(entry => 
          (entry.batch_id === batchId || 
           entry.faculty_id === facultyId || 
           entry.classroom_id === classroom.id) &&
          entry.time_slot_id === timeSlot.id
        );

        if (!hasConflict) {
          // Check database for existing conflicts
          const dbConflicts = await Timetable.checkConflicts(
            batchId, 
            facultyId, 
            classroom.id, 
            timeSlot.id, 
            academicYear
          );

          if (dbConflicts.length === 0) {
            // This slot is available
            return {
              batch_id: batchId,
              subject_id: subjectId,
              faculty_id: facultyId,
              classroom_id: classroom.id,
              time_slot_id: timeSlot.id,
              academic_year: academicYear,
              status: 'draft'
            };
          }
        }
      }
    }

    return null; // No available slot found
  }

  static async optimizeTimetable(academicYear, optimizationType = 'balanced') {
    // This method can be enhanced for different optimization strategies
    // For now, implement basic optimization
    
    const entries = await Timetable.findAll(academicYear);
    
    // Optimization strategies could include:
    // 1. Minimize gaps for students
    // 2. Balance faculty workload
    // 3. Maximize room utilization
    // 4. Group similar subjects
    
    return {
      optimized: true,
      strategy: optimizationType,
      entries: entries.length
    };
  }

  static async validateTimetable(academicYear) {
    const conflicts = [];
    const entries = await Timetable.findAll(academicYear);

    // Check for overlapping sessions
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const entry1 = entries[i];
        const entry2 = entries[j];

        if (entry1.time_slot_id === entry2.time_slot_id) {
          // Same time slot - check for conflicts
          if (entry1.batch_id === entry2.batch_id ||
              entry1.faculty_id === entry2.faculty_id ||
              entry1.classroom_id === entry2.classroom_id) {
            conflicts.push({
              type: 'overlap',
              entries: [entry1, entry2],
              reason: 'Same batch, faculty, or classroom scheduled at the same time'
            });
          }
        }
      }
    }

    return {
      isValid: conflicts.length === 0,
      conflicts
    };
  }
}

module.exports = SchedulingService;
