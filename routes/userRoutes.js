const router = require("express").Router();
const userCtrl = require("../controllers/userCtrl");
const auth = require("../middleware/auth");

router.post("/signup", userCtrl.signUp);
router.post("/signin", userCtrl.login);

router.get("/logout", userCtrl.logout);
router.get("/userInfo", auth, userCtrl.getUser);

router.get("/refresh_token", userCtrl.refreshToken);

module.exports = router;
