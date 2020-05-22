import store$ from "../observables/store";
import router$ from "../observables/router";
import IconButton from "./IconButton";

const DetailToolbar = ({ folder, id }) => {
  const deleteMail = () => {
    store$.dispatch((dispatch) => {
      router$.navigate("/" + folder);
      setTimeout(
        () =>
          dispatch({
            type: store$.T.DELETE,
            payload: { id, folder },
          }),
        200
      );
    });
  };

  return (
    // use-transform
    [
      IconButton(
        (onclick = () => window.history.back()),
        (type = "arrow-left")
      ),
      folder !== "trash" &&
        IconButton((type = "trash"), (onclick = deleteMail)),
    ]
  );
};

export default DetailToolbar;
