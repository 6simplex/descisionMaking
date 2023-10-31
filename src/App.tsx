/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./Redux/store/store";
import {
  updateAsEntity,
  updateBillStatus,
  updateDataSource,
  updateDomains,
  updateJurisdictions,
  updateObcmSnapShot,
  updateObcmSnapShotDetails,
  updateProject,
  updateProjectConceptModel,
  updateSpatialVectorSource,
  updateUserInfo,
  updateUserList,
} from "./Redux/main-slice/main-slice";
import {
  Datasource,
  Domains,
  Jurisdictions,
  ObcmSnapShotDetails,
  Project,
} from "./revelo-Interface/common";
import { Progress, Typography, Button, Select } from "antd";
import { fetchData } from "./utils/cutsomhooks";
import { CyUserGraph, getAllDescendants } from "./utils/cytoscape";
import { JurisdictionObject } from "./utils/jurisdiction";
import { Navigate, useNavigate } from "react-router-dom";
import { ProjectConceptModel } from "./revelo-Interface/conceptmodel"

function App() {
  const serverUrl = window.__rDashboard__.serverUrl;
  const navigation = useNavigate();
  const { userInfo, project } = useAppSelector((state) => state.reveloUserInfo);
  const [loadComplete, setLoadComplete] = useState(true);
  const [errorState, setErrorState] = useState(true);
  const [errorMessage, setErrorMessage] = useState(
    "Validating your Configuration..."
  );
  const [percentage, setPercentage] = useState(0);
  const [projectMessage, setProjectMessage] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    postLoginLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (localStorage.getItem("token")) {
    axios.defaults.headers.common.Authorization = `Bearer ${localStorage.getItem(
      "token"
    )}`;
  }

  // axios.defaults.headers.common["Authorization"] = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJyWWhVN1dKQ1pFN2JTNHJxSmFEUXNXVG5FSXlGdEpPbHAydVVRaTBFbUtRIn0.eyJleHAiOjE3MDA5MTUwNzgsImlhdCI6MTY5ODMyMzA3OCwianRpIjoiNjkyYjgwM2EtOWQ4ZS00YzYyLWEwNGMtNWUzNTRhYzY1MjFkIiwiaXNzIjoiaHR0cDovLzEwMy4yNDguNjAuMTg6ODA5MC9hdXRoL3JlYWxtcy9yZXZlbG8zNSIsImF1ZCI6WyJoYXdrZXllIiwicmV2ZWxvIiwiYWNjb3VudCJdLCJzdWIiOiI2ZjY5NmE5NS0zOWIzLTQwYTItOGQ0ZC1lMTY1Njk1MDhiNjciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJyZXZlbG9hZG1pbjM1Iiwic2Vzc2lvbl9zdGF0ZSI6IjZlMTU5N2ZjLTg0YTMtNDVhZC04YTkyLWI2NWVlYzU5Yjc5ZSIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovLzEwMy4yNDguNjAuMTg6NzA1MCJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1tdGRjMzUiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIiwiY291bnRyeWNvb3JkaW5hdG9yIiwiY3VzdG9tZXJhZG1pbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7Imhhd2tleWUiOnsicm9sZXMiOlsiY291bnRyeWNvb3JkaW5hdG9yIiwiY3VzdG9tZXJhZG1pbiJdfSwicmV2ZWxvYWRtaW4zNSI6eyJyb2xlcyI6WyJjdXN0b21lcmFkbWluIl19LCJyZXZlbG8iOnsicm9sZXMiOlsiY3VzdG9tZXJhZG1pbiJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJBZG1pbiBJTkMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhZG1pbl9pbmMiLCJnaXZlbl9uYW1lIjoiQWRtaW4iLCJmYW1pbHlfbmFtZSI6IklOQyIsImVtYWlsIjoiYWRtaW5faW5jQGdtYWlsLmNvbSJ9.Agq8ZlE5ZHCbJsUF9cTqMkmD7RNZolc2Zu9p-1-IGmDEjfHKG1LrJp7psX7r0N-bhmrlKDKgcJZIb3hcY-gQm4PAZLFNuE2OlZrMYjUL-SopkkEEmtSjE2kgRKDjNWBXPG4ukzjsGqBG6mcQHDU7-QXzgqRZkCeoQY1Km5V6swdckfWNSgvRao-fYECLrujt5A3f9itRm__4vgfV9tV0MYBCxhc2dm2Wutkv7VqeScYUaazVPbeIQmC5rHuEBQr-UU2uLZxNC9KRiRM314xUQsGje_rnwEKvFTtZDST2nbiD9HAKe8cQhul41_saLGanCON3YQZbNCfomrrlQN0mgw"
  const postLoginLoading = () => {
    setPercentage(25);
    const principalUrl = `${serverUrl}/access/principal/web?clientName=webviewer&callback=cbk`;
    const iFoo = (url: string) => {
      const iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.name = "frame";
      iframe.style.height = "0px";
      iframe.style.width = "0px";
      iframe.style.border = "none";
      iframe.style.position = "absolute";
      iframe.style.bottom = "0px";
      document.body.appendChild(iframe);
      return new Promise((resolve) => {
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
        const { userInfo, status } = data;

        if (status === "failure" || !userInfo) {
          setLoadComplete(false);
          setErrorMessage("Project not assigned. Please assign project");
        }
        if (userInfo.role === "orgAdmin") {
          dispatch(updateUserInfo({ ...data }));
          navigation("/customeradmin");
        } else {
          dispatch(updateUserInfo({ ...data }));
        }
        setTimeout(() => {
          if (userInfo.role === "orgAdmin") {
            dispatch(updateUserInfo({ ...data }));
            navigation("/customeradmin");
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
    const userJurisdictions = userInfo.userInfo.jurisdictions;

    if (userJurisdictions.length === 0) {
      setErrorMessage(
        "You do not have any jurisdictions set. Please contact your Administrator and get a jurisdiction assigned."
      );
      return error;
    }
    //At 3.0, we only support single jurisdiction. So take the first one.
    const jurisdiction = userJurisdictions[0];
    const jurisdictionName = jurisdiction.name;
    const jurisdictionType = jurisdiction.type;
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
    const assignedProjects = userInfo.userInfo.assignedProjects;
    if (assignedProjects.length === 0) {
      setErrorMessage(
        "You do not have any Project assigned. Please contact your Administrator and get a Project assigned."
      );
      return error;
    }
    //get the analytics datasource
    // eslint-disable-next-line no-prototype-builtins
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
      const obcmSnapShotDetails = await fetchData(
        `${serverUrl}/conceptmodels/w9obcm?details=true`
      );
      if (
        obcmSnapShotDetails.error &&
        obcmSnapShotDetails.error.status &&
        obcmSnapShotDetails.error.data
      ) {
        const errorMessage =
          obcmSnapShotDetails.error.status +
          ": " +
          obcmSnapShotDetails.error.data.message;
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
      const project = await fetchData(
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
      const assignedCM = project.conceptModelName;
      dispatch(updateProject({ ...project }));
      setPercentage(25);
      const projectDataSource = await fetchData(
        `${serverUrl}/datasources/${project.datasourceName}`
      );
      if (projectDataSource.error) {
        return setErrorMessage("Error While Getting DataSource");
      }
      if (
        projectDataSource.assignedCM === "" ||
        !projectDataSource.assignedCM
      ) {
        return setErrorMessage("DataSource is not assigned to concept model!");
      }
      dispatch(updateDataSource({ ...projectDataSource }));
      setPercentage(40);
      const projectCM = await fetchData(
        `${serverUrl}/conceptmodels/${assignedCM}?details=true`
      );
      if (
        !projectCM ||
        // eslint-disable-next-line no-prototype-builtins
        !projectCM.hasOwnProperty("entities") ||
        // eslint-disable-next-line no-prototype-builtins
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

      const asEntity = await fetchData(
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
      const projectCMDomains = await fetchData(
        `${serverUrl}/conceptmodels/${assignedCM}/domains`
      );
      if (projectCMDomains.error) {
        return setErrorMessage(projectCMDomains.error.data.message);
      }
      projectCMDomains.forEach((element: Domains) => {
        dispatch(updateDomains({ ...element }));
      });
      const usersGraphJSON = await fetchData(
        `${serverUrl}/${userInfo.orgName}/usersgraph`
      );
      if (!usersGraphJSON) {
        return setErrorMessage(
          "Users graph is not available from Server. Please contact your Admin."
        );
      }
      const userGraph = CyUserGraph(usersGraphJSON);
      const userNode = userGraph.nodes(
        "[id='" + userInfo.userInfo.userName + "']"
      );
      const userData = userNode.data();
      const userNodeMap = new Map();
      getAllDescendants(userNode, userGraph, userNodeMap, "userName");
      const childrenUsersArray = [userData.userName];
      const userNodesIterator = userNodeMap.keys();
      let userNodeEntry = userNodesIterator.next();
      while (userNodeEntry.done === false) {
        const userName = userNodeEntry.value;
        childrenUsersArray.push(userName);
        userNodeEntry = userNodesIterator.next();
      }
      dispatch(updateUserList(childrenUsersArray));
      const jurisdiction = await fetchData(
        `${serverUrl}/users/${userInfo.userInfo.userName}/profile/jurisdictions`
      );
      jurisdiction.forEach((element: Jurisdictions) => {
        dispatch(updateJurisdictions({ ...element }));
      });
      const ocbmSnapShot = await fetchData(
        `${serverUrl}/conceptmodels/w9obcm/snapshot`
      );
      dispatch(updateObcmSnapShot({ ...ocbmSnapShot }));

      const billDueDateArray: any[] = [];
      let amount: number = 0;
      userInfo.userInfo.customerInfo.bills.forEach((element: any) => {
        if (!(element.status.toLocaleUpperCase() === "PAID"))
          billDueDateArray.push({
            dueDate: element.dueDate,
            gracePeriod: element.gracePeriod,
          });
        amount = amount + element.amountBalance;
      });

      billDueDateArray.sort((a, b) => {
        const dateA: any = new Date(a.dueDate);
        const dateB: any = new Date(b.dueDate);

        return dateA - dateB;
      });
      if (billDueDateArray.length > 0) {
        const currentDate = new Date();
        const providedDate: Date = new Date(billDueDateArray[0].dueDate);
        const daysToAdd = billDueDateArray[0].gracePeriod;
        const futureDate = new Date(billDueDateArray[0].dueDate);
        futureDate.setDate(providedDate.getDate() + daysToAdd);
        const futureDateString = futureDate.toISOString().split("T")[0];
        const graceDate = new Date(futureDateString);
        if (providedDate < currentDate) {
          console.log("here");
        }
        if (graceDate < currentDate) {
          const BillJson = {
            date: billDueDateArray[0].dueDate,
            status: true,
            message: `An outstanding bill${billDueDateArray.length > 1 ? "s" : ""
              } of ₹ ${amount.toFixed(2)}${providedDate < currentDate ? " was due on" : " is due on"
              } ${billDueDateArray[0].dueDate
              }. Please make the payment to restore app usage.`,
            gracePeriod: false,
          };
          dispatch(updateBillStatus(BillJson));
        } else if (graceDate > currentDate) {
          const BillJson = {
            date: billDueDateArray[0].dueDate,
            status: false,
            message: `An outstanding bill${billDueDateArray.length > 1 ? "s" : ""
              } of ₹ ${amount.toFixed(2)}${providedDate < currentDate ? " was due on" : " is due on"
              } ${billDueDateArray[0].dueDate
              }. Please make the payment within the next ${billDueDateArray[0].gracePeriod
              } day${billDueDateArray[0].gracePeriod > 1 ? "s" : ""}.`,
            gracePeriod: true,
          };
          dispatch(updateBillStatus(BillJson));
        }
      }
      if (projectCM.entities.length > 0) {
        createAssignEntityLayer(
          projectCM,
          project,
          projectDataSource,
          asEntity,
          obcmSnapShotDetails
        );
      }
      setPercentage(100);
      return setErrorState(false);
    }
  }

  const createAssignEntityLayer = (
    projectConceptModel: ProjectConceptModel,
    project: Project,
    dataSource: Datasource,
    asEntity: any,
    obcmSnapShotDetails: ObcmSnapShotDetails
  ) => {
    const payload: any = [];
    projectConceptModel.entities.forEach(async (entity, index) => {
      if (
        entity.name !== `trips_${project.name}` &&
        entity.name !== `tripstops_${project.name}` &&
        entity.name !== `tripmetrics_${project.name}`
      ) {
        if (entity.type === "spatial") {
          let asEntityStyle: any = {};
          Object.keys(asEntity).forEach((key) => {
            if (`${key}_${project.name}` === entity.name) {
              asEntityStyle = asEntity[key];
            }
          });
          const zindex = obcmSnapShotDetails.entities.length + index + 1;
          const data = {
            url: `${projectConceptModel.gisServerUrl}/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=${projectConceptModel.datasourceName}ws:${entity.name}&outputFormat=application/json&srsname=EPSG:${dataSource.properties.wkid}`,
            zIndex: zindex,
            featureProjection: `EPSG:${dataSource.properties.wkid}`,
            properties: entity,
            asEntityStyle: asEntityStyle,
          };
          payload.push(data);
        }
      }
    });
    dispatch(updateSpatialVectorSource(payload));
  };
  useEffect(() => {
    if (userInfo.status === "success") {
      if (userInfo.userInfo.role === "orgAdmin") {
        return;
      } else {
        if (userInfo.userInfo.assignedProjects.length === 1) {
          const projectName =
            userInfo.userInfo.assignedProjects[0].name.split("_")[0];
          getReveloArtifacts(projectName);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);
  // const doLogout = () => {
  //   const logoutUrl = window.__hawkeye__.hawkeyeAdminLogoutUrl;
  //   axios.post(logoutUrl, "").finally(() => {
  //     axios.post(process.env.PUBLIC_URL + "/logout").finally(() => {
  //       window.location.href = process.env.PUBLIC_URL;
  //       window.location.reload()
  //     });
  //   });
  // };
  return (
    <>
      {!errorState ? (
        <>
          <Navigate to={`/project/${project.name}`} replace={true} />
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
                        {userInfo.userInfo.assignedProjects.length > 1
                          ? projectMessage
                            ? errorMessage
                            : "Please Select Project You Want to access"
                          : errorMessage}
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
                            onClick={() => { }}
                          >
                            Logout
                          </Button>
                        </>
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                  {userInfo.userInfo.assignedProjects.length > 1 ? (
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
                    <></>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
export default App;
