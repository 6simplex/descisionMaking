import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useAppSelector } from '../../../Redux/store/store'
import { Modal, Typography, message } from 'antd'

type Props = {
    shiftid: string
}

export const AttachmentBox = (props: Props) => {
    console.log(props.shiftid)
    const [thumbnail, setThumbnail] = useState([])
    const [loading, setLoading] = useState(true)
    const [loading1, setLoading1] = useState(true)

    const [modal2Open, setModal2Open] = useState(false);
    const [downloadedImage, setDownloadedImage] = useState<any>("")
    const { projectConceptModel } = useAppSelector(state => state.reveloUserInfo)
    const getThumbnail = async () => {
        setLoading(true)
        let payload: any = []
        await axios.get(`${window.__rDashboard__.serverUrl}/conceptmodels/${projectConceptModel.name}/entities/shift/${props.shiftid}/attachments/info?includeThumbnail=false`).then((res) => {
            if (res.status === 200) {
                res.data.forEach((thumb: any) => {
                    payload.push(thumb.properties)
                })
                setLoading(false)
                setThumbnail(payload)
            }
        }).catch((err) => {
            setLoading(false)
            message.error("failed to get Images!")
        })
    }
    const downloadAttachment = async (name: string) => {
        setLoading1(true)
        await axios.get(`${window.__rDashboard__.serverUrl}/conceptmodels/${projectConceptModel.name}/entities/shift/${props.shiftid}/attachments/${name}?getThumbnail=false`, { responseType: 'arraybuffer', }).then(async (response) => {
            const arrayBufferView = new Uint8Array(response.data);
            const blob = new Blob([arrayBufferView], { type: response.headers['content-type'] });
            const base64String = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
            setDownloadedImage(base64String)
            setLoading1(false)
        }).catch((err) => {
            console.log(err)
            setLoading1(false)

        })
    }
    useEffect(() => {
        if (props.shiftid) {
            getThumbnail()
        }
    }, [props.shiftid])

    return (
        <>
            <div style={{ display: "flex", flexDirection: "column", placeContent: "center", placeItems: "center", width: "100%", padding: "20px", height: "inherit" }}>
                {thumbnail.length ? <>
                    {loading ? <></> : <>
                        {thumbnail.map((thumb: any) => {
                            return (<>
                                <img alt={props.shiftid} src={`data:image/png;base64,${thumb.thumbnailastext}`} width={"200px"} height={"200px"} onClick={() => {
                                    downloadAttachment(thumb.name)
                                    setModal2Open(true)
                                }} />
                            </>)
                        })}
                    </>}

                </> : <>

                </>}
                <Modal
                    title="Preview Image"
                    centered
                    confirmLoading={loading1}
                    open={modal2Open}
                    onOk={() => setModal2Open(false)}
                    onCancel={() => setModal2Open(false)}
                >
                    <div style={{ display: "flex", flexDirection: "row", placeContent: "center", placeItems: "center" }}>
                        <img alt={props.shiftid} src={downloadedImage} width={400} height={400}
                        /></div>
                </Modal>
            </div>
        </>
    )
}
