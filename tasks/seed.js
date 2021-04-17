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
    let jack = await userData.addUser("jack", "jack@hotmail.com", "nicepassword")
    let child = await userData.addUser("child", "child@mail.com", "1234pass")
    let bio = await testData.addTest(elijah._id, "bio", "this is a bio test")
    let math = await testData.addTest(elijah._id, "math", "this is a math test")
    let physics = await testData.addTest(elijah._id, "physics", "this is a physics test")
    // addQuestion(tid, question, correctAnswer, distractors)
    let bioQ1 = await testData.addQuestion(bio._id, "q1 - what is a snail?", "gastropod", ["mammal", "reptile"])
    let bioQ2 = await testData.addQuestion(bio._id, "q2 - what is a dog?", "mammal", ["gastropod", "reptile"])
    let bioQ3 = await testData.addQuestion(bio._id, "q3 - what is a human?", "mammal", ["gastropod", "reptile", "otherAnswer"])
    await db.serverConfig.close();
}

main()