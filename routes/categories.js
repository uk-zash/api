const { Category } = require('../models/category')
const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
    const categoryList = await Category.find()

    if (!categoryList) {
        res.status(500).json({ success: false })
    }

    res.send(categoryList)
})

router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id)

    if (!category) {
        res.status(500).json({
            message: 'Category with given id was not found',
        })
    } else {
        res.status(200).send(category)
    }
})

router.post('/', async (req, res) => {
    const category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    })

    category = await category.save()

    if (!category) {
        return res.status(404).send('Category cannot be created')
    }

    res.send(category)
})



router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id)

        if (category) {
            return res
                .status(200)
                .json({ success: true, message: 'Category is deleted' })
        } else {
            return res
                .status(404)
                .json({ success: false, message: 'Category not found' })
        }
    } catch (err) {
        console.error(err) // Log the error for better debugging
        return res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: err.message,
        })
    }
})

router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        },
        { new: true }
    )

    if (!category) {
        return res.status(400).send("the category didn't found")
    }

    res.send(category)
})

module.exports = router
