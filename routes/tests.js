const express = require('express');
const axios = require('axios');
const router = express.Router();
const data = require('../data/');
const testData = data.tests
const userData = data.users

router.get('/make/', async (req, res) => {
    if (req.session.AuthCookie) {
        res.render('make_test_other', { title: "Make Test", layout: "logged_in" })
    } else {
        res.render('make_test_other', { title: "Make Test" })
    }
})

router.get('/find/', async (req, res) => {
    if (req.session.AuthCookie) {
        res.render('find_test', { title: "Find Test", layout: "logged_in" })
    } else {
        res.render('find_test', { title: "Find Test" })
    }
})

router.post('/make/new_test', async (req, res) => {
    console.log(req.body)
    let body = req.body;
    let quiz = null;
    let title = body.title
    let description = body.description
    let questions = body.question
    let answers = body.correct_answer
    let distractor1 = body.distractor1
    let distractor2 = body.distractor2
    let distractor3 = body.distractor3

    distractors = []
    if (Array.isArray(distractor1)) {
        for (let i = 0; i < distractor1.length; i++) {
            let currentDistractors = []
            if (distractor1[i] != '') { currentDistractors.push(distractor1[i]) }
            if (distractor2[i] != '') { currentDistractors.push(distractor2[i]) }
            if (distractor3[i] != '') { currentDistractors.push(distractor3[i]) }
            distractors.push(currentDistractors)
        }
    } else {
        if (distractor1 != '') { distractors.push(distractor1) }
        if (distractor2 != '') { distractors.push(distractor2) }
        if (distractor3 != '') { distractors.push(distractor3) }
    }

    console.log("distractors: ", distractors)

    if (typeof(questions) == "string") {
        questions = [questions]
        answers = [answers]
        distractors = [distractors]
    }

    try {
        if (req.session.AuthCookie) {
            console.log({userId: req.session.AuthCookie.userId, title: title, description: description, questions: questions, answers: answers, distractors: distractors})
            quiz = await testData.addTestWithQuestions({userId: req.session.AuthCookie.userId, title: title, description: description, questions: questions, answers: answers, distractors: distractors})
        } else {
            console.log({title: title, description: description, questions: questions, answers: answers, distractors: distractors})
            quiz = await testData.addTestWithQuestions({title: title, description: description, questions: questions, answers: answers, distractors: distractors})
        }
       
    } catch (e) {
        if (req.session.AuthCookie) {
            res.render('error', { title: "Error", layout: "logged_in", error : e})
        } else {
            res.render('error', { title: "Error", error : e})
        }
        return;
    }
    titleStr = `Made Test: ${quiz.title}`
    if (req.session.AuthCookie) {
        res.render('test_made', { title: titleStr, layout: "logged_in", quiz: quiz })
    } else {
        res.render('test_made', { title: titleStr, quiz: quiz })
    }
})

// router.post('/make/new_test', async (req, res) => {
//     console.log(req.body)
//     let body = req.body;
//     let quiz = null;
//     let title = body.title
//     let description = body.description
//     let questions = body.question
//     let answers = body.correct_answer
//     let distractors = body.distractors

//     if (typeof(questions) == "string") {
//         questions = [questions]
//         answers = [answers]
//         distractors = [distractors]
//     }

//     try {
//         if (req.session.AuthCookie) {
//             console.log({userId: req.session.AuthCookie.userId, title: title, description: description, questions: questions, answers: answers, distractors: distractors})
//             quiz = await testData.addTestWithQuestions({userId: req.session.AuthCookie.userId, title: title, description: description, questions: questions, answers: answers, distractors: distractors})
//         } else {
//             console.log({title: title, description: description, questions: questions, answers: answers, distractors: distractors})
//             quiz = await testData.addTestWithQuestions({title: title, description: description, questions: questions, answers: answers, distractors: distractors})
//         }
       
//     } catch (e) {
//         if (req.session.AuthCookie) {
//             res.render('error', { title: "Error", layout: "logged_in", error : e})
//         } else {
//             res.render('error', { title: "Error", error : e})
//         }
//         return;
//     }
//     titleStr = `Made Test: ${quiz.title}`
//     if (req.session.AuthCookie) {
//         res.render('test_made', { title: titleStr, layout: "logged_in", quiz: quiz })
//     } else {
//         res.render('test_made', { title: titleStr, quiz: quiz })
//     }
// })

router.get('/take/:id', async (req, res) => {
    let test
    try {
        test = await testData.getTest(req.params.id)
    } catch (e) {
        if (req.session.AuthCookie) {
            res.render('error', { title: "Error", layout: "logged_in", error : e})
        } else {
            res.render('error', { title: "Error", error : e})
        }
        return;
    }
    if (req.session.AuthCookie) {
        res.render('take_test', { title: test.title, layout: "logged_in", test: test })
    } else {
        res.render('take_test', { title: test.title, test: test })
    }
})

router.post('/take/results/:id', async (req, res) => {
    console.log(req.params.id)
    let quiz = null;
    try {
        quiz = await testData.getTest(req.params.id)
    } catch (e) {
        if (req.session.AuthCookie) {
            res.render('error', { title: "Error", layout: "logged_in", error : e})
        } else {
            res.render('error', { title: "Error", error : e})
        }
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
    if (req.session.AuthCookie) {
        try {
            console.log("here")
            userData.setScore({userId: req.session.AuthCookie.userId, testId: quiz._id, score: score})
        } catch (e) {
            console.log(e)
        }
        res.render("test_results", { title: titleStr, layout: "logged_in", result: result, quiz: quiz})
    } else {
        res.render("test_results", { title: titleStr, result: result, quiz: quiz})
    }
})

router.get('/take/', async (req, res) => {
    let tid = req.query.tid
    console.log(tid)
    let test
    try {
        test = await testData.getTest(tid)
    } catch (e) {
        if (req.session.AuthCookie) {
            res.render('error', { title: "Error", layout: "logged_in", error : e})
        } else {
            res.render('error', { title: "Error", error : e})
        }
        return;
    }
    if (req.session.AuthCookie) {
        res.render('take_test', { title: test.title, layout: "logged_in", test: test })
    } else {
        res.render('take_test', { title: test.title, test: test })
    }
})

router.get('/', async (req, res) => {
    let allTests = null;
    try {
        allTests = await testData.getAllTestsToDisplay()
    } catch (e) {
        if (req.session.AuthCookie) {
            res.render('error', { title: "Error", layout: "logged_in", error : e})
        } else {
            res.render('error', { title: "Error", error : e})
        }
        return;
    }
    if (req.session.AuthCookie) {
        res.render('all_tests', { title: "All Tests", layout: "logged_in", tests: allTests })
    } else {
        res.render('all_tests', { title: "All Tests", tests: allTests })
    }
})

module.exports = router;