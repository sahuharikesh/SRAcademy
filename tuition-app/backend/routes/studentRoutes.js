const router = require('express').Router();
const ctrl   = require('../controllers/studentController');

router.get('/',                    ctrl.getAll);
router.get('/groups',              ctrl.getGroups);
router.get('/group/:groupNo',      ctrl.getByGroup);
router.post('/',                   ctrl.create);
router.put('/:id',                 ctrl.update);
router.delete('/:id',              ctrl.remove);

module.exports = router;
