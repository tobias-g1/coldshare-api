
async function requireToken(req, res, next) {
  const token = req.headers.authorization;
    if (!token) {
        res.sendStatus(401)
    } else {
        next();
    }
}

export { requireToken };
