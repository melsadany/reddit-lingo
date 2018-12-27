const express = require("express");
const assessCtrl = require("../controllers/assessments.controller");

const router = express.Router();

router.post("/SaveAssessments", (req, res) => {
  console.log(req.session);
  console.log(req.body.user_id);
  req.body.user_id = req.session.user_id;
  assessCtrl.insert(req.body);
  res.send("Success");
});

router.get("/GetUser/:user_id", (req, res) => {
  let assessmentsQuery = assessCtrl.getWavBase64(req.params.user_id);
  assessmentsQuery.exec((err, queryValue) => {
    if (err) {
      res.send(err);
    } else if (queryValue.length === 0) {
      res.send("User id not found.");
    } else if (queryValue.length > 1) {
      res.send("Matched more than one entry: " + req.params.user_id);
    } else {
      let filename = `=${req.params.user_id}_ran_file.json`;
      res.set({
        "Content-Disposition": "attachment; filename" + filename
      });
      res.send(queryValue[0]);
    }
  });
});


module.exports = router;
