const express = require('express');
const ranCtrl = require('../controllers/ran.controller');

const router = express.Router();

router.post('/SaveRan', (req, res) => {
  ranCtrl.insert(req.body);
  res.send("Success");
});

router.get('/GetWav/:user_id', (req, res) => {
  let ranQuery = ranCtrl.getWavBase64(req.params.user_id);
  ranQuery.exec( (err, queryValue) => {
    if (err) {
      res.send(err);
    }
    else if (queryValue.length === 0) {
      res.send("User id not found.");
    }
    else if (queryValue.length > 1) {
      res.send("Matched more than one entry: " + req.params.user_id)
    }
    else {
      let filename = `=${req.params.user_id}_ran_file.txt`
      res.set(
        {
          "Content-Disposition": 'attachment; filename' + filename
        }
      );
      res.send(queryValue[0].wav_base64);
    }
  });
});

module.exports = router;

