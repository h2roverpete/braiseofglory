import React, {useState, useEffect} from 'react';

export default function HtmlFile(props) {
  const {currentPage} = useSiteContext();

  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    fetch(props.fileName)
      .then(response => response.text())
      .then(data => setHtmlContent(data))
      .catch(error => console.error(`Error fetching HTML ${props.fileName}:`, error));
  }, [props.fileName]);

  return (
    <>{currentPage?.PageID === props.pageId && (
      <div dangerouslySetInnerHTML={{__html: htmlContent}}/>
    )}</>
  );
}