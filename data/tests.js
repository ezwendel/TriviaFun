const { ObjectID } = require('bson');
ObjectIdMongo = require('mongodb').ObjectID;
const mongoCollections = require('../config/mongoCollections');
const tests = mongoCollections.tests;
const users = mongoCollections.users;
const usersJs = require('./users')

function hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
} // from https://stackoverflow.com/questions/7376598/in-javascript-how-do-i-check-if-an-array-has-duplicate-values

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
  
      // swap elements array[i] and array[j]
      // we use "destructuring assignment" syntax to achieve that
      // you'll find more details about that syntax in later chapters
      // same can be written as:
      // let t = array[i]; array[i] = array[j]; array[j] = t
      [array[i], array[j]] = [array[j], array[i]];
    }
  } // https://javascript.info/task/shuffle

async function addTest(body) { // addTest(uid, title, description)
    let uid = body.userId
    let title = body.title
    let description = body.description
    let creatorFlag = true

    if (!uid) {creatorFlag = false}
    if (!title) throw 'Error: test needs a title.'
    if (!description) { description = "" } // description not essential

    if (creatorFlag && typeof(uid) != 'string') throw 'Error: user id must be a string.'
    if (typeof(title) != 'string') throw 'Error: title must be a string.' 
    if (typeof(description) != 'string') throw 'Error: description must be a string.'

    if (title.trim().length == 0) throw 'Error: title is either an empty string or just white space.'
    if (description.trim().length == 0) { description = "" }
    
    let user = null
    let creatorName = null
    if (creatorFlag) {
        try {
            user =  await usersJs.getUser(uid)
        } catch {
            throw `Error: user with id ${uid} not found.`
        }
        creatorName = user.name
    }

    
    let newTest = {
        creator: uid,
        creatorName: creatorName,
        title: title.trim(),
        description: description.trim(),
        questions: []
    }

    const testCollection = await tests()

    const insertTestInfo = await testCollection.insertOne(newTest)
    if (insertTestInfo.insertedCount == 0) throw 'Error: could not add test.'
    const newTestId = insertTestInfo.insertedId

    if (creatorFlag)  {
        let newUser = await addTestToUser(uid, newTestId.toString())
    }

    const test = await getTest(newTestId.toString())
    return test
}

async function addTestWithQuestions(body) { // addTestWithQuestions(uid, title, description, questions, answers, distractors)
    let uid = body.userId
    let title = body.title
    let description = body.description
    let questions = body.questions
    let answers = body.answers
    let distractors = body.distractors

    test = null;
    try {
        test = await addTest({userId: uid, title: title, description: description}) // addTest(uid, title, description)
    } catch (e) {
        throw e
    }
    console.log(questions)
    console.log(questions.length)
    for (let i = 0; i < questions.length; i++) {
        try {
            // let distractorList = distractors[i].split(';')
            // let cleanedList = distractorList.filter(Boolean);
            // console.log(cleanedList)
            let question = await addQuestion(test._id, questions[i], answers[i], distractors[i])
        } catch (e) {
            console.log(e)
        }
    }
    let theTest = await getTest(test._id)
    if (theTest.questions.length == 0) {
        throw 'Error: no questions were able to be added to the test.'
    }
    return theTest
}

async function addTestToUser(uid, tid) {
    const test = await getTest(tid)
    if (test.creator !== uid) {
        throw 'Error: uid not creator of test'
    }

    let user = null
    try {
        user =  await usersJs.getUser(uid)
    } catch {
        throw `Error: user with id ${uid} not found.`
    }

    updatedUser = {
        name: user.name,
        email: user.email,
        password: user.password,
        friends: user.friends, // fix
        tests: user.tests,
        scores: user.scores
    }

    user.tests.push(tid)

    const userCollection = await users()
    // console.log("here")
    const updateId = ObjectIdMongo(user._id)
    // console.log("here")
    const updateUserInfo = await userCollection.updateOne({ _id: updateId }, { $set: updatedUser })
    if (updateUserInfo.modifiedCount == 0) throw 'Error: could not update user with test.'
    return await usersJs.getUser(uid)
}

