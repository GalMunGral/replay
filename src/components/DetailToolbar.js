import IconButton from "./IconButton";

const DetailToolbar = ({ canDelete, deleteMail }) => {
  return (
    // use-transform
    [
      IconButton(
        (type = "arrow-left"),
        (onclick = () => window.history.back())
      ),
      canDelete && IconButton((type = "trash"), (onclick = deleteMail)),
    ]
  );
};

export default DetailToolbar;
