// middleware/isAdmin.js
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  } else {
    return res.status(403).json({ message: "Access denied: Admins only." });
  }
};

export default isAdmin;
