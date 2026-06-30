const router = require('express').Router();
const c = require('../controllers/resultController');

router.post('/save',            c.saveStudentMarks);
router.get('/student/:studentId', c.getStudentResults);
router.delete('/delete',        c.deleteStudentExam);

module.exports = router;
