const express = require("express")
const q2m = require("query-to-mongo")

const UserSchema = require("./schema")

const usersRouter = express.Router()

usersRouter.get("/", async (req, res, next) => {
  try {
    const query = q2m(req.query)
    const users = await UserSchema.find(query.criteria, query.options.fields)
      .skip(query.options.skip) // Skippa i primi x risultati
      .limit(query.options.limit) // Limita a x il numero di risultato
      .sort(query.options.sort) // Decide l'ordine dei risultati

    res.send({
      data: users,
      total: users.length,
    })
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    const user = await UserSchema.findById(id)
    res.send(user)
  } catch (error) {
    console.log(error)
    next("While reading users list a problem occurred!")
  }
})

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UserSchema(req.body)
    const { _id } = await newUser.save()

    res.status(201).send(_id)
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/:id", async (req, res, next) => {
  try {
    const user = await UserSchema.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
      },
      { runValidators: true }
    )
    if (user) {
      res.send("Ok")
    } else {
      const error = new Error(`User with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:id", async (req, res, next) => {
  try {
    await UserSchema.findByIdAndDelete(req.params.id)

    res.send("Deleted")
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter
