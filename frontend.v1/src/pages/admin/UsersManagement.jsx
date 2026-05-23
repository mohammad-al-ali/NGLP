import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PageFrame from '../../components/ui/PageFrame';

export default function UsersManagement() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([
    { id: 1, fullName: 'Sara Student', email: 'sara@nglp.dev', role: { id: 2, name: 'ROLE_STUDENT' }, blocked: false },
    { id: 2, fullName: 'Tariq Teacher', email: 'tariq@nglp.dev', role: { id: 3, name: 'ROLE_TEACHER' }, blocked: false },
    { id: 3, fullName: 'Admin User', email: 'admin@nglp.dev', role: { id: 1, name: 'ROLE_ADMIN' }, blocked: false },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function loadUsersAndRoles() {
      try {
        setLoading(true);
        const [usersResponse, rolesResponse] = await Promise.all([
          api.get('/users'),
          api.get('/roles')
        ]);
        if (isMounted) {
          setUsers(usersResponse.data);
          setRoles(rolesResponse.data);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Backend unavailable, falling back to mock dashboard data.', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUsersAndRoles();
    return () => {
      isMounted = false;
    };
  }, []);

  async function updateUser(id, changes) {
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) return;
    
    const updatedUser = { ...targetUser, ...changes };
    setUsers((current) => current.map((user) => (user.id === id ? updatedUser : user)));
    
    try {
      await api.put(`/users/${id}/admin`, {
        role: updatedUser.role,
        blocked: updatedUser.blocked,
      });
    } catch (err) {
      console.warn('Failed to commit user update to backend. Kept local preview updated.', err);
    }
  }

  return (
    <PageFrame 
      eyebrow="Admin Panel" 
      title="Users Management" 
      actions={
        <Link 
          className="secondary-button" 
          to="/admin/categories"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: '38px',
            padding: '0 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontWeight: '600',
            fontSize: '0.85rem',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-main)',
            textDecoration: 'none'
          }}
        >
          Categories Manager
        </Link>
      }
    >
      <div 
        className="premium-card"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-main)', margin: '0' }}>
            System Users Directory
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage user authorization profiles, assign organizational roles, and lock/unlock accounts.
          </p>
        </div>

        {loading ? (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map((n) => (
              <div key={n} style={{ height: '48px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)' }} className="animate-pulse" />
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 28px', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>User Details</th>
                  <th style={{ padding: '16px 28px', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Email Address</th>
                  <th style={{ padding: '16px 28px', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Assigned Role</th>
                  <th style={{ padding: '16px 28px', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '16px 28px', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr 
                    key={user.id} 
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background-color var(--transition-fast)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td style={{ padding: '18px 28px', fontSize: '0.925rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      {user.fullName}
                    </td>
                    <td style={{ padding: '18px 28px', fontSize: '0.9rem', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '18px 28px' }}>
                      <select
                        value={user.role?.id || ''}
                        onChange={(event) => {
                          const targetRoleId = Number(event.target.value);
                          const matchingRole = roles.find((r) => r.id === targetRoleId) || { id: targetRoleId, name: targetRoleId === 1 ? 'ROLE_ADMIN' : targetRoleId === 2 ? 'ROLE_STUDENT' : 'ROLE_TEACHER' };
                          updateUser(user.id, { role: matchingRole });
                        }}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: 'var(--text-main)',
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {(roles.length > 0 ? roles : [
                          { id: 1, name: 'ROLE_ADMIN' },
                          { id: 2, name: 'ROLE_STUDENT' },
                          { id: 3, name: 'ROLE_TEACHER' }
                        ]).map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name.replace('ROLE_', '')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '18px 28px' }}>
                      <span 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          borderRadius: '50px',
                          backgroundColor: user.blocked ? 'rgba(239, 68, 68, 0.08)' : 'rgba(34, 197, 94, 0.08)',
                          color: user.blocked ? 'var(--error)' : 'var(--success)'
                        }}
                      >
                        {user.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '18px 28px', textAlign: 'right' }}>
                      <button
                        onClick={() => updateUser(user.id, { blocked: !user.blocked })}
                        style={{
                          minHeight: '32px',
                          padding: '0 14px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          backgroundColor: user.blocked ? 'rgba(34, 197, 94, 0.04)' : 'rgba(239, 68, 68, 0.04)',
                          color: user.blocked ? 'var(--success)' : 'var(--error)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = user.blocked ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)';
                          e.currentTarget.style.borderColor = user.blocked ? 'var(--success)' : 'var(--error)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = user.blocked ? 'rgba(34, 197, 94, 0.04)' : 'rgba(239, 68, 68, 0.04)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                        }}
                      >
                        {user.blocked ? 'Activate' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageFrame>
  );
}
