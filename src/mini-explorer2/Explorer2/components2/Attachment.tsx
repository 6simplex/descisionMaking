import { Segmented, message, Image, Typography } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../Redux/store/store";
import Carousel from "nuka-carousel";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
type Props = {
  shifts: any[];
};
const Attachment = (props: Props) => {
  console.log(props.shifts);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [downloadImages, setDownloadedImages] = useState([]);
  const [loadComplete, setLoadComplete] = useState(true);
  const [properties, setProperties] = useState([]);
  const [value, setValue] = useState<string | number>("Morning");
  const { projectConceptModel } = useAppSelector(
    (state) => state.reveloUserInfo
  );
  const getAttachmentMetaData = async (id: string) => {
    setLoadComplete(true);
    await axios
      .get(
        `${window.__rDashboard__.serverUrl}/conceptmodels/${projectConceptModel.name}/entities/shift/${id}/attachments/info?includeThumbnail=false`
      )
      .then((res) => {
        if (res.status === 200) {
          let payload: any = [];
          res.data.forEach((thumb: any) => {
            payload.push(thumb);
          });
          setProperties(payload);
        }
        setLoadComplete(false);
      })
      .catch((err) => {
        message.error("failed to get Images!");
        setLoadComplete(false);
      });
  };
  useEffect(() => {
    setValue("Morning");
    if (props.shifts.length > 0) {
      getAttachmentMetaData(
        props.shifts.filter((shift: any) => shift.shiftName === "Morning")[0]
          .shiftId
      );
    }
  }, [props.shifts]);
  const downloadImage = () => {
    let payload: any = [];
    properties.forEach(async (properties: any) => {
      await axios
        .get(
          `${window.__rDashboard__.serverUrl}/conceptmodels/${projectConceptModel.name}/entities/shift/${properties.properties.w9id}/attachments/${properties.properties.name}?getThumbnail=false`,
          { responseType: "arraybuffer" }
        )
        .then(async (response) => {
          const arrayBufferView = new Uint8Array(response.data);
          const blob = new Blob([arrayBufferView], {
            type: response.headers["content-type"],
          });
          const base64String = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          payload.push(base64String);
        })
        .catch((err) => {
          console.log(err);
        });
      setOpen(true);
      setDownloadedImages(payload);
      console.log(payload);
    });
  };
  return (
    <div>
      <Segmented
        options={["Morning", "Afternoon", "Evening"]}
        value={value}
        onChange={(e) => {
          setValue(e);
          if (
            props.shifts.filter((shift: any) => shift.shiftName === e).length >
            0
          ) {
            getAttachmentMetaData(
              props.shifts.filter((shift: any) => shift.shiftName === e)[0]
                .shiftId
            );
          } else {
            setProperties([]);
          }
        }}
      />
      {loadComplete ? (
        <></>
      ) : (
        <>
          {properties.length > 0 ? (
            <>
              <Carousel
                wrapAround
                defaultControlsConfig={{
                  nextButtonText: (
                    <>
                      <ArrowRightOutlined />
                    </>
                  ),
                  prevButtonText: (
                    <>
                      <ArrowLeftOutlined />
                    </>
                  ),
                  pagingDotsStyle: { display: "none" },
                }}
              >
                {properties.map((properties: any) => {
                  return (
                    <>
                      <Image
                        onClick={() => {
                          downloadImage();
                        }}
                        preview={false}
                        style={{ objectFit: "contain" }}
                        src={`data:image/png;base64,${properties.properties.thumbnailastext}`}
                        alt={properties.properties.name}
                        width={"100%"}
                        height={"200px"}
                      />
                      <div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            placeContent: "center",
                            placeItems: "center",
                          }}
                        >
                          <Typography>Name:</Typography>
                          <Typography style={{ fontWeight: "bold" }}>
                            {properties.properties.name}
                          </Typography>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            placeContent: "center",
                            placeItems: "center",
                          }}
                        >
                          <Typography>User Name:</Typography>
                          <Typography style={{ fontWeight: "bold" }}>
                            {properties.properties.username}
                          </Typography>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            placeContent: "center",
                            placeItems: "center",
                          }}
                        >
                          <Typography>Date & Time</Typography>
                          <Typography style={{ fontWeight: "bold" }}>
                            {properties.properties.savedate}
                          </Typography>
                        </div>
                      </div>
                    </>
                  );
                })}
              </Carousel>
            </>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  placeContent: "center",
                  placeItems: "center",
                  height: "100px",
                }}
              >
                <Typography style={{ fontWeight: "bold" }}>
                  No Images Found
                </Typography>
              </div>
            </>
          )}
        </>
      )}
      {open && (
        <Lightbox
          mainSrc={downloadImages[photoIndex]}
          nextSrc={downloadImages[(photoIndex + 1) % downloadImages.length]}
          prevSrc={
            downloadImages[
              (photoIndex + downloadImages.length - 1) % downloadImages.length
            ]
          }
          onCloseRequest={() => setOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex(
              (photoIndex + downloadImages.length - 1) % downloadImages.length
            )
          }
          onMoveNextRequest={() =>
            setPhotoIndex((photoIndex + 1) % downloadImages.length)
          }
        />
      )}
    </div>
  );
};

export default Attachment;
