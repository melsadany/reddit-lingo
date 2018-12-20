const express = require('express');
const ranCtrl = require('../controllers/ran.controller');

const router = express.Router();

router.post('/SaveRan', (req, res) => {
  ranCtrl.insert(req.body);
  res.send("Success");
});



module.exports = router;

