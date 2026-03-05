import PageTitle from "../ui/content/PageTitle";

export default function Error404() {
  return (<div className='PageContent'>
    <PageTitle text={'404 Page Not Found'}/>
    <div className={'PageSection'}>
      <p>The content you are looking for was not found. Please select a topic on the navigation bar to browse the
        site.</p>
    </div>
  </div>);
}