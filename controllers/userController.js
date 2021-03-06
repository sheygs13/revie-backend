const bcrypt = require('bcrypt');
const User = require('../models/user');

const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ status: 'error', error: 'All fields are required' });
  }
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ status: 'error', error: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    user = new User({
      name,
      email,
      password: hashed,
    });
    await user.save();
    const token = user.generateAuthToken();
    res.status(201).json({ status: 'success', token });
  } catch ({ message }) {
    next(message);
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ status: 'error', error: 'All fields are required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: 'error', error: 'Invalid Email' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res
        .status(400)
        .json({ status: 'error', error: 'Invalid Password' });
    const token = user.generateAuthToken();
    res.status(200).json({ status: 'success', token });
  } catch ({ message }) {
    next(message);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
