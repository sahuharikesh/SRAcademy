const router = require('express').Router();
const ctrl   = require('../controllers/attendanceController');

router.get('/monthly',       ctrl.getMonthlyReport);
router.get('/absent/:date',  ctrl.getAbsent);   // must be before /:date
router.get('/:date',         ctrl.getByDate);
router.post('/bulk',         ctrl.saveBulk);
router.patch('/notified/:id', ctrl.markNotified);

module.exports = router;
