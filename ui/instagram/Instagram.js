import {InstagramEmbed} from "react-social-media-embed";
import InstagramConfig from "./InstagramConfig";
import FormEditor from "../editor/FormEditor";
import {useEffect, useState} from "react";

/**
 * Embed an Instagram feed.
 *
 * @param extraData   {ExtraData}
 * @returns {JSX.Element}
 * @constructor
 */
export default function Instagram({extraData}) {

  const [data, setData] = useState(null);
  useEffect(() => {
    setData(extraData);
  },[extraData]);

  return (<div className={'Instagram mt-4'} style={{width: '100%'}}>
    {data && (
      <InstagramEmbed url={`https://www.instagram.com/${data.InstagramHandle.replaceAll(/[^a-zA-Z0-9-\-.]/g, '')}`} width={'100%'}/>
    )}
    <FormEditor>
      <InstagramConfig extraData={data} setExtraData={setData} />
    </FormEditor>
  </div>);
}