import {Swiper, SwiperSlide} from 'swiper/react'
import {Virtual} from 'swiper/modules';
import 'swiper/css'
import 'swiper/css/virtual'

import {useSiteContext} from "./Site";
import Page from "./Page";
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router";

export default function PageSwiper(props) {

  const {outlineData, error} = useSiteContext();
  const [swipePages, setSwipePages] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    if (outlineData) {
      setSwipePages(outlineData.filter((page) => !page.PageHidden && !page.HasChildren));
    }
  }, [outlineData, setSwipePages]);

  useEffect(() => {
    if (swiperInstance) {
      let currentSlideIndex = -1;
      if (location.pathname === '/') {
        currentSlideIndex = 0;
      } else {
        swipePages?.map((page, index) => {
          if (location.pathname === page.PageRoute) {
            currentSlideIndex = index;
          }
        })
      }
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

  return (<>{error || props.login ? (
    <Page {...props}/>
  ) : (
    <Swiper
      modules={[Virtual]}
      speed={600}
      onSwiper={setSwiperInstance}
      onSlideChange={onSlideChange}
      style={{
        margin: 0,
      }}
      virtual
    >
      {swipePages?.map((page, index) =>
        <SwiperSlide key={page.PageID} virtualIndex={index}>
          <Page {...props} pageId={page.PageID}/>
        </SwiperSlide>
      )}
    </Swiper>
  )}</>);
}