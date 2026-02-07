import SiteConfigPanel from "./SiteConfigPanel";

export default function SiteEditor({children}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100vw',
        minHeight: '100dvh',
        position: 'relative',
      }}
    >
      <SiteConfigPanel/>
      {children}
    </div>
  )
}