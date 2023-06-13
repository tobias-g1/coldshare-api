import { config } from "dotenv";
import jwt from "jsonwebtoken";
import Address from "../models/address.model.js";
import User from "../models/user.model.js";

config();

async function verifyToken(req, res, next) {
  const authorizationHeader = req.headers.authorization;
  if (authorizationHeader) {
    try {
      const token = authorizationHeader.replace("Bearer ", "");
      console.log(token);
      console.log(process.env.JWT_SECRET);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);

      const address = await Address.findOne({
        address: decoded.address,
      }).exec();
      
      if (!address) {
        return res
          .status(401)
          .send({ auth: false, message: "Address not found." });
      }

      const user = await User.findById(address.user).exec();
      if (!user) {
        return res
          .status(401)
          .send({ auth: false, message: "User not found." });
      }

      res.locals.address = address;
      res.locals.user = user;

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .send({ auth: false, message: "Token has expired." });
      } else {
        console.error(err);
        return res
          .status(500)
          .send({ auth: false, message: "Failed to authenticate token." });
      }
    }
  } else {
    next();
  }
}

export { verifyToken };
