import SiteConfigPanel from "./SiteConfigPanel";

export default function SiteEditor({children}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100vw',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      <SiteConfigPanel/>
      {children}
    </div>
  )
}