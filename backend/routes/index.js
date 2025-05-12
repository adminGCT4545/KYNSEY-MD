const patientRoutes = require('./patientRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const labResultsRoutes = require('./labResultsRoutes');
const documentsRoutes = require('./documentsRoutes');
const clinicalNotesRoutes = require('./clinicalNotesRoutes');
const vitalSignsRoutes = require('./vitalSignsRoutes');
const medicalHistoryRoutes = require('./medicalHistoryRoutes');

module.exports = {
  patientRoutes,
  appointmentRoutes,
  labResultsRoutes,
  documentsRoutes,
  clinicalNotesRoutes,
  vitalSignsRoutes,
  medicalHistoryRoutes
};