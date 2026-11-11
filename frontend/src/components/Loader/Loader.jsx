// Import only the spinners actually used, from their own modules, so the rest of
// react-spinners isn't bundled. To use another one, add it here:
//   import XLoader from "react-spinners/XLoader";
// Docs: https://www.davidhu.io/react-spinners/
import ScaleLoader from "react-spinners/ScaleLoader";
import PulseLoader from "react-spinners/PulseLoader";

const LOADERS = {
  Scale: ScaleLoader,
  Pulse: PulseLoader,
};

const Loader = ({ loaderType = "Scale", color = "#D4AF37", ...rest }) => {
  const Spinner = LOADERS[loaderType] || ScaleLoader;
  return (
    <div
      style={{
        width: "100%",
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Spinner color={color} {...rest} />
    </div>
  );
};

export default Loader;