async function getUserTests(uid) {
    if (!uid) throw 'Error: uid not given.'
    if (typeof(uid) != "string") throw 'Error: type of uid not string.'
    if (uid.trim().length == 0) throw 'Error: uid is either an empty string or just whitespace.'
    
    let user = null
    try { user
        user = await usersJs.getUser(uid)
    } catch {
        throw `Error: no users found with the uid ${uid}.`
    }
    
    const testArr = [] 

    for (test of user.tests) {
        testArr.push(test)
    }
   
    return testArr
}

async function getAllTests() {
    const testCollection = await tests()
    const testArr = await testCollection.find({}).toArray()
    console.log(testArr)
    return testArr
}

async function getTest(tid) {
    if (!tid) throw 'Error: tid not given.'
    if (typeof(tid) != "string") throw 'Error: type of tid not string.'
    if (tid.trim().length == 0) throw 'Error: tid is either an empty string or just whitespace.'
    
    const testCollection = await tests()
    const testArr = await testCollection.find({}).toArray()
    // console.log(testArr)

    for (i of testArr) {
        if (i._id.toString() == tid) {
            i._id = i._id.toString()
            return i
        }
    }
    throw `Error: no tests have the tid ${tid}.`
}

async function updateTest(tid, title, description) {
    if (!tid) throw 'Error: a user must be associated with creating the test.'
    if (!title) throw 'Error: test needs a title.'
    if (!description) { description = "" } // description not essential

    if (typeof(tid) != 'string') throw 'Error: user id must be a string.'
    if (typeof(title) != 'string') throw 'Error: title must be a string.' 
    if (typeof(description) != 'string') throw 'Error: description must be a string.'

    if (title.trim().length == 0) throw 'Error: title is either an empty string or just white space.'
    if (description.trim().length == 0) { description = "" }
    
    let test = null
    try {
        test = getTest(tid)
    } catch {
        throw `Error: test with id ${tid} not found.`
    }

    updatedTest = {
        creator: test.creator,
        title: title.trim(),
        description: description.trim(),
        questions: test.questions
    }

    const testCollection = await tests()

    const updateId = ObjectIdMongo(tid)

    const updateTestInfo = await testCollection.updateOne({ _id: updateId }, { $set: updatedTest })
    if (updateTestInfo.modifiedCount == 0) throw 'Error: could not update test.'

    const newTest = await getTest(tid)
    return newTest
}

