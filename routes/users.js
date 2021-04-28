
const express = require('express');
const axios = require('axios');
const router = express.Router();
const data = require('../data/');
const testData = data.tests
const userData = data.users

router.get('/', async (req, res) => {
    if (req.session.AuthCookie) {
        user = null
        try {
            user = await userData.getUser(req.session.AuthCookie.userId)
        } catch (e) {
            res.render('error', { title: "Error", layout: "logged_in", error : e})
            return;
        }
        let testArr = []
        for (testId of user.tests) {
            currTest = null;
            try {
                currTest = await testData.getTest(testId)
                testArr.push(currTest)
            } catch (e) {
                console.log(e)
                res.render('error', { title: "Error", layout: "logged_in", error : e})
                return;
            }
        }
        let scoreArr = []
        for (testId in user.scores) {
            currTest = null;
            try {
                currTest = await testData.getTest(testId)
                scoreArr.push({title: currTest.title, id: testId, score: user.scores[testId], total: currTest.questions.length})
            } catch (e) {
                console.log(e)
                res.render('error', { title: "Error", layout: "logged_in", error : e}) 
                return;
            }
        }
        console.log({ name: user.name, tests: testArr, scores: scoreArr })
        res.render('profile', { title: `${user.name}'s Profile`, layout: "logged_in", user: { name: user.name, tests: testArr, scores: scoreArr } })
    } else {
        res.redirect("/login")
    }
})

// router.get('/:id', async (req, res) => {
    
// })

// router.post('/', async (req, res) => {
    
// })

module.exports = router;