const express = require('express');
const axios = require('axios');
const router = express.Router();
const data = require('../data/');
const testData = data.tests
const userData = data.users

router.get('/make/', async (req, res) => {
    res.render('make_test', { layout: "logged_in" })
})

router.post('/make/new_test', async (req, res) => {
    console.log(req.body)
    let body = req.body;
    let quiz = null;
    try {
        quiz = await testData.addTestWithQuestions(body.title, body.description, body.question, body.correct_answer, body.distractors)
    } catch (e) {
        console.log(e)
        res.status(404).json({error : e})
    }
    res.render('test_made', { layout: "logged_in", quiz: quiz })
})

router.get('/take/:id', async (req, res) => {
    let test
    try {
        test = await testData.getTest(req.params.id)
    } catch (e) {
        res.status(404).json({error : e})
    }
    console.log(test)
    res.render('take_test', { layout: "logged_in", test: test })
})

router.post('/take/results/:id', async (req, res) => {
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
    // let user = null;
    // try {
    //     user = await userData.getUser(quiz.creator)
    // } catch (e) {
    //     res.status(404).json({error : e})
    // }
    result = { score: score, total: quiz.questions.length }
    res.render("test_results", { layout: "logged_in", result: result, quiz: quiz})
})

router.get('/take/', async (req, res) => {
    let tid = req.query.tid
    console.log(tid)
    let test
    try {
        test = await testData.getTest(tid)
    } catch (e) {
        res.status(404).json({error : e})
    }
    console.log(test)
    res.render('take_test', { layout: "logged_in", test: test })
})

module.exports = router;