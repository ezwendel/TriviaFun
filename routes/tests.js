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

router.post('/take/:id', async (req, res) => {
    console.log(req.params.id)
    let quiz = null;
    try {
        quiz = await testData.getTest(req.params.id)
    } catch (e) {
        res.status(404).json({error : e})
    }
    score = 0;
    for (i of quiz.questions) {
        if (req.body[i._id.toString()] == i.correctAnswer) {
            score += 1;
        }
    }
    let user = null;
    try {
        user = await userData.getUser(quiz.creator)
    } catch (e) {
        res.status(404).json({error : e})
    }
    result = { score: score, total: quiz.questions.length }
    res.render("test_results", { layout: "logged_in", result: result, quiz: quiz, user: user.name })
})

module.exports = router;