import React, { useContext, useState } from "react";
import axios from "axios";
import { withRouter, Redirect } from "react-router";
import { AuthContext } from "./AuthProvider";
import FacebookLogin from "react-facebook-login";
import config from "../../environments/config";

const Login = ({ history }) => {
  const { setCurrentUser, currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const responseFacebook = (response) => {
    setLoading(true);
    const { accessToken, userID, name, email, picture } = response;
    axios
      .get(
        `https://graph.facebook.com/${userID}/accounts?access_token=${accessToken}`
      )
      .then((pagesRes) => {
        const pages = pagesRes.data.data;
        const userObj = {
          accessToken,
          userID,
          name,
          email,
          picture,
          pages,
        };
        axios
          .post(config.API_URL + "auth", userObj)
          .then((response) => {
            setCurrentUser(response.data);
            localStorage.setItem("user", JSON.stringify(userObj));
            localStorage.setItem("token", accessToken);
            setLoading(false);
            history.push("/");
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setLoading(true);
      });
  };

  if (currentUser) {
    return <Redirect to="/" />;
  }

  return (
    <div style={{ background: "#004E97", height: "100vh" }}>
      <div className="row justify-content-center p-5">
        <div className=" col-sm-6">
          <div
            className="align-items-center card p-3 mx-5"
            style={{ borderRadius: "1rem" }}
          >
            <img
              src="https://assets-global.website-files.com/5efccc15b40a7dfbb529ea1a/5f8b2e4c689873149306fa46_Richpanel_logo_colored.svg"
              alt="logo"
              height="80px"
            ></img>
            <h1
              className="display-4 mb-0 mt-3 text-center"
              style={{ fontSize: "30px" }}
            >
              Welcome to Richpanel's Facebook helpdesk!
            </h1>
            <hr className="my-2"></hr>
            {loading ? (
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <FacebookLogin
                appId={config.APP_ID}
                fields="name,email,picture"
                scope="business_management,pages_manage_metadata,pages_manage_engagement,pages_messaging,pages_read_engagement,pages_read_user_content,pages_show_list,pages_manage_cta"
                callback={responseFacebook}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withRouter(Login);
