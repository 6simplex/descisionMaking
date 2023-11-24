import { Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

type Props = {
  data: any;

}

const ReveloTable = (props: Props) => {

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
      render: () => {
        return <>Brics</>;
      }
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (_,record) => {
        return <>₹{record.amount}.00</>;
      }
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
