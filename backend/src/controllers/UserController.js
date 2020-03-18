const { User } = require('../models')
const { Log } = require('../models')
const { schemaValidation, schemaValidationForCheckPassword, generateHashedPassword, compareHash } = require('../utils/helpers')
const { decodeToken } = require('../services/auth');
module.exports = {

  getAllLogsFromUser: async (req, res, next) => {
    try {
      const { authorization } = req.headers;
      const { userId: { id } } = decodeToken(authorization)
      
      const { dataValues: { Logs } } = await User.findOne(
        {
          where: { id },
          include: Log
        })
        
      if(Logs.length === 0) {
        res.status(406).json({ message: 'There is no logs recorded' })
      } else {
        res.status(200).json({ Logs })
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal Server Error' } )
    }
  },

  create: async (req, res, next) => {
    try {
    const { body: { name, email, password } } = req

    const validation = (await schemaValidation().isValid({
      name,
      email,
      password
    }))
    
    if (!validation) {
      return res.status(406).json({ error: 'Data values are not valid' });
    }

    const existsEmail = await User.findOne({
      where:
      {
        email
      }
    });

    if (existsEmail) {
      return res.status(406).json({ message: 'User email already existis.' });
    }
    
      const { dataValues: { name: user_name, email: user_email, createdAt } } = await User.create({
        name,
        email,
        password: await generateHashedPassword(password)
      })
      
      res.status(200).json({ message: 'User created successfully!', data: { user_name, user_email, createdAt } })

    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal Server Error' } )
    }
  },

  update: async (req, res, next) => {
    try {
      const { body: { name, email, oldPassword, newPassword, confirmPassword } } = req

      const { authorization } = req.headers;
      const { userId: { id } } = decodeToken(authorization)

  
      if (!(await schemaValidationForCheckPassword().isValid({
        name,
        email,
        oldPassword,
        newPassword,
        confirmPassword
      }))) {
        return res.status(406).json({ error: 'Data values are not valid' });
      }

      const user = await User.findOne({
        where: {
          id
        }
      });
      console.log(user)
      if (email !== undefined && email !== null) {
        if (email !== user.email) {
          const existsEmail = await User.findOne({
            where:
            {
              email
            }
          });
          if (existsEmail) {
            return res.status(406).json({ message: 'User email already exists.' });
          }
        }
      }

      if (oldPassword && !(await compareHash(oldPassword, user.password))) {
        return res.status(401).json({ error: 'Password does not match' });
      }

      if (newPassword !== undefined) {
        const userUpdated = await User.update({
          name,
          email,
          password: await generateHashedPassword(newPassword)
        }, {
          where: {
            id
          }
        })
        res.status(200).json({ data: userUpdated, message: 'Password updated sucessfully!' })
      } else {
        const userUpdated = await User.update({
            name,
            email
          }, {
            where: {
              id
            }
          })
        
        console.log(userUpdated)
        res.status(200).json({ data: userUpdated, message: 'user updated! somente email e name' })
      }

      
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal Server Error' } )
    }
  },

  deleteById: async (req, res, next) => {
    try {
      const { authorization } = req.headers;
      const { userId: { id } } = decodeToken(authorization)

      await Log.destroy({
        where: { UserId: id },
      })

      await User.destroy({
        where: { id }
      })
      res.status(200).json({ message: 'user deleted succesfully' })

    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal Server Error' } )
    }
  }
}