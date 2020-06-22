import IconButton from "@components/Common/IconButton";

const DetailToolbar = ({ canDelete, deleteMail }) => {
  return (
    // use-transform
    [
      IconButton((type = "arrow-left"), (onclick = () => history.back())),
      canDelete && IconButton((type = "trash"), (onclick = deleteMail)),
    ]
  );
};

export default DetailToolbar;
