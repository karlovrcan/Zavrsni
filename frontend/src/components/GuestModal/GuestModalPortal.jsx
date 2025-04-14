import ReactDOM from "react-dom";
import GuestModal from "./GuestModal";

const GuestModalPortal = ({ onClose }) => {
  return ReactDOM.createPortal(
    <GuestModal onClose={onClose} />,
    document.getElementById("modal-root")
  );
};

export default GuestModalPortal;
