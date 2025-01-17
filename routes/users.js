const { User } = require('../models/user')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.get('/', async (req, res) => {
    const userList = await User.find().select('-passwordbcrypt')

    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send(userList)
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordbcrypt')
    if (!user) {
        res.status(404).json({ success: false })
    }
    res.send(user)
})

router.post('/', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.passwordHash, salt)
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            passwordHash: hashedPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        })

        const savedUser = await user.save()

        if (!savedUser) {
            return res.status(500).send('Cannot create user')
        }

        res.status(201).send(savedUser)
    } catch (error) {
        console.error(error)
        res.status(500).send('Error creating user')
    }
})

router.put('/:id', async (req, res) => {
    const updatedData = req.body

    let user = await User.findByIdAndUpdate(req.params.id, updatedData, {
        new: true,
    })

    if (!user) {
        res.status(500).send('Cannot update User')
    }

    res.send(user)
})

router.delete('/:id', async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id)
    console.log(user)

    if (!user) {
        res.status(500).send({ success: false })
    } else {
        res.status(200).send({ success: true })
    }
})

//Login

router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    const secret = process.env.secret
    if (!user) {
        return res.status(400).send('The user is not Found')
    }

    console.log('Entered password:', req.body.password)
    console.log('Stored hashed password:', user.passwordHash)

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
            },
            secret,
            {
                expiresIn: '1d',
            }
        )

        res.status(200).send({user:user.email , token:token})
    } else {
        res.status(400).send('Invalid password')
    }
})

module.exports = router
