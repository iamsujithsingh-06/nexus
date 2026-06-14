import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const SETTINGS_SECTIONS = [
  {
    id: 'profile',
    title: 'Profile',
    icon: <ProfileSvg />,
    fields: [
      { label: 'Name', value: '—' },
      { label: 'Email', value: '—' },
      { label: 'Timezone', value: Intl.DateTimeFormat().resolvedOptions().timeZone },
    ],
  },
  {
    id: 'preferences',
    title: 'Preferences',
    icon: <PrefsSvg />,
    fields: [
      { label: 'Theme', value: 'Dark (Nexus)' },
      { label: 'Language', value: 'English' },
      { label: 'Response Style', value: 'Balanced' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: <NotifSvg />,
    fields: [
      { label: 'Email Digests', value: 'Off' },
      { label: 'Streak Reminders', value: 'On' },
      { label: 'Goal Check-ins', value: 'Daily' },
    ],
  },
  {
    id: 'api',
    title: 'API & Integrations',
    icon: <ApiSvg />,
    fields: [
      { label: 'Gemini Model', value: 'Flash Lite 2.5' },
      { label: 'API Status', value: 'Connected' },
      { label: 'Data Sync', value: 'Local Storage' },
    ],
  },
  {
    id: 'storage',
    title: 'Data & Storage',
    icon: <StorageSvg />,
    fields: [
      { label: 'Chat Sessions', value: '—' },
      { label: 'Goals', value: '—' },
      { label: 'Tasks', value: '—' },
    ],
    actions: [
      { label: 'Export Data', disabled: true },
      { label: 'Clear Local Data', disabled: true, danger: true },
    ],
  },
];

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-white/90">Settings</h1>
          <p className="text-xs text-nexus-subtle/40 mt-0.5">
            Manage your account, preferences, and data.
          </p>
        </div>

        <div className="space-y-3">
          {SETTINGS_SECTIONS.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-nexus-card/40 border border-white/[0.06] rounded-xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.03]">
                <div className="w-8 h-8 rounded-lg bg-nexus-accent/8 border border-nexus-accent/10 flex items-center justify-center">
                  {section.icon}
                </div>
                <h3 className="text-sm font-medium text-white/80">{section.title}</h3>
              </div>
              <div className="p-4">
                <div className="space-y-2.5">
                  {section.fields.map((field) => (
                    <div key={field.label} className="flex items-center justify-between">
                      <span className="text-xs text-nexus-subtle/40">{field.label}</span>
                      <span className="text-xs text-nexus-subtle/60">{field.value}</span>
                    </div>
                  ))}
                </div>
                {section.actions && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-white/[0.03]">
                    {section.actions.map((action) => (
                      <button
                        key={action.label}
                        disabled={action.disabled}
                        className={`text-2xs px-3 py-1.5 rounded-lg border transition-all ${
                          action.danger
                            ? 'border-red-500/15 text-red-400/50 bg-red-500/5 cursor-not-allowed opacity-50'
                            : 'border-white/[0.06] text-nexus-subtle/30 bg-white/[0.02] cursor-not-allowed opacity-50'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Account Info Footer */}
        <div className="mt-6 text-center">
          <p className="text-2xs text-nexus-subtle/15">
            Signed in as {user?.email || '—'} · Nexus Life OS v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

function PrefsSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>;
}

function NotifSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}

function ApiSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
}

function StorageSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
}
