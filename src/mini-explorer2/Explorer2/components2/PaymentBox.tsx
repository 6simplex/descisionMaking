import { Typography } from "antd";
import React from "react";
import ReveloPie from "../../../Dashboard/Dashboard/Widgets/ReveloPie/ReveloPie";
type Props = {
  bill: any;
};
const PaymentBox = (props: Props) => {
  return (
    <>
      {props.bill.map((bill: any) => {
        console.log(bill);
        return (
          <>
            <div
              style={{
                height: "100%",
                display: "grid",
                gridTemplateColumns: "60% 40%",
                marginBottom: "2px",
                gap: "2px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {bill.numshiftDamaged +
                  bill.numshiftcleaned +
                  bill.numshiftskipped ===
                0 ? (
                  <>
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        placeContent: "center",
                        placeItems: "center",
                        marginBottom: "2px",
                      }}
                    >
                      <Typography
                        style={{ fontSize: "1rem", fontWeight: "bold" }}
                      >
                        {" "}
                        No data to display
                      </Typography>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        paddingLeft: "10px",
                        display: "flex",
                        flexDirection: "column",
                        placeContent: "center",
                        placeItems: "center",
                      }}
                    >
                      {" "}
                      <Typography style={{}}>Unit Wise Distribution</Typography>
                    </div>
                    <div style={{ height: "inherit" }}>
                      <ReveloPie
                        arcLinkLabels={true}
                        data={[
                          {
                            Damaged: bill.numshiftDamaged,
                            Cleaned: bill.numshiftcleaned,
                            Skipped: bill.numshiftskipped,
                            Blocked: bill.numshiftBlocked,
                            Locked: bill.numshiftLocked,
                            Stolen: bill.numshiftStolen,
                          },
                        ]}
                        bottom={45}
                        valueFieldName={[
                          "Damaged",
                          "Cleaned",
                          "Skipped",
                          "Blocked",
                          "Locked",
                          "Stolen",
                        ]}
                      />
                    </div>
                  </>
                )}
              </div>
              <div
                style={{
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    placeContent: "center",
                    placeItems: "center",
                    height: "inherit",
                    borderLeft: "1px solid #d9d9d9",
                  }}
                >
                  <Typography style={{ fontSize: "100%" }}>
                    Vendor Name
                  </Typography>
                  <Typography style={{ fontSize: "1rem", fontWeight: "bold" }}>
                    {bill.vendorname}
                  </Typography>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    placeContent: "center",
                    placeItems: "center",
                    height: "inherit",
                    borderLeft: "1px solid #d9d9d9",
                    borderTop: "1px solid #d9d9d9",
                  }}
                >
                  <Typography style={{}}>Amount</Typography>
                  <Typography style={{ fontSize: "1rem", fontWeight: "bold" }}>
                    ₹{bill.amount.toFixed(2)}
                  </Typography>
                </div>
              </div>
            </div>
          </>
        );
      })}
    </>
  );
};

export default PaymentBox;
