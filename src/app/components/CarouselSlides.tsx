export const SlideImage = ({
  imgURL,
  altText,
  index,
}: {
  imgURL: string;
  altText: string;
  index: number;
}) => {
  return (
    <picture>
      {/* Largest Size */}
      <source
        srcSet={`
       https://source.unsplash.com/${imgURL}/1920x1080 1x
      `}
        media="(min-width: 75em)"
      />
      {/* Medium Size */}
      <source
        srcSet={`
        https://source.unsplash.com/${imgURL}/1024x576 1x,
        https://source.unsplash.com/${imgURL}/1920x1080 2x
      `}
        media="(min-width: 40em)"
      />
      <img
        src={`https://source.unsplash.com/${imgURL}/400x225`}
        alt={altText || `Description of Slide ${index + 1}`}
        srcSet={`
  https://source.unsplash.com/${imgURL}/400x225 1x, 
  https://source.unsplash.com/${imgURL}/1024x576 2x,
  https://source.unsplash.com/${imgURL}/1920x1080 3x
  `}
        // loading="lazy"
        decoding="async"
        width={1920}
        height={1080}
      />
    </picture>
  );
};

export const SlideVideo = ({
  videoURL,
  fileType,
}: {
  videoURL: string;
  fileType: string;
}) => {
  return (
    <div className="video-container">
      <video controls aria-label="Video 1" poster="video-poster.jpg">
        {/* Add your video source and other attributes here */}
        {fileType === 'webm' && <source src={videoURL} type="video/webm" />}
        {fileType === 'mp4' && <source src={videoURL} type="video/mp4" />}
        {fileType === 'ogg' && <source src={videoURL} type="video/ogg" />}

        {/* Closed captions or subtitles for spoken content */}
        <track
          label="English"
          kind="subtitles"
          srcLang="en"
          src="vtt/subtitles-en.vtt"
          default
        />
        <track
          label="Francais"
          kind="subtitles"
          srcLang="fr"
          src="vtt/subtitles-fr.vtt"
        />
        <p>
          Your browser does not support the video tag.
          <br />
          <a href="https://tinloof.com/blog">Click here</a> to view source.
        </p>
      </video>
    </div>
  );
};

export const InterActiveSlideWithButtons = ({
  fn,
  title,
  isToggled,
}: {
  fn: () => void;
  title: string;
  isToggled: boolean;
}) => {
  return (
    <div>
      <h3>{title}</h3>
      {/* Using a negative tabindex ensures that these elements 
        are not focusable until the user interacts with the carousel.  */}
      <button onClick={fn}>Click Me</button>
      <div className="interactive-slide__output">
        {isToggled ? 'ON' : 'OFF'}
      </div>
    </div>
  );
};
