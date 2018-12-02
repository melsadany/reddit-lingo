const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const ranCtrl = require('../controllers/ran.controller');

const router = express.Router();

router.post('/ran_test', (req, res) => {
  res.send("OK");
})
router.route('/SaveRan')
  .post(asyncHandler(insert));


async function insert(req, res) {
  let ran = await ranCtrl.insert(req.body);
  res.json(ran);
}

module.exports = router;

