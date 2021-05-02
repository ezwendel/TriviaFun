const express = require('express');
const router = express.Router();
const data = require('../data/');
const userData = data.users
const bcrypt = require('bcryptjs')

router.get('/', async (req, res) => {
    res.render('login', { title: "Log In"})
})

router.post('/login/', async (req, res) => {
    if (!req.body.username) {
        res.status(400).render('error', {title: "Error", error: "Must give a username."})
        return;
    }
    if (!req.body.password) {
        res.status(400).render('error', {title: "Error", error: "Error: Must give a password."})
        return;
    }
    let user = null
    let userArr = await userData.getAllUsers()
    for (i of userArr) {
        if (req.body.username == i.name) {
            let validMatch = null
            try {
                validMatch = await bcrypt.compare(req.body.password, i.password)
            } catch (e) {
                res.status(500).render('error', {title: "Error", error: "Error: Error with server. Please try again."})
                return;
            }

            if (!validMatch) {
                res.status(400).render('error', {title: "Error", error: "Error: Username and password do not match."})
                return;
            } else {
                user = i
            }
        }
    }
    if (user == null) {
        res.status(400).render('error', {title: "Error", error: "Error: Username not found."})
        return;
    }
    let authCookieUser = {
        userId: user._id,
        username: user.name
    } 
    req.session.AuthCookie = authCookieUser
    res.render('home', {title: "StudyBuddy", layout: "logged_in"})
})

router.post('/register/', async (req, res) => {
    let username = req.body.username
    let email = req.body.email
    let password = req.body.password
    console.log(req.body)
    if (!username) {
        res.status(400).render('error', {title: "Registration Error", error: "Error: Must give a username."})
        return;
    }
    if (!email) {
        res.status(400).render('error', {title: "Registration Error", error: "Error: Must give an email."})
        return;
    }
    if (!password) {
        res.status(400).render('error', {title: "Registration Error", error: "Error: Must give a password."})
        return;
    }
    let newUser = null
    try {
        newUser = await userData.addUser(username, email, password)
    } catch (e) {
        res.status(400).render('error', {title: "Registration Error", error: e})
    }
    let authCookieUser = {
        userId: newUser._id,
        username: newUser.name
    }
    req.session.AuthCookie = authCookieUser
    res.render('home', { title: "StudyBuddy", layout: "logged_in" })
})

module.exports = router;