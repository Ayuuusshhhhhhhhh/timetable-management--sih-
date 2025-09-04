const PDFDocument = require('pdfkit');
const xl = require('excel4node');
const Timetable = require('../models/Timetable');
const moment = require('moment');

class ExportService {
  static async exportTimetableToPDF(academicYear, batchId = null, res) {
    try {
      const doc = new PDFDocument({ margin: 30 });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="timetable-${academicYear}.pdf"`);
      
      // Pipe PDF to response
      doc.pipe(res);

      // Get timetable data
      let timetableData;
      if (batchId) {
        timetableData = await Timetable.findByBatch(batchId, academicYear);
      } else {
        timetableData = await Timetable.findAll(academicYear);
      }

      // Add title
      doc.fontSize(20).text('Timetable', { align: 'center' });
      doc.fontSize(14).text(`Academic Year: ${academicYear}`, { align: 'center' });
      doc.moveDown();

      // Group data by batch and day
      const groupedData = this.groupTimetableData(timetableData);

      // Generate PDF content for each batch
      Object.keys(groupedData).forEach((batchName, batchIndex) => {
        if (batchIndex > 0) {
          doc.addPage();
        }

        // Batch header
        doc.fontSize(16).text(`Batch: ${batchName}`, { underline: true });
        doc.moveDown();

        const batchData = groupedData[batchName];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Create table headers
        const startY = doc.y;
        const rowHeight = 30;
        const colWidth = 90;

        // Draw table headers
        doc.fontSize(10);
        doc.rect(30, startY, colWidth, rowHeight).stroke();
        doc.text('Time/Day', 35, startY + 10);

        days.forEach((day, dayIndex) => {
          const x = 30 + colWidth + (dayIndex * colWidth);
          doc.rect(x, startY, colWidth, rowHeight).stroke();
          doc.text(day.substr(0, 3), x + 5, startY + 10);
        });

        // Get unique time slots
        const timeSlots = [...new Set(
          Object.values(batchData).flat().map(entry => 
            `${entry.start_time}-${entry.end_time}`
          )
        )].sort();

        // Draw table rows
        timeSlots.forEach((timeSlot, rowIndex) => {
          const y = startY + rowHeight + (rowIndex * rowHeight);
          
          // Time column
          doc.rect(30, y, colWidth, rowHeight).stroke();
          doc.text(timeSlot, 35, y + 10);

          // Day columns
          days.forEach((day, dayIndex) => {
            const x = 30 + colWidth + (dayIndex * colWidth);
            doc.rect(x, y, colWidth, rowHeight).stroke();

            const dayEntries = batchData[day] || [];
            const entry = dayEntries.find(e => 
              `${e.start_time}-${e.end_time}` === timeSlot
            );

            if (entry) {
              doc.fontSize(8);
              doc.text(entry.subject_code, x + 2, y + 2);
              doc.text(`${entry.faculty_first_name.substr(0,1)}.${entry.faculty_last_name}`, x + 2, y + 12);
              doc.text(entry.room_number, x + 2, y + 22);
              doc.fontSize(10);
            }
          });
        });

        doc.moveDown(timeSlots.length + 2);
      });

      doc.end();

    } catch (error) {
      console.error('PDF export error:', error);
      throw error;
    }
  }

  static async exportTimetableToExcel(academicYear, batchId = null, res) {
    try {
      const workbook = new xl.Workbook();
      
      // Get timetable data
      let timetableData;
      if (batchId) {
        timetableData = await Timetable.findByBatch(batchId, academicYear);
      } else {
        timetableData = await Timetable.findAll(academicYear);
      }

      // Group data by batch
      const groupedData = this.groupTimetableData(timetableData);

      // Style definitions
      const headerStyle = workbook.createStyle({
        font: { bold: true, size: 12 },
        fill: { type: 'pattern', patternType: 'solid', fgColor: 'E0E0E0' },
        alignment: { horizontal: 'center', vertical: 'center' }
      });

      const cellStyle = workbook.createStyle({
        font: { size: 10 },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
      });

      let sheetIndex = 1;
      // Create worksheet for each batch
      Object.keys(groupedData).forEach(batchName => {
        const worksheet = workbook.addWorksheet(`${batchName.substring(0, 25)}`);
        const batchData = groupedData[batchName];

        // Set up headers
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        worksheet.cell(1, 1).string('Time').style(headerStyle);
        days.forEach((day, index) => {
          worksheet.cell(1, index + 2).string(day).style(headerStyle);
        });

        // Get unique time slots
        const timeSlots = [...new Set(
          Object.values(batchData).flat().map(entry => 
            `${entry.start_time}-${entry.end_time}`
          )
        )].sort();

        // Fill data
        timeSlots.forEach((timeSlot, rowIndex) => {
          const row = rowIndex + 2;
          worksheet.cell(row, 1).string(timeSlot).style(cellStyle);

          days.forEach((day, dayIndex) => {
            const dayEntries = batchData[day] || [];
            const entry = dayEntries.find(e => 
              `${e.start_time}-${e.end_time}` === timeSlot
            );

            if (entry) {
              const cellValue = `${entry.subject_code}\n${entry.faculty_first_name} ${entry.faculty_last_name}\n${entry.room_number}`;
              worksheet.cell(row, dayIndex + 2).string(cellValue).style(cellStyle);
            }
          });
        });

        // Set column widths
        worksheet.column(1).setWidth(15);
        for (let i = 2; i <= days.length + 1; i++) {
          worksheet.column(i).setWidth(20);
        }

        sheetIndex++;
      });

      // Set response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="timetable-${academicYear}.xlsx"`
      );

      // Write to response
      workbook.write('timetable.xlsx', res);

    } catch (error) {
      console.error('Excel export error:', error);
      throw error;
    }
  }

  static groupTimetableData(timetableData) {
    const grouped = {};

    timetableData.forEach(entry => {
      const batchName = entry.batch_name || 'Unknown Batch';
      
      if (!grouped[batchName]) {
        grouped[batchName] = {};
      }

      if (!grouped[batchName][entry.day_of_week]) {
        grouped[batchName][entry.day_of_week] = [];
      }

      grouped[batchName][entry.day_of_week].push(entry);
    });

    // Sort entries by time within each day
    Object.keys(grouped).forEach(batchName => {
      Object.keys(grouped[batchName]).forEach(day => {
        grouped[batchName][day].sort((a, b) => 
          moment(a.start_time, 'HH:mm').diff(moment(b.start_time, 'HH:mm'))
        );
      });
    });

    return grouped;
  }

  static async generateWeeklyReport(academicYear, week, res) {
    try {
      // Get timetable data for the week
      const timetableData = await Timetable.findAll(academicYear);
      
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="weekly-report-${week}.pdf"`);
      
      doc.pipe(res);

      // Add title
      doc.fontSize(18).text(`Weekly Timetable Report - Week ${week}`, { align: 'center' });
      doc.fontSize(12).text(`Academic Year: ${academicYear}`, { align: 'center' });
      doc.moveDown();

      // Generate statistics
      const stats = {
        totalClasses: timetableData.length,
        uniqueBatches: [...new Set(timetableData.map(t => t.batch_name))].length,
        uniqueFaculty: [...new Set(timetableData.map(t => t.faculty_id))].length,
        uniqueClassrooms: [...new Set(timetableData.map(t => t.classroom_id))].length
      };

      doc.text(`Total Classes Scheduled: ${stats.totalClasses}`);
      doc.text(`Active Batches: ${stats.uniqueBatches}`);
      doc.text(`Faculty Involved: ${stats.uniqueFaculty}`);
      doc.text(`Classrooms Used: ${stats.uniqueClassrooms}`);

      doc.end();

    } catch (error) {
      console.error('Weekly report error:', error);
      throw error;
    }
  }
}

module.exports = ExportService;
