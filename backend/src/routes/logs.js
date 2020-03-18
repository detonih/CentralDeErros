const express = require('express');
const router = express.Router();
const controller = require('../controllers/LogsController')
const { authorize } = require('../middlewares/auth')

router.get('/level/:level', authorize, controller.getByLevel)
 
router.get('/sender/:sender_application', authorize, controller.getBySender)

router.post('/', authorize, controller.create)

router.patch('/:logid', authorize, controller.updateEnvironmentLog)

router.delete('/all', authorize, controller.deleteAllLogsByUser
)
router.delete('/:id', authorize, controller.deleteByLogId)

module.exports = router;