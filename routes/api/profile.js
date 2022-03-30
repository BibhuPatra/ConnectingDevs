const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

// @route GET api/profile/me
//@desc     get current profile
//@access   Private 

router.post('/', [auth, [
   check('status', 'Status is required').not().isEmpty(),
   check('skills', 'skills is required').not().isEmpty()
]], async (req, res) => {
   const error = validationResult(req);
   if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() })
   }

   const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
   } = req.body;

   //build profile object
   const profileFields = {}
   profileFields.user = req.user.id;
   if (company) profileFields.company = company;
   if (website) profileFields.website = website;
   if (location) profileFields.location = location;
   if (bio) profileFields.bio = bio;
   if (status) profileFields.status = status;
   if (githubusername) profileFields.githubusername = githubusername;
   if (skills) {
      profileFields.skills = skills.split(',').map((element) => element.trim());
   }
   //social object bulding
   profileFields.social = {}
   if (youtube) profileFields.social.youtube = youtube
   if (facebook) profileFields.social.facebook = facebook
   if (instagram) profileFields.social.instagram = instagram
   if (linkedin) profileFields.social.linkedin = linkedin
   if (twitter) profileFields.social.twitter = twitter

   try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
         //update profile
         profile = await Profile.findOneAndUpdate({
            user: req.user.id
         }, { $set: profileFields }, { new: true })
         return res.json(profile);
      }

      //create a profile
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
   } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
   }
})

//@route    GET api/profile
//@desc     get all profile 
//@access   Public

router.get('/', async (req, res) => {
   try {
      const profiles = await Profile.find().populate('user', ['name', 'avatar']);
      res.json(profiles);
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error")
   }
})

//@route    GET api/profile/user/:user_id
//@desc     get profile by user Id 
//@access   Public

router.get('/user/:user_id', async (req, res) => {
   try {
      const profile = await Profile.findOne({
      }).populate('user', ['name', 'avatar']);
      if (!profile)
         return res.status(400).json({ msg: 'Profile not found!' });
      res.json(profile);
   } catch (err) {
      console.error(err.message);
      if (err.kind == 'ObjectId') {
         return res.status(400).json({ msg: 'Profile not found!' });
      }
      res.status(500).send("Server Error")
   }
})


//@route    DELETE api/profile
//@desc     Delete profile and posts 
//@access   Private

router.delete('/', auth, async (req, res) => {
   try {
      //remove profile
      await Profile.findOneAndRemove({ user: req.user.id });
      await Profile.findOneAndRemove({ _id: req.user.id });
      res.json({ msg: 'user removed' });
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error")
   }
})


//@route    PUT api/profile/experience
//@desc     Put experience to profile
//@access   Private

router.put('/experience', [auth, [
   check('title', 'title is required').not().notEmpty(),
   check('company', 'company is required').not().notEmpty(),
   check('from', 'From is required').not().notEmpty(),
]
], async (req, res) => {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
   }

   const {
      title, company, description, location, from, to, current
   } = req.body;

   const newExp = {
      title, company, description, location, from, to, current
   };
   try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
})

//@route    DELETE api/profile/experience
//@desc     Delete experience to profile
//@access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
   try {
      const profile = await Profile.findOne({ user: req.user.id });
      //Get remove index
      const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
      profile.experience.splice(removeIndex, 1);
      await profile.save();
      // res.json({ msg: 'experience removed' });
      return res.json(profile);
   } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
   }
})

module.exports = router;