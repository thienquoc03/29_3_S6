var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator'); // Import express-validator
let userController = require('../controllers/users');
let { CreateSuccessResponse, CreateErrorResponse } = require('../utils/responseHandler');
let { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');

/* GET users listing. */

router.get('/', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
  console.log(req.headers.authorization);
  let users = await userController.GetAllUser();
  CreateSuccessResponse(res, 200, users);
});

// POST route with validation
router.post(
  '/',
  [
    body('username').isString().notEmpty().withMessage('Username is required and must be a string'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('role').isString().notEmpty().withMessage('Role is required and must be a string'),
  ],
  async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return CreateErrorResponse(res, 400, errors.array());
    }
    try {
      let body = req.body;
      let newUser = await userController.CreateAnUser(body.username, body.password, body.email, body.role);
      CreateSuccessResponse(res, 200, newUser)
    } catch (rror) {
      CreateErrorResponse(res, 404, error.message)
    }
  }
);

// PUT route with validation
router.put(
  '/:id',
  [
    body('username').optional().isString().withMessage('Username must be a string'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('role').optional().isString().withMessage('Role must be a string'),
  ],
  async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return CreateErrorResponse(res, 400, errors.array());
    }
    try {
      let body = req.body;
      let updatedResult = await userController.UpdateAnUser(req.params.id, body);
      CreateSuccessResponse(res, 200, updatedResult)
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
