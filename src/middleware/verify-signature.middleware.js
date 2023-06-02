import jwt from "jsonwebtoken";
import Address from "../models/address.model.js";
import User from "../models/user.model.js";

async function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token)
    return res.status(401).send({ auth: false, message: "No token provided." });

  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .send({ auth: false, message: "Token has expired." });
      } else {
        return res
          .status(500)
          .send({ auth: false, message: "Failed to authenticate token." });
      }
    }

    req.address = decoded.address;
    // Lookup user based on the address
    Address.findOne({ address: req.address })
      .then(async (address) => {
        if (!address) {
          return res
            .status(404)
            .send({ auth: false, message: "Address not found." });
        }
        // Set the req.userId property
        req.userId = address.user;
        next();
      })
      .catch((error) => {
        console.error(error);
        res
          .status(500)
          .send({ auth: false, message: "Failed to find address." });
      });
  });
}

export { verifyToken };
