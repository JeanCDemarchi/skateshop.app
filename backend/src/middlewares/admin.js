// Middleware de autorização: permite apenas usuários com role "admin".
// IMPORTANTE: deve ser usado SEMPRE depois do middleware `auth`
// (primeiro autentica, depois autoriza). Ex.:
//   router.post("/", auth, admin, controller);
function admin(req, res, next) {
  if (!req.usuario || req.usuario.role !== "admin") {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }
  return next();
}

module.exports = admin;
