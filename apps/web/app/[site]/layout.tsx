import { PWAInstallPrompt } from '../../components/pwa/PWAInstallPrompt'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <PWAInstallPrompt />
    </>
  )
}