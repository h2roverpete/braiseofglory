import SiteConfigPanel from "./SiteConfigPanel";
import PageConfigPanel from "./PageConfigPanel";

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
      <SiteConfigPanel />
      <PageConfigPanel />
      {children}
    </div>
  )
}