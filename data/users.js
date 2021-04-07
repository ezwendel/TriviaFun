const { ObjectID } = require('bson');
ObjectIdMongo = require('mongodb').ObjectID;
const mongoCollections = require('../config/mongoCollections');
const { tests } = require('../settings/mongoCollections');
const users = mongoCollections.users;

function dateToMMDDYYYY(date){
    date = new Date(date);
    retStr = ""
    // if ((date.getMonth() + 1) <= 9) { retStr += "0" } throught i needed this, probably don't
    retStr += (date.getMonth() + 1).toString() + "/"
    // if ((date.getDate()) <= 9) { retStr += "0" }
    retStr += (date.getDate()).toString() + "/"
    retStr += date.getFullYear();
    return retStr
} // similar to https://stackoverflow.com/questions/2035699/how-to-convert-a-full-date-to-a-short-date-in-javascript

function hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
} // from https://stackoverflow.com/questions/7376598/in-javascript-how-do-i-check-if-an-array-has-duplicate-values

function validEmail (emailStr) {
    var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (emailStr.match(mailformat)) { return true }
    return false;
} // email regex from https://www.w3resource.com/javascript/form/email-validation.php

function validPassword (pwdStr) {
    var pwdFormat = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$";
    if (pwdStr.match(pwdFormat)) { return true }
    return false
} // https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a

async function addUser(name, email, password) {
    if (!name) throw 'Error: must provide the name of the user.'
    if (!email) throw 'Error: must provide the email of the user.'
    if (!password) throw 'Error: must provide a password for the user.'
    
    if (typeof(name) != 'string') throw 'Error: name must be a string.'
    if (typeof(email) != 'string') throw 'Error: email must be a string.'
    if (typeof(password) != 'string') throw 'Error: password must be a string.'

    if (!validEmail(email)) throw 'Error: email not in proper email format.'
    if (!validPassword(password)) throw 'Error: password not in proper format.'
    if (name.trim().length == 0) throw 'Error: name is either an empty string or just whitespace.'

    let userCollection = await users()

    newUser = {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        friends: [],
        tests: [],
        scores: []
    }

    let insertInfo = await userCollection.insertOne(newUser)
    if (insertInfo.insertedCount == 0) throw 'Error: could not add user.'
    const newId = insertInfo.insertedId
    const user = await getUser(newId.toString())
    return user
}

async function updateUser(uid, name, email, password) {
    if (!uid) throw 'Error: must provide a uid to update.'
    if (!name) throw 'Error: must provide the name of the user.'
    if (!email) throw 'Error: must provide the email of the user.'
    if (!password) throw 'Error: must provide a password for the user.'
    
    if (typeof(uid) != 'string') throw 'Error: must provide a uid to update.'
    if (typeof(name) != 'string') throw 'Error: name must be a string.'
    if (typeof(email) != 'string') throw 'Error: email must be a string.'
    if (typeof(password) != 'string') throw 'Error: password must be a string.'

    if (!validEmail(email)) throw 'Error: email not in proper email format.'
    if (!validPassword(password)) throw 'Error: password not in proper format.'
    if (name.trim().length == 0) throw 'Error: name is either an empty string or just whitespace.'

    let userCollection = await users()

    newUser = {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        friends: [], // fix
        tests: [],
        scores: []
    }

    let user
    try {
        user = await getUser(uid.toString())
    } catch (e) {
        throw `Error: no user found with id ${uid}.`
    }

    let updateId = ObjectIdMongo(uid)

    const updateInfo = await userCollection.updateOne({ _id: updateId }, { $set: newUser })
    if (updateInfo.modifiedCount == 0) throw 'Error: could not update user.'
    let changedUser = await getUser(uid.toString())
    return changedUser
}

async function getAllUsers() {
    const userCollection = await users()
    const userArr = await userCollection.find({}).toArray()
    return userArr
}

