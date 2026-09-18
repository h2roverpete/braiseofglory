import NavBar from "framework/ui/content/NavBar";
import PageContent from "framework/ui/content/PageContent";
import PageTitle from "framework/ui/content/PageTitle";
import PageSections from "framework/ui/content/PageSections";
import PageSwiper from "framework/ui/content/PageSwiper";
import PageNavigation from "framework/ui/content/PageNavigation";

/**
 * Component for site-specific page contents.
 * Customize as needed with all the page elements.
 *
 * @param props {PageProps}
 * @returns {JSX.Element}
 * @constructor
 */
export default function MyPage(props) {
  return (<>
    <NavBar icon={'/images/favicon.png'} expand={'sm'} showLogin />
    <PageSwiper {...props}>
      <PageContent>
        <PageTitle/>
        <PageSections/>
      </PageContent>
    </PageSwiper>
    <PageNavigation html={'Site managed by H2Rover'}/>
  </>)
}