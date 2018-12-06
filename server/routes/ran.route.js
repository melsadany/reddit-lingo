const express = require('express');
const ranCtrl = require('../controllers/ran.controller');

const router = express.Router();

router.post('/ran_test', (req, res) => {
  console.log(req.body);
  ranCtrl.insert(req.body);
  res.send("Success");
})
router.route('/SaveRan', (req) => {

})



module.exports = router;