async function getUser(uid) {
    if (!uid) throw 'Error: uid not given.'
    if (typeof(uid) != "string") throw 'Error: type of uid not string.'
    if (uid.trim().length == 0) throw 'Error: uid is either an empty string or just whitespace.'
    
    const userCollection = await users()
    const userArr = await userCollection.find({}).toArray()

    for (i of userArr) {
        if (i._id.toString() == uid) {
            i._id = i._id.toString()
            return i
        }
    }
    throw `Error: no users have the uid ${uid}.`
}

async function deleteUser(uid) {
    if (!uid) throw 'Error: Must provide an id to use for removal.'
    if (typeof(uid) != 'string') throw 'Error: id must be a string.'
    if (uid.trim().length == 0) throw 'Error: id is either an empty string or just whitespace.'
    id = ObjectID(uid)

    const userCollection = await users()

    const user = await userCollection.findOne({ _id: id })
    if (book == null) throw `Error: No user found with id ${id}`
    
    const deleteInfo = await userCollection.deleteOne({ _id: id })
    if (deleteInfo.deletedCount == 0) throw `Error: Couldn't delete user with uid ${id}`

    return {"uid": id.toString(), "deleted": true}
}

async function makeFollower(uid1, uid2) { // have user1 follow user2
    if (!uid1) throw 'Error: uid1 needed to add as follower.'
    if (!uid2) throw 'Error: uid2 needed to add as follower.'

    if (typeof(uid1) != "string") throw 'Error: type of uid1 not string.'
    if (typeof(uid2) != "string") throw 'Error: type of uid2 not string.'

    let user1
    try {
        user1 = await getUser(uid1.toString())
    } catch (e) {
        throw `Error: no user found with id ${uid1}.`
    }

    let user2
    try {
        user2 = await getUser(uid2.toString())
    } catch (e) {
        throw `Error: no user found with id ${uid2}.`
    }

    if (user1.friends.includes(uid2)) throw 'Error: user1 already follows user2.'
    user1.friends.append(user2)

    newUser1 = {
        name: user1.name,
        email: user1.email,
        password: user1.password,
        friends: user1.friends(),
        tests: user1.tests,
        scores: user1.scores
    }

    let updateId1 = ObjectIdMongo(uid1)

    let userCollection = await users()
    const updateInfo = await userCollection.updateOne({ _id: updateId1 }, { $set: newUser1 })
    if (updateInfo.modifiedCount == 0) throw 'Error: could not follow user2.'
    let changedUser1 = await getUser(userId.toString())
    return changedUser1
}

async function deleteFollower(uid1, uid2) { // have user1 unfollow user2
    if (!uid1) throw 'Error: uid1 needed to add as follower.'
    if (!uid2) throw 'Error: uid2 needed to add as follower.'

    if (typeof(uid1) != "string") throw 'Error: type of uid1 not string.'
    if (typeof(uid2) != "string") throw 'Error: type of uid2 not string.'

    let user1
    try {
        user1 = await getUser(uid1.toString())
    } catch (e) {
        throw `Error: no user found with id ${uid1}.`
    }

    if (!user1.friends.includes(uid2)) throw 'Error: user1 is not following user2.'
    
    user1.friends.splice(user1.friends.indexOf(uid2), 1)

    newUser1 = {
        name: user1.name,
        email: user1.email,
        password: user1.password,
        friends: user1.friends(),
        tests: user1.tests,
        scores: user1.scores
    }

    let updateId1 = ObjectIdMongo(uid1)

    let userCollection = await users()
    const updateInfo = await userCollection.updateOne({ _id: updateId1 }, { $set: newUser1 })
    if (updateInfo.modifiedCount == 0) throw 'Error: could not update unfollower user2.'
    let changedUser1 = await getUser(userId.toString())
    return changedUser1
}

// getFollowers

module.exports = {
    addUser,
    updateUser,
    getAllUsers,
    getUser,
    makeFollower,
    deleteFollower
}
