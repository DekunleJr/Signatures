import {
  BarLoader,
  BeatLoader,
  BounceLoader,
  ClimbingBoxLoader,
  ClipLoader,
  ClockLoader,
  DotLoader,
  FadeLoader,
  GridLoader,
  HashLoader,
  MoonLoader,
  PacmanLoader,
  PropagateLoader,
  PuffLoader,
  PulseLoader,
  RingLoader,
  RiseLoader,
  RotateLoader,
  ScaleLoader,
  SkewLoader,
  SquareLoader,
  SyncLoader,
} from "react-spinners";

const Loader = ({ loaderType, color = "#D4AF37", ...rest }) => {
  const getLoader = () => {
    switch (loaderType) {
      case "Bar":
        return <BarLoader color={color} {...rest} />;
      case "Beat":
        return <BeatLoader color={color} {...rest} />;
      case "Bounce":
        return <BounceLoader color={color} {...rest} />;
      case "Circle":
        return <CircleLoader color={color} {...rest} />;
      case "ClimbingBox":
        return <ClimbingBoxLoader color={color} {...rest} />;
      case "Clip":
        return <ClipLoader color={color} {...rest} />;
      case "Clock":
        return <ClockLoader color={color} {...rest} />;
      case "Dot":
        return <DotLoader color={color} {...rest} />;
      case "Fade":
        return <FadeLoader color={color} {...rest} />;
      case "Grid":
        return <GridLoader color={color} {...rest} />;
      case "Hash":
        return <HashLoader color={color} {...rest} />;
      case "Moon":
        return <MoonLoader color={color} {...rest} />;
      case "Pacman":
        return <PacmanLoader color={color} {...rest} />;
      case "Propagate":
        return <PropagateLoader color={color} {...rest} />;
      case "Puff":
        return <PuffLoader color={color} {...rest} />;
      case "Pulse":
        return <PulseLoader color={color} {...rest} />;
      case "Ring":
        return <RingLoader color={color} {...rest} />;
      case "Rise":
        return <RiseLoader color={color} {...rest} />;
      case "Rotate":
        return <RotateLoader color={color} {...rest} />;
      case "Scale":
        return <ScaleLoader color={color} {...rest} />;
      case "Skew":
        return <SkewLoader color={color} {...rest} />;
      case "Square":
        return <SquareLoader color={color} {...rest} />;
      case "Sync":
        return <SyncLoader color={color} {...rest} />;
      case "TailSpin":
        return <TailSpinLoader color={color} {...rest} />;
      case "ThreeDots":
        return <ThreeDotsLoader color={color} {...rest} />;
      case "Watch":
        return <WatchLoader color={color} {...rest} />;
      default:
        return <ScaleLoader color={color} {...rest} />;
    }
  };
  return (
    <div
      style={{
        width: "100%",
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        aligntems: "center",
      }}
    >
      {" "}
      {getLoader()}
    </div>
  );
};

export default Loader;

// CHECK THIS PAGE FOR LOADER TYPES => https://www.davidhu.io/react-spinners/
// CHECK THE DOCS => https://www.npmjs.com/package/react-spinners
