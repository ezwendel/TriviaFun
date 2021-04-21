const express = require('express');
const axios = require('axios');
const router = express.Router();
const data = require('../data/');
const testData = data.tests
const userData = data.users

router.get('/make/', async (req, res) => {
    res.render('make_test', { title: "Make Test", layout: "logged_in" })
})

router.post('/make/new_test', async (req, res) => {
    console.log(req.body)
    let body = req.body;
    let quiz = null;
    try {
        quiz = await testData.addTestWithQuestions(body.title, body.description, body.question, body.correct_answer, body.distractors)
    } catch (e) {
        res.render('error', { title: "Error", layout: "logged_in", error : e})
        return;
    }
    titleStr = `Made Test: ${quiz.title}`
    res.render('test_made', { title: titleStr, layout: "logged_in", quiz: quiz })
})

router.get('/take/:id', async (req, res) => {
    let test
    try {
        test = await testData.getTest(req.params.id)
    } catch (e) {
        res.render('error', { title: "Error", layout: "logged_in", error : e})
        return;
    }
    res.render('take_test', { title: test.title, layout: "logged_in", test: test })
})

router.post('/take/results/:id', async (req, res) => {
    console.log(req.params.id)
    let quiz = null;
    try {
        quiz = await testData.getTest(req.params.id)
    } catch (e) {
        res.render('error', { title: "Error", layout: "logged_in", error : e})
        return;
    }
    score = 0;
    for (i of quiz.questions) {
        if (req.body[i._id.toString()] == i.correctAnswer) {
            score += 1;
        }
    }
    titleStr = `Results on ${quiz.title}`
    result = { score: score, total: quiz.questions.length }
    res.render("test_results", { title: titleStr, layout: "logged_in", result: result, quiz: quiz})
})

router.get('/take/', async (req, res) => {
    let tid = req.query.tid
    console.log(tid)
    let test
    try {
        test = await testData.getTest(tid)
    } catch (e) {
        res.render('error', { title: "Error", layout: "logged_in", error : e})
        return;
    }
    res.render('take_test', { title: test.title, layout: "logged_in", test: test })
})

router.get('/', async (req, res) => {
    let allTests = null;
    try {
        allTests = await testData.getAllTests()
    } catch (e) {
        res.render('error', { title: "Error", layout: "logged_in", error : e})
        return;
    }
    res.render('all_tests', { title: "All Tests", layout: "logged_in", tests: allTests })
})

module.exports = router;