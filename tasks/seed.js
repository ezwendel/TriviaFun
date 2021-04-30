const express = require('express')
const router = express.Router()
const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const testData = data.tests
const userData = data.users


async function main() {
    const db = await dbConnection();
    await db.dropDatabase();
    let elijah = await userData.addUser("elijah", "ezwendel@gmail.com", "fun9password")
    let testingQuiz = await testData.addTest({title: "Testing Quiz", description: "This is for user testing"})
    let testQuestion1 = await testData.addQuestion(testingQuiz._id, "What color is the sky in the daytime?", "Blue", ["Green", "Red", "Brown"])
    let testQuestion2 = await testData.addQuestion(testingQuiz._id, "Does Hoboken overlook NYC?", "True", ["False"])
    // elijah = await userData.setScore({userId: elijah._id, testId: bio._id, score: 3})
    await db.serverConfig.close();
}

main()