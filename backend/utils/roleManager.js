// Helper functions for role management

const VALID_ROLES = ["pet-owner", "vet"]

const isValidRole = (role) => {
  return VALID_ROLES.includes(role)
}

const getDefaultRole = () => {
  return "pet-owner"
}

const canChangeRole = (currentRole, newRole) => {
  // Define role change rules
  if (!isValidRole(currentRole) || !isValidRole(newRole)) {
    return false
  }

  // Allow pet-owners to become vets, but not the other way around
  if (currentRole === "pet-owner" && newRole === "vet") {
    return true
  }

  return false
}

const getRolePermissions = (role) => {
  const permissions = {
    "pet-owner": [
      "create_adoption_post",
      "show_interest_in_adoption",
      "create_forum_post",
      "reply_to_forum",
      "update_own_profile",
      "find_nearby_vets",
      "view_vet_profiles",
      "view_adoption_posts",
      "update_location",
      "view_own_profile",
      "update_own_adoption_posts",
    ],
    vet: [
      "create_vet_profile",
      "update_vet_profile",
      "respond_to_adoption_interest",
      "create_forum_post",
      "reply_to_forum",
      "update_own_profile",
      "update_location",
    ],
  }

  return permissions[role] || []
}

const hasPermission = (userRole, permission) => {
  const permissions = getRolePermissions(userRole)
  return permissions.includes(permission)
}

module.exports = {
  VALID_ROLES,
  isValidRole,
  getDefaultRole,
  canChangeRole,
  getRolePermissions,
  hasPermission,
}
