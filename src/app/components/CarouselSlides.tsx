export const SlideImage = ({
  imgURL,
  altText,
  loading = 'lazy',
}: {
  loading?: 'lazy' | 'eager';
  imgURL: string;
  altText: string;
}) => {
  return (
    <picture className="w-full h-full absolute top-0 left-0">
      <img src={imgURL} alt={altText} loading={loading} decoding="async" />
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
