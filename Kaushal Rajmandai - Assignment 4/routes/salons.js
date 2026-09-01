const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const authMiddleware = require('../middleware/authMiddleware');

// Specific routes BEFORE /:id so the id param doesn't swallow them
router.get('/top', salonController.getTop);
router.get('/city/:city', salonController.getByCity);

router.get('/', salonController.getAll);
router.get('/:id', salonController.getById);
router.post('/', authMiddleware, salonController.create);
router.put('/:id', authMiddleware, salonController.update);
router.delete('/:id', authMiddleware, salonController.remove);

router.get('/:id/services', salonController.getServices);
router.post('/:id/services', authMiddleware, salonController.addService);

module.exports = router;