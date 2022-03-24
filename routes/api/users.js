const bcrypt = require('bcryptjs/dist/bcrypt');
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const User = require('../../models/User');

// @route POST api/user
//@desc     Register User
//@access   Public 
router.post('/', [
   check('name', 'Name is required').not().isEmpty(),
   check('email', 'Please add a valid email').isEmail(),
   check('password', 'please enter a passwrd with 6 or more charcacter').isLength({ min: 6 })
], async (req, res) => {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
   }

   const { name, email, password } = req.body;
   try {

      //if the user exists
      let user = await User.findOne({ email });
      if (user) {
         return res.status(400).json({ errors: [{ msg: 'User Already exits' }] });
      }

      //get user gravatar
      const avatar = gravatar.url(email, {
         s: '200',
         r: 'pg',
         d: 'mm'
      })

      user = new User({
         name,
         email,
         avatar,
         password
      })
      //emcryot password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      //Return JSONwebtoken
      res.send('User Resgisted Sucessfully')
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

module.exports = router;