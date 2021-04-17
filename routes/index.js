
const testRoutes = require('./books')
const userRoutes = require('./reviews')

const constructorMethod = (app) => {
    app.use('/tests', testRoutes)
    app.use('/users', userRoutes)

    app.use('*', (req, res) => {
        res.status(404).json({ error: 'Route not found' })
    })
}

module.exports = constructorMethod;