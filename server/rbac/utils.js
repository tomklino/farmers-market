function getRole(session) {
  if(!session || !session.role) {
    return "user"
  }

  return session.role
}

module.exports = { getRole }
