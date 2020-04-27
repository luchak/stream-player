import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Button, Input } from "semantic-ui-react";
import ReactAudioPlayer from "react-audio-player";

import "./App.css";

function formatElapsedTime(elapsedTime: number) {
  return `${Math.floor(elapsedTime / 60.0)}:${(elapsedTime % 60.0)
    .toFixed(0)
    .padStart(2, "0")}`;
}

async function getInfo(streamURLString: string) {
  const streamURL = new URL(streamURLString);

  const statsURLString = `${streamURL.protocol}//${streamURL.host}/status-json.xsl`;

  const mountPoint = streamURL.pathname.slice(1);

  const stats = await fetch(statsURLString);

  try {
    if (stats.body) {
      const statsJSON = await stats.json();
      console.log(statsJSON);
      for (const source of statsJSON.icestats.source) {
        if ((source.listenurl as string).endsWith(mountPoint)) {
          return {
            artist: source.artist as string | undefined,
            title: source.title as string,
          };
        }
      }
    }
  } catch (err) {
    console.warn("Could not fetch stream metadata", err);
  }

  return { artist: undefined, title: "" };
}

function App() {
  const [url, setURL] = useState("");
  const [urlText, setURLText] = useState(
    "https://radio.rtrance.com/mixcomp.mp3"
  );
  const [elapsedTime, setElapsedTime] = useState(0);
  const [metadata, setMetadata] = useState<{ artist?: string; title: string }>({
    artist: undefined,
    title: "",
  });

  return (
    <div className="App">
      <Helmet>
        <link
          rel="stylesheet"
          href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
        />
      </Helmet>
      {/*
      <Input
        onChange={(event) => setURLText(event.target.value)}
        placeholder="Stream URL"
        value={urlText}
      />
      <Button onClick={() => setURL(urlText)}>Go</Button>
      */}
      <Button onClick={() => setURL("https://radio.rtrance.com/mixcomp.ogg")}>
        Listen (OGG)
      </Button>
      <Button onClick={() => setURL("https://radio.rtrance.com/mixcomp.mp3")}>
        Listen (MP3)
      </Button>
      <br />
      {url.length > 0 && (
        <ReactAudioPlayer
          src={url}
          autoPlay
          controls
          listenInterval={1000}
          onListen={async (event) => {
            const time = (event as unknown) as number;
            setElapsedTime(time);

            if (time % 20.0 < 1.0) {
              const info = await getInfo(url);
              setMetadata(info);
            }
          }}
        />
      )}
      <br />
      {metadata.artist === undefined
        ? metadata.title
        : `${metadata.artist} - ${metadata.title}`}{" "}
      ({formatElapsedTime(elapsedTime)})
    </div>
  );
}

export default App;
