import { Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

type Props = {
  data: any;

}

const ReveloTable = (props: Props) => {
  console.log(props.data)
  interface DataType {
    vendorname: string;
    amount: number | string;
    numshiftskipped: number | string;
    numshift: number | string;
  }
  const columns: ColumnsType<DataType> = [
    {
      title: "Vendor Name",
      dataIndex: "vendorname",
      key: "vendorname",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",

    },
    {
      title: "Total Shifts",
      dataIndex: "numshift",
      key: "numshift",

    },
    {
      title: "Shifts Skipped",
      dataIndex: "numshiftskipped",
      key: "numshiftskipped",

    },

  ];


  return (
    <div>
      <Table dataSource={props.data} columns={columns} pagination={false} />
    </div>
  );
};

export default ReveloTable;
