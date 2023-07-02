// react component to render a youtube video player

import React from "react";
import { extractVideoId } from "../utils";

export default function Youtube(props: { url: string; ts: Number }) {
  const url = props.url;
  const ts = props.ts;
  const videoId = extractVideoId(url);

  if (videoId === null) {
    return <div>Invalid youtube url</div>;
  }

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      paddingBottom: '56.25%', /* for 16:9 aspect ratio use 56.25% */
      height: 0,
    }}>
      <iframe
        className="aspect-video w-full"
        src={`https://www.youtube.com/embed/${videoId}?start=${ts}&autoplay=${1}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}