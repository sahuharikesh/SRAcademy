const router = require('express').Router();
const ctrl   = require('../controllers/feeController');

router.get('/',                   ctrl.getAll);
router.get('/due',                ctrl.getDue);         // must be before /student/:id
router.get('/student/:studentId', ctrl.getByStudent);
router.post('/',                  ctrl.create);
router.post('/generate',          ctrl.generate);
router.patch('/pay/:id',          ctrl.markPaid);
router.patch('/notified/:id',     ctrl.markNotified);
router.patch('/comments/:id',     ctrl.updateComments);
router.delete('/:id',             ctrl.remove);

module.exports = router;
