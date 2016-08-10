var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.isAuthenticated()){
        res.redirect('/projects');
    } else {
        res.render('index', { title: 'Glance', homepage:true });
    }  
});

module.exports = router;
