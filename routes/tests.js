const express = require('express');
const axios = require('axios');
const router = express.Router();
const data = require('../data/');
const testData = data.tests
const userData = data.users

router.get('/:id', async (req, res) => {
    let test
    try {
        test = await testData.getTest(req.params.id)
    } catch (e) {
        res.status(404).json({error : e})
    }
    console.log(test)
    res.render('take_test', { layout: "logged_in", test: test })
})

router.post('/', async (req, res) => {

})

module.exports = router;