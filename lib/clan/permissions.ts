import { ClanRole } from "./models";

export type ClanPermissionAction =
  | 'process_requests'       // Aceptar y rechazar solicitudes
  | 'kick_members'           // Expulsar miembros normales
  | 'mute_members'           // Silenciar miembros
  | 'delete_chat_messages'   // Eliminar mensajes del chat
  | 'pin_chat_messages'      // Fijar mensajes del chat
  | 'create_announcements'   // Crear anuncios del clan
  | 'invite_players'         // Invitar jugadores
  | 'generate_invite_link'   // Generar enlace de invitación
  | 'edit_clan_settings'     // Cambiar descripción, reglas, requisitos de entrada
  | 'create_events'          // Crear eventos internos y batallas de clan
  | 'view_analytics'         // Ver ranking interno, actividad de miembros y sanciones
  | 'manage_moderators'      // Asignar y quitar moderadores
  | 'report_users'           // Reportar usuarios problemáticos
  | 'delete_clan'            // Eliminar el clan (Solo OWNER)
  | 'transfer_ownership';    // Transferir liderazgo (Solo OWNER)

// Map roles internally: 'founder' is the OWNER.
const ROLE_PERMISSIONS: Record<ClanRole, Set<ClanPermissionAction>> = {
  founder: new Set<ClanPermissionAction>([
    'process_requests',
    'kick_members',
    'mute_members',
    'delete_chat_messages',
    'pin_chat_messages',
    'create_announcements',
    'invite_players',
    'generate_invite_link',
    'edit_clan_settings',
    'create_events',
    'view_analytics',
    'manage_moderators',
    'report_users',
    'delete_clan',
    'transfer_ownership'
  ]),
  admin: new Set<ClanPermissionAction>([
    'process_requests',
    'kick_members',
    'mute_members',
    'delete_chat_messages',
    'pin_chat_messages',
    'create_announcements',
    'invite_players',
    'generate_invite_link',
    'edit_clan_settings',
    'create_events',
    'view_analytics',
    'manage_moderators',
    'report_users'
  ]),
  moderator: new Set<ClanPermissionAction>([
    'mute_members',
    'delete_chat_messages',
    'report_users'
  ]),
  member: new Set<ClanPermissionAction>([])
};

/**
 * Checks if a specific role has permission to perform an action.
 * Ensures strict security restrictions:
 * - ADMIN cannot delete the clan, cannot transfer ownership, cannot manage other admins/owners.
 */
export function hasClanPermission(role: ClanRole | undefined | null, action: ClanPermissionAction): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.has(action) : false;
}

/**
 * Validates if a manager role can perform an administrative action targeting a member role.
 * For example:
 * - ADMIN can kick a member, but cannot kick the OWNER or another ADMIN.
 * - MODERATOR cannot kick or mute anyone above their role.
 */
export function canManageMember(
  managerRole: ClanRole | undefined | null,
  targetRole: ClanRole | undefined | null
): boolean {
  if (!managerRole) return false;
  if (!targetRole) return true; // Can manage a user with no clan role (invitations, etc.)

  if (managerRole === 'founder') {
    return targetRole !== 'founder'; // The owner can manage everyone except themselves
  }

  if (managerRole === 'admin') {
    // Admin cannot manage founder or other admins
    return targetRole !== 'founder' && targetRole !== 'admin';
  }

  if (managerRole === 'moderator') {
    // Moderator cannot manage founder, admin, or other moderators
    return targetRole === 'member';
  }

  return false;
}
