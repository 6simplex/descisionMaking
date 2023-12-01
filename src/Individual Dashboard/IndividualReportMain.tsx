import axios from "axios";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../Redux/store/store";
import {
  updateAsEntity,
  updateDataSource,
  updateDomains,
  updateJurisdictions,
  updateObcmSnapShot,
  updateObcmSnapShotDetails,
  updateProject,
  updateProjectConceptModel,
  updateUserInfo,
  updateUserList,
} from "../Redux/main-slice/main-slice";
import { Domains, Jurisdictions } from "../revelo-Interface/common";
import { Progress, Typography, Button, Select } from "antd";
import { fetchData } from "../utils/cutsomhooks";
import { CyUserGraph, getAllDescendants } from "../utils/cytoscape";
import { JurisdictionObject } from "../utils/jurisdiction";
import { useNavigate, useParams } from "react-router-dom";
import IndividualDashboard from "./IndividualDashboard";


function IndividualReportMain() {
  let serverUrl = window.__rDashboard__.serverUrl;
  const { name, projectName } = useParams()
  const navigation = useNavigate()
  const { userInfo } = useAppSelector((state) => state.reveloUserInfo);
  const [loadComplete, setLoadComplete] = useState(true);
  const [errorState, setErrorState] = useState(true);
  const [errorMessage, setErrorMessage] = useState(
    "Validating your Configuration..."
  );
  const [percentage, setPercentage] = useState(0);
  const dispatch = useAppDispatch();
  //orgToken for customer amdin
  // axios.defaults.headers.common["Authorization"] = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ4S2FpTjVtVjl4dFA5MEhSTS1LR21TS2pZM1FTQWVhOHF5d3lxWHlLNUFZIn0.eyJleHAiOjE2OTA5NTQxNzcsImlhdCI6MTY4ODM2MjE3NywianRpIjoiYWY0ZGE1NGYtNzNkMC00ZGZjLTk1NzQtZGNmZDU0YTA2ZTNmIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgxL2F1dGgvcmVhbG1zL3JldmVsbzM1IiwiYXVkIjpbImhhd2tleWUiLCJyZXZlbG8iLCJhY2NvdW50Il0sInN1YiI6IjI0NjQzMzYxLTBmNWUtNDc1YS1iZjQ1LTcxNDZjMTA0MmMzZiIsInR5cCI6IkJlYXJlciIsImF6cCI6InJldmVsb2FkbWluMzUiLCJzZXNzaW9uX3N0YXRlIjoiOWIwMGI2NzQtMzgwYi00NGRkLWI1MzctODhhZDI0Njc2NzFmIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjgwODAvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJvcmdhZG1pbiIsInVtYV9hdXRob3JpemF0aW9uIiwiZGVmYXVsdC1yb2xlcy1yZXZlbG8zNSJdfSwicmVzb3VyY2VfYWNjZXNzIjp7Imhhd2tleWUiOnsicm9sZXMiOlsib3JnYWRtaW4iXX0sInJldmVsb2FkbWluMzUiOnsicm9sZXMiOlsib3JnYWRtaW4iXX0sInJldmVsbyI6eyJyb2xlcyI6WyJvcmdhZG1pbiJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJPcmcgQWRtaW4iLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJvcmdhZG1pbiIsImdpdmVuX25hbWUiOiJPcmciLCJmYW1pbHlfbmFtZSI6IkFkbWluIiwiZW1haWwiOiJ3OW9yZ2FkbWluQDZzaW1wbGV4LmNvLmluIn0.pQbOvUkMv3IXvUIs6b7CAZ4GD2R1yMHoTAEnEF6F3BFuQQLzf6kzFFs3QyxRLckGUnsVKOa4VTpcmM49nRF-w288H7LfxO69OFVuj7xrgnv07Fi41vHZuKpLcpuHrgnf9pCEiSd7prXA7BiDFNarT9l1G_TkhBN4Jmjm16UOvPF0z0vtLI52xaF407bIi9nzJw6gTAnedo-J5nI4vovTXMmx1fvKliH1LIlxdnu5IR4UGFvtQgVsb6AKwzFXPlIEjr8EiIMbyrCtZHsrz-XIgz_WgZOEvWquXUXTnN5XTyUktOtbC6u14A_3M485JE2zJ17f-LF9zkr7XA362IJNtg"
  ///====>>for local machine you need to hardcode your user token like below comments  ====>>>>
  // axios.defaults.headers.common["Authorization"] = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJvVWNteFZHbGcxR3lRTFJEeHkyRVA0UzBUSkV0d2pXcFFVenZ1elc0ZmdFIn0.eyJleHAiOjE3MDMyNjI5NzYsImlhdCI6MTcwMDY3MDk3NiwianRpIjoiMTFjMWM1ZGUtNmUxZS00ZjdmLWFiMmUtMTZkNzI2Y2M4OWY5IiwiaXNzIjoiaHR0cDovLzEwMy4yNDguNjAuMTg6ODA5MC9hdXRoL3JlYWxtcy9ubWMzNSIsImF1ZCI6WyJoYXdrZXllIiwiYWNjb3VudCIsInJldmVsbzM1Il0sInN1YiI6IjFhMGFlMDUwLTU2MWItNDc3Ny1hZTBhLTU3Zjg2MmJmYzdlZSIsInR5cCI6IkJlYXJlciIsImF6cCI6InJldmVsb2FkbWluMzUiLCJzZXNzaW9uX3N0YXRlIjoiZTQwM2ZiMDQtY2NkNC00ODlkLThhNGQtZmU2YmRjODFmMWUwIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vMTAzLjI0OC42MC4xODo3MDUzIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW5tYzM1Iiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImN1c3RvbWVyYWRtaW4iXX0sInJlc291cmNlX2FjY2VzcyI6eyJoYXdrZXllIjp7InJvbGVzIjpbImN1c3RvbWVyYWRtaW4iXX0sInJldmVsb2FkbWluMzUiOnsicm9sZXMiOlsiY3VzdG9tZXJhZG1pbiJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19LCJyZXZlbG8zNSI6eyJyb2xlcyI6WyJjdXN0b21lcmFkbWluIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJBZG1pbiBOTUMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhZG1pbl9ubWMiLCJnaXZlbl9uYW1lIjoiQWRtaW4iLCJmYW1pbHlfbmFtZSI6Ik5NQyIsImVtYWlsIjoiY3VzdG9tZXJhZG1pbkBubWMuZ292In0.TxEQj6Ibfg2VxDpT3yBQMimx4ENN5fX5jI7s-Jy60eYeU6Oy1Es-l0cN7SrrfYG-4bfG71tWx3XN8Ui0qHK14Y9rTLf0Rda-UpkbKLTbD2lvlOISI9hUJjQD5RXTHQLXzI1MRkUHvhAItlgr74ddrDwk3EEQ6RGAwmfJoYGl91XjpyzgfV_8PGUmM5SSzSmK9mJ9Qo7TCaJprJwWrgaQ58gqhzkf6lH-RJGRzyv_1Ij2Gt-pkbwBTLLZjtpi-SwZ6gWgePStLUC0Yaff0HJAPNvDgMdbcLIAgv-fmrQxCCGhamMT7uF-tSsJtHABqlssolz3Yubkju244Jeg8HccsA"

  useEffect(() => {
    postLoginLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const postLoginLoading = () => {
    setPercentage(25);
    const principalUrl = `${serverUrl}/access/principal/web?clientName=webviewer&callback=cbk`;
    const iFoo = (url: string) => {
      var iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.name = "frame";
      iframe.style.height = "0px";
      iframe.style.width = "0px";
      iframe.style.border = "none";
      iframe.style.position = "absolute";
      iframe.style.bottom = "0px";
      document.body.appendChild(iframe);
      return new Promise((resolve, reject) => {
        iframe.onload = () => {
          axios
            .get(principalUrl)

            .then((res) => {
              resolve(res);
              document.body.removeChild(iframe);
              setPercentage(50);
            })
            .catch((err) => {
              console.log(err);
              window.location.reload();
              console.log(err.response);
            });
        };
      });
    };
    iFoo(principalUrl)
      .then((response: any) => {
        let { data } = response;
        if (typeof data === "string") {
          if (data.startsWith("cbk")) {
            data = data.substr(5, data.length - 7);
            data = data.replace(/\\/g, "");
            data = JSON.parse(data);
            setPercentage(99);
          } else {
            window.location.reload();
            console.error("invalid authorization, please login.");
            throw new Error("invalid authorization, please login.");
          }
        }
        const { userInfo, message, status } = data;

        if (status === "failure" || !userInfo) {
          setLoadComplete(false);
          setErrorMessage("Project not assigned. Please assign project");
        }
        if (userInfo.role === "orgAdmin") {
          dispatch(updateUserInfo({ ...data }));
          navigation("/customeradmin")
        } else {
          dispatch(updateUserInfo({ ...data }));
        }

        setTimeout(() => {
          if (userInfo.role === "orgAdmin") {
            dispatch(updateUserInfo({ ...data }));
            navigation("/customeradmin")
            setPercentage(99);
            setLoadComplete(false);
          } else {
            dispatch(updateUserInfo({ ...data }));
            setPercentage(99);
            setLoadComplete(false);
          }

        }, 1000);
      })
      .catch((error) => {
        console.error(error);
        let msg = "";
        if (error && error.message) {
          msg = error.message;
        }
        if (error && error.config && error.config.url) {
          msg += ", (failed to reach " + error.config.url;
        }
        console.log(msg);
      });
  };
  const validateUser = () => {
    setPercentage(0);
    setErrorMessage(`Intializing ${document.title}....`);
    //get user jurisdictions
    let error: boolean = true;
    let userJurisdictions = userInfo.userInfo.jurisdictions;

    if (userJurisdictions.length === 0) {
      setErrorMessage(
        "You do not have any jurisdictions set. Please contact your Administrator and get a jurisdiction assigned."
      );
      return error;
    }
    //At 3.0, we only support single jurisdiction. So take the first one.
    var jurisdiction = userJurisdictions[0];
    let jurisdictionName = jurisdiction.name;
    let jurisdictionType = jurisdiction.type;
    if (
      !jurisdictionName ||
      jurisdictionName.length === 0 ||
      !jurisdictionType ||
      jurisdictionType.length === 0
    ) {
      setErrorMessage(
        "A Jurisdiction was not assigned correctly. It's name or type is invalid. Please contact your Administrator and get a jurisdiction assigned correctly."
      );
      return error;
    }

    //check jurisdiction filters existence
    if (!userInfo.userInfo.jurisdictionFilters) {
      setErrorMessage(
        "No jurisdiction details were created. Please contact your Administrator and get the jurisdiction re-assigned correctly."
      );
      return error;
    }
    //get user's assigned projects
    let assignedProjects = userInfo.userInfo.assignedProjects;
    if (assignedProjects.length === 0) {
      setErrorMessage(
        "You do not have any Project assigned. Please contact your Administrator and get a Project assigned."
      );
      return error;
    }
    //get the analytics datasource
    if (userInfo.userInfo.hasOwnProperty("customerInfo") === false) {
      setErrorMessage(
        "Analytics data pipeline is required, but was not made available by Server. Please contact your Administrator."
      );
      return error;
    } else {
      const analyticsDatasource = userInfo.userInfo.customerInfo.outputStore;
      if (Object.keys(analyticsDatasource).length === 0) {
        setErrorMessage(
          "Analytics data pipeline info not available. Please contact your Administrator."
        );
        return error;
      }

     
      if (!analyticsDatasource.hostName || !analyticsDatasource.portNumber) {
        setErrorMessage(
          "Analytics data pipeline connection info not available. Please contact your Administrator."
        );
        return error;
      }
    }
    error = false;
    return error;
  };
  async function getReveloArtifacts(projectName: string) {
    if (!validateUser()) {
      setErrorMessage(
        "Retrieving Boundaries, your Jurisdiction and assigned Project..."
      );
      let obcmSnapShotDetails = await fetchData(
        `${serverUrl}/conceptmodels/w9obcm?details=true`
      );
      if (
        obcmSnapShotDetails.error &&
        obcmSnapShotDetails.error.status &&
        obcmSnapShotDetails.error.data
      ) {
        let errorMessage =
          obcmSnapShotDetails.error.status +
          ": " +
          obcmSnapShotDetails.error.data;
        return setErrorMessage(
          "Unable to retrieve the Administrative boundaries. Have these been configured?. Error: " +
          errorMessage +
          ". Please contact your Administrator."
        );
      }
      if (!obcmSnapShotDetails.datasourceName) {
        return setErrorMessage(
          "Administrative boundaries data store is not configured. Please contact your Administrator."
        );
      }
      if (!obcmSnapShotDetails.gisServerUrl) {
        return setErrorMessage(
          "The Administrative boundaries are not published to a GIS Server. Please contact your Administrator."
        );
      }
      if (
        !JurisdictionObject(
          obcmSnapShotDetails,
          userInfo.userInfo.jurisdictions[0].type,
          null
        )
      ) {
        return setErrorMessage(
          "You assigned jurisdiction - " +
          userInfo.userInfo.jurisdictions[0].type +
          " - is invalid. Please contact your Administrator."
        );
      }
      dispatch(updateObcmSnapShotDetails({ ...obcmSnapShotDetails }));
      setPercentage(15);
      //need to check if assigned one or more Projects then we will give drop down to selecet
      let project = await fetchData(
        `${serverUrl}/surveys/${projectName}?details=true`
      );
      if (project.error) {
        return setErrorMessage("Error While getting Project");
      }
      if (!project || !project.surveyId || !project.name) {
        return setErrorMessage(
          "No project by name " +
          projectName.toUpperCase() +
          " exists. Please contact your Administrator."
        );
      }
      if (!project.datasourceName) {
        return setErrorMessage(
          "Project " +
          projectName.toUpperCase() +
          " has no source of data. Please contact your Administrator."
        );
      }
      if (!project.gisServerUrl) {
        return setErrorMessage(
          "Project " +
          projectName.toUpperCase() +
          " has no GIS Server. Please contact your Administrator."
        );
      }
      let assignedCM = project.conceptModelName
      dispatch(updateProject({ ...project }));
      setPercentage(25);
      let projectDataSource = await fetchData(`${serverUrl}/datasources/${project.datasourceName}`)
      if (projectDataSource.error) {
        return setErrorMessage("Error While Getting DataSource")
      }
      dispatch(updateDataSource({ ...projectDataSource }))
      setPercentage(40)
      let projectCM = await fetchData(
        `${serverUrl}/conceptmodels/${assignedCM}?details=true`
      );
      if (
        !projectCM ||
        !projectCM.hasOwnProperty("entities") ||
        !projectCM.hasOwnProperty("relations")
      ) {
        return setErrorMessage(
          "The Project " +
          projectName.toUpperCase() +
          "'s concept model was not download correctly. It does not have required information. Please contact your Administrator."
        );
      }

      if (projectCM.entities.length === 0) {
        return setErrorMessage(
          "The Project " +
          projectName.toUpperCase() +
          "'s concept model does not have any concepts. Please contact your Administrator."
        );
      }
      dispatch(updateProjectConceptModel({ ...projectCM }));
      setPercentage(50);

      let asEntity = await fetchData(
        `${serverUrl}/users/${userInfo.userInfo.userName}/profile/assignedsurveys/${projectName}/asentities`
      );
      if (asEntity.length === 0) {
        return setErrorMessage(
          "You are not assigned to Project " +
          projectName.toUpperCase() +
          ". Please contact your Administrator."
        );
      }
      dispatch(updateAsEntity({ ...asEntity }));
      setPercentage(75);
      let projectCMDomains = await fetchData(
        `${serverUrl}/conceptmodels/${assignedCM}/domains`
      );
      projectCMDomains.forEach((element: Domains) => {
        dispatch(updateDomains({ ...element }));
      });
      let usersGraphJSON = await fetchData(
        `${serverUrl}/${userInfo.orgName}/usersgraph`
      );
      if (!usersGraphJSON) {
        return setErrorMessage(
          "Users graph is not available from Server. Please contact your Admin."
        );
      }
      let userGraph = CyUserGraph(usersGraphJSON);
      var userNode = userGraph.nodes(
        "[id='" + userInfo.userInfo.userName + "']"
      );
      var userData = userNode.data();
      var userNodeMap = new Map();
      getAllDescendants(userNode, userGraph, userNodeMap, "userName");
      let childrenUsersArray = [userData.userName];
      var userNodesIterator = userNodeMap.keys();
      var userNodeEntry = userNodesIterator.next();
      while (userNodeEntry.done === false) {
        var userName = userNodeEntry.value;
        childrenUsersArray.push(userName);
        userNodeEntry = userNodesIterator.next();
      }
      dispatch(updateUserList(childrenUsersArray));
      let jurisdiction = await fetchData(
        `${serverUrl}/users/${userInfo.userInfo.userName}/profile/jurisdictions`
      );
      jurisdiction.forEach((element: Jurisdictions) => {
        dispatch(updateJurisdictions({ ...element }));
      });
      let ocbmSnapShot = await fetchData(
        `${serverUrl}/conceptmodels/w9obcm/snapshot`
      );
      dispatch(updateObcmSnapShot({ ...ocbmSnapShot }));
      setPercentage(100);
      return setErrorState(false);
    }
  }
  useEffect(() => {
    if (userInfo.status === "success") {
      if (userInfo.userInfo.role === "orgAdmin") {
        return

      } else {
        if (typeof (projectName) === "string") {
          getReveloArtifacts(projectName)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);
  return (
    <>

      {!errorState ? (
        <>
          <IndividualDashboard reportName={`${name}`} />
        </>
      ) : (
        <>
          <div
            style={{
              display: !errorState ? "none" : "flex",
              flexDirection: "row",
              placeContent: "center",
              placeItems: "center",
              paddingTop: "10%",
            }}
          >
            <div
              style={{
                width: "50rem",
                height: "10rem",
                display: "flex",
                flexDirection: "row",
                placeContent: "center",
                placeItems: "center",
                boxShadow: "0px 10px 30px 1px rgba(194,194,194,0.75)",
              }}
            >
              {loadComplete ? (
                <>
                  <Progress type="circle" size="small" percent={percentage} />
                  <Typography
                    style={{
                      marginLeft: "2rem",
                      fontSize: "1.2rem",
                      fontFamily: "serif",
                      letterSpacing: "0.025rem",
                      fontWeight: 500,
                    }}
                  >
                    Retreving User Profile....
                  </Typography>
                </>
              ) : (
                <>
                  {errorState ? (
                    <>
                      <Progress
                        style={{ marginLeft: "1rem" }}
                        type="circle"
                        size="small"
                        percent={percentage === 99 ? 0 : percentage}
                      />
                      <Typography
                        style={{
                          marginLeft: "2rem",
                          fontSize: "1rem",
                          fontFamily: "serif",
                          letterSpacing: "0.025rem",
                          fontWeight: 500,
                          marginRight: "1rem",
                        }}
                      >
                        {errorMessage}
                      </Typography>
                      {errorMessage === "Validating your Configuration..." ||
                        errorMessage ===
                        "Retrieving Boundaries, your Jurisdiction and assigned Project..." ? (
                        <></>
                      ) : (
                        <>
                          <Button
                            type="primary"
                            style={{
                              marginLeft: "1rem",
                              marginRight: "1.5rem",
                            }}
                            onClick={() => {
                            }}
                          >
                            Logout
                          </Button>
                        </>
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                  {/* {userInfo.userInfo.assignedProjects.length > 1 ? (
                    <>
                      <Select
                        style={{ marginRight: "2rem" }}
                        placeholder="Please Select Project which you want to Access"
                        onSelect={(e) => {
                          const selectedProjectName = e.split("_")[0];
                          setProjectMessage(true);
                          getReveloArtifacts(selectedProjectName);
                        }}
                      >
                        {userInfo.userInfo.assignedProjects.map((el: any) => {
                          return (
                            <>
                              <Select.Option value={el.name}>
                                {el.label}
                              </Select.Option>
                            </>
                          );
                        })}
                      </Select>
                    </>
                  ) : (
                    null
                  )} */}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
export default IndividualReportMain;
