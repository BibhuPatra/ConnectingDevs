const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs/dist/bcrypt');

// @route GET api/auth
//@desc     Test Route
//@access   Public 
router.get('/', auth, async (req, res) => {
   try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
   } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
   }
});

// @route POST api/auth
//@desc     Authenticate User and get the token
//@access   Public 

router.post('/', [
   check('email', 'Please add a valid email').isEmail(),
   check('password', 'Password is required').exists()
], async (req, res) => {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
   }

   const { email, password } = req.body;
   try {

      //if the user exists
      let user = await User.findOne({ email });
      if (!user) {
         return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      //validating user fron database
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
         return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      //Return JSONwebtoken
      const payload = {
         user: {
            id: user.id
         }
      }

      jwt.sign(payload, config.get('jwtSecret'),
         { expiresIn: 360000 },
         (err, token) => {
            if (err) throw err;
            res.json({ token });
            console.log(token);
         });
      // res.send('User Resgisted Sucessfully');
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

module.exports = router;