async function deleteTest(tid) {
    if (!tid) throw 'Error: Must provide an id to use for removal.'
    if (typeof(tid) != 'string') throw 'Error: id must be a string.'
    if (tid.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
    id = ObjectID(tid)

    const testCollection = await users()

    const test = await testCollection.findOne({ _id: id })
    if (test == null) throw `Error: No test found with id ${id}`
    
    const deleteInfo = await testCollection.deleteOne({ _id: id })
    if (deleteInfo.deletedCount == 0) throw `Error: Couldn't delete test with tid ${id}`

    return {"tid": id.toString(), "deleted": true}
}

async function addQuestion(tid, question, correctAnswer, distractors) {
    if (!tid) throw 'Error: the question must be added to a test.'
    if (!question) throw 'Error: question must ask something.'
    if (!correctAnswer) throw 'Error: question must have a correct answer.'
    if (!distractors) throw 'Error: question must have distractors.'

    if (typeof(tid) != 'string') throw 'Error: test id must be a string.'
    if (typeof(question) != 'string') throw 'Error: question must be a string.'
    if (typeof(correctAnswer) != 'string') throw 'Error: correctAnswer must be a string.'
    if (!Array.isArray(distractors)) throw 'Error: distractor answers must be an array.'

    if (question.trim().length == 0) throw 'Error: question is either an empty string or just whitespace.'
    if (correctAnswer.trim().length == 0) throw 'Error: correctAnswer is either an empty string or just whitespace.'

    let test = null
    try {
        test = await getTest(tid)
    } catch {
        throw `Error: test with id ${tid} not found.`
    }

    if (hasDuplicates(distractors)) { distractors = [... new Set(distractors)] } // remove duplicates
    let i = 0
    newDistractors = []
    // console.log(distractors)
    for (i = 0; i < distractors.length; i++) { 
        // console.log(typeof(distractors[i]) != 'string')
        console.log(distractors[i])
        if (typeof(distractors[i]) != 'string') throw 'Error: all values in distractors must be strings.'
        if (distractors[i].trim().length >= 1) { newDistractors.push(i) }
        distractors[i] = distractors[i].trim()
    }
    if (newDistractors.length == 0) throw 'Error: no distractors.'

    answers = []
    for (i of distractors) {
        answers.push(i)
    }
    answers.push(correctAnswer)

    shuffle(answers) // rework

    newQuestion = {
        _id: ObjectID(),
        question: question.trim(),
        correctAnswer: correctAnswer.trim(),
        distractors: distractors,
        answers: answers
    }

    updatedTest = {
        creator: test.creator,
        title: test.title,
        description: test.description,
        questions: test.questions
    }

    updatedTest.questions.push(newQuestion)

    const testCollection = await tests()
    const updateId = ObjectIdMongo(tid)
    // console.log(updateId)
    const updateTestInfo = await testCollection.updateOne({ _id: updateId }, { $set: updatedTest })
    if (updateTestInfo.modifiedCount == 0) throw 'Error: could not update test with question.'

    newQuestion._id = newQuestion._id.toString()
    return newQuestion
}

async function getAllTestQuestions(tid) {
    if (!tid) throw 'Error: tid not given.'
    if (typeof(tid) != "string") throw 'Error: type of tid not string.'
    if (tid.trim().length == 0) throw 'Error: tid is either an empty string or just whitespace.'
    let test = null
    try {
        test = await getTest(tid)
    } catch (e) {
        throw e
    }
    return test.questions
}

async function getQuestion(tid, qid) {
    if (!tid) throw 'Error: tid not given.'
    if (!qid) throw 'Error: qid not given.'
    if (typeof(tid) != "string") throw 'Error: type of tid not string.'
    if (typeof(qid) != "string") throw 'Error: type of qid not string.'
    if (tid.trim().length == 0) throw 'Error: tid is either an empty string or just whitespace.' 
    if (qid.trim().length == 0) throw 'Error: qid is either an empty string or just whitespace.'
    let test = null
    try {
        test = await getTest(tid)
    } catch (e) {
        throw e
    }
    for (q of test.questions) {
        if (q._id.toString() == qid) {
            q._id = q._id.toString()
            return q
        }
    }
    throw `Error: question with qid ${qid} not found.`
}

async function deleteQuestion(tid, qid) {
    if (!tid) throw 'Error: tid not given.'
    if (!qid) throw 'Error: qid not given.'
    if (typeof(tid) != "string") throw 'Error: type of tid not string.'
    if (typeof(qid) != "string") throw 'Error: type of qid not string.'
    if (tid.trim().length == 0) throw 'Error: tid is either an empty string or just whitespace.' 
    if (qid.trim().length == 0) throw 'Error: qid is either an empty string or just whitespace.'
    let test = null
    try {
        test = await getTest(tid)
    } catch (e) {
        throw e
    }
    newQuestions = []
    qflag = false;
    for (q of test.questions) {
        if (q._id.toString() != qid) {
            newQuestions.push(q)
            return q
        } else {
            qflag = true;
        }
    }
    if (!qflag) throw `Error: question with qid ${qid} not found.`

    updatedTest = {
        creator: test.creator,
        title: test.title,
        description: test.description,
        questions: newQuestions
    }

    let updateId = ObjectIdMongo(tid)

    let testCollection = await tests()
    const updateInfo = await testCollection.updateOne({ _id: updateId }, { $set: updatedTest })
    if (updateInfo.modifiedCount == 0) throw 'Error: could not delete question from test.'
    
    return { "qid":qid, "deleted":true }
}

module.exports = {
    addTest,
    addQuestion,
    getTest,
    addTestWithQuestions,
    updateTest,
    deleteTest,
    getUserTests,
    getAllTestQuestions,
    getQuestion,
    deleteQuestion,
    getAllTests
}
