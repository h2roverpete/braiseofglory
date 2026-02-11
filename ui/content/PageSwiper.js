import {Swiper, SwiperSlide} from 'swiper/react'
import 'swiper/css'
import {useSiteContext} from "./Site";
import Page from "./Page";
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router";
import {useEdit} from "../editor/EditProvider";

export default function PageSwiper(props) {

  const {outlineData, error} = useSiteContext();
  const [swipePages, setSwipePages] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [swiperInstance, setSwiperInstance] = useState(null);
  const {canEdit} = useEdit();

  useEffect(() => {
    if (outlineData) {
      setSwipePages(outlineData.filter((page) => !page.PageHidden && !page.HasChildren));
    }
  }, [outlineData, setSwipePages]);

  useEffect(() => {
    if (swiperInstance) {
      let currentSlideIndex = -1;
      swipePages?.map((page, index) => {
        if (location.pathname === page.PageRoute) {
          currentSlideIndex = index;
        }
        return page;
      })
      if (currentSlideIndex !== -1 && swiperInstance.realIndex !== currentSlideIndex) {
        swiperInstance.slideTo(
          currentSlideIndex,
          Math.abs(swiperInstance.realIndex - currentSlideIndex) === 1 ? 500 : 0
        );
      }
    }
  }, [location.pathname, swiperInstance, swipePages]);

  // Function to handle slide change and update the URL
  const onSlideChange = (swiper) => {
    const activePage = swipePages[swiper.realIndex];
    if (activePage && location.pathname !== activePage.PageRoute) {
      navigate(activePage.PageRoute);
    }
  };

  return (<>{error || props.login || canEdit ? (
    <Page {...props}/>
  ) : (
    <Swiper
      speed={600}
      onSwiper={setSwiperInstance}
      onSlideChange={onSlideChange}
      style={{
        margin: 0,
      }}
    >
      {swipePages?.map((page) =>
        <SwiperSlide key={page.PageID} style={{overflow: 'scroll'}}>
          <Page {...props} pageId={page.PageID}/>
        </SwiperSlide>
      )}
    </Swiper>
  )}</>);
}