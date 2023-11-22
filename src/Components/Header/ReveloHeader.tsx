/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Button, Dropdown, Modal, Space, Typography, Badge, notification } from "antd";
import { AlertOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import "./ReveloHeader.css";
import axios from "axios";
import About from "./About";
import { useAppSelector } from "../../Redux/store/store";
type Props = {
  orgName: string;
  projectName: string;
  projectNameColor: string;
  userName: string;
  iconColor: string
};
const ReveloHeader = (props: Props) => {
  const serverUrl = "http://103.248.60.18:7050/reveloadmin35/revelo";

  const [imageData, setImageData] = useState();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const { userInfo, billStatus } = useAppSelector((state) => state.reveloUserInfo);
  const [api, contextHolder] = notification.useNotification({
    top: 60,

  });

  const openNotification = () => {
    api.open({
      message: 'Bill Status',
      description:
        <Typography style={{ fontFamily: "Open Sans", fontWeight: "600" }}>{billStatus.message}</Typography>,
      duration: 0,
      type: "warning",
    });
  };
  const showModal = () => {
    setIsModalOpen(true);
  };
  const showModal1 = () => {
    setIsModalOpen1(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const handleCancel1 = () => {
    setIsModalOpen1(false);
  };
  const handlePointerEnter = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.color = "#3843df";
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.color = "";
  };
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Typography
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          style={{ textAlign: "center", fontWeight: "500" }}
        >
          {props.userName.toLocaleUpperCase()}
        </Typography>
      ),
    },
    {
      key: "2",
      label: (
        <Typography
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onClick={() => {
            showModal();
          }}
          style={{ textAlign: "center", fontWeight: "500" }}
        >
          About
        </Typography>
      ),
    },
    {
      key: "3",
      label: (
        <Typography
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          style={{ textAlign: "center", fontWeight: "500" }}
          onClick={() => {
            showModal1();
          }}
        >
          Logout
        </Typography>
      ),
    },
  ];

  const getHeaderLogo = async () => {

    setLoading(true);

    await axios
      .get(`${serverUrl}/customers/${userInfo.userInfo.customerInfo.name}/logoFile`, {
        responseType: "arraybuffer",
      })
      .then((res) => {
        const base64Image: any = btoa(
          new Uint8Array(res.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        setImageData(base64Image);
        setLoading(false);
      })
      .catch(async (err) => {
        if (err) {
          await axios
            .get(`${serverUrl}/${props.orgName}/logoFile`, {
              responseType: "arraybuffer",
            })
            .then((res) => {
              const base64Image: any = btoa(
                new Uint8Array(res.data).reduce(
                  (data, byte) => data + String.fromCharCode(byte),
                  ""
                )
              );
              setImageData(base64Image);
              setLoading(false);
            })
            .catch((err) => {
              console.log(err.response.data.message);
              setLoading(false);
            });
        }
      });
  };

  useEffect(() => {
    getHeaderLogo();
    if (billStatus.status || billStatus.gracePeriod) {
      openNotification()

    }

    return () => {
      getHeaderLogo();
      if (billStatus.status || billStatus.gracePeriod) {
        openNotification()

      }
    };
  }, []);

  const doLogout = () => {
    const logoutUrl = window.__rDashboard__.logoutUrl;
    axios.post(logoutUrl, "").finally(() => {
      axios.post(process.env.PUBLIC_URL + "/logout").finally(() => {
        const newLocation:any = process.env.PUBLIC_URL;
        window.location.href = newLocation;
        window.location.reload()
      });
    });
  };

  return (
    <>
      {contextHolder}
      <div className="main-header-box">
        <div className="left-side-header">
          {loading ? (
            <>Loading Header</>
          ) : (
            <>
              <img
                src={`data:image/png;base64,${imageData}`}
                alt="alt"
                className="logo"
              />
            </>
          )}
          <h2 style={{ color: props.projectNameColor, fontFamily: "Lobster Two", textTransform: 'capitalize' }}>{props.projectName}</h2>
        </div>
        <div className="right-side-header">
          <Typography
            style={{ color: props.iconColor, fontSize: "1rem", fontFamily: "Open Sans", marginRight: "2rem" }}
          >
            {billStatus.gracePeriod ? billStatus.message : ""}
          </Typography>

          <Badge count={billStatus.status === true || billStatus.gracePeriod ? `1` : ""} offset={[-5, -8]}><AlertOutlined
            onClick={openNotification}
            style={{ fontSize: "1.5rem", color: props.iconColor, marginRight: "10px" }} /></Badge>
          <Dropdown
            overlayStyle={{ width: "8rem" }}
            menu={{ items }}
            trigger={["click"]}
            placement="bottomLeft"
          >
            <UserOutlined
              style={{ fontSize: "1.5rem", color: props.iconColor }}
            />
          </Dropdown>
        </div>
      </div>
      <Modal
        centered
        title={
          <Typography style={{ fontWeight: "600", fontSize: "1.4rem" }}>
            About
          </Typography>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <About />
      </Modal>
      <Modal
       centered
        title={
          <Typography
            style={{ fontWeight: "600", fontSize: "1.4rem",  }}
          >
            Logout
          </Typography>
        }
        open={isModalOpen1}
        onCancel={handleCancel1}
        footer={null}
      >
        <Typography style={{ margin: "10px" }}>
          Are you sure you wish to logout?
        </Typography>
        <Space
          style={{ margin: "10px" }}
          onClick={() => {
            doLogout()
          }}
        >
          <Button type="primary">Logout</Button>
          <Button onClick={handleCancel1}>Cancel</Button>
        </Space>
      </Modal>
    </>
  );
};

export default ReveloHeader;