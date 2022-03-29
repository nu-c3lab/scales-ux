import React, { FunctionComponent, useState, useEffect } from "react";
// import { useAuthHeader, useAuthUser } from "react-auth-kit";
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
  GridCellParams,
} from "@material-ui/data-grid";
import { Tooltip, Typography } from "@material-ui/core";
import PageLayout from "../../PageLayout";
import NotAuthorized from "../../NotAuthorized";
import UserFieldToggle from "./UserFieldToggle";
import { Row } from "react-bootstrap";
import { useAuthHeader, userSelector } from "store/auth";
import { useSelector } from "react-redux";
import config from "config";

const columns: GridColDef[] = [
  // { field: "id", headerName: "ID", width: 100 },
  {
    field: "fullName",
    headerName: "Full name",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 160,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.getValue(params.id, "firstName") || ""} ${params.getValue(params.id, "lastName") || ""
      }`,
  },
  // { field: "createdAt", headerName: "Created At", width: 200 },
  // { field: "updatedAt", headerName: "Updated At", width: 200 },
  { field: "email", headerName: "Email", width: 210 },
  { field: "role", headerName: "Role", width: 140 },
  {
    field: "usage",
    headerName: "Usage",
    width: 300,
    renderCell: (params: GridCellParams) => (
      <Tooltip title={params.row.usage}>
        <Typography noWrap variant="body2">
          {params.row.usage}
        </Typography>
      </Tooltip>
    ),
  },
  {
    field: "approved",
    headerName: "Approved",
    width: 140,
    renderCell: (params: GridCellParams) => (
      <UserFieldToggle
        userId={params.row.id}
        fieldName="approved"
        value={params.row.approved}
      />
    ),
  },
  {
    field: "blocked",
    headerName: "Blocked",
    width: 140,
    renderCell: (params: GridCellParams) => (
      <UserFieldToggle
        userId={params.row.id}
        fieldName="blocked"
        value={params.row.blocked}
      />
    ),
  },
];

const AdminUsersPages: FunctionComponent = () => {
  const [rows, setRows] = useState([]);
  const authorizationHeader = useAuthHeader();
  const { role } = useSelector(userSelector);
  const isAdmin = role === 'admin';

  useEffect(() => {
    fetch(`${config.SERVER_API_URL}/users`, {
      headers: {
        ...authorizationHeader,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setRows(response.data.users);
      });
  }, []);

  return (
    <PageLayout>
      {!isAdmin ? (
        <NotAuthorized />
      ) : (
        <Row style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            checkboxSelection={false}
            className="bg-white p-0"
          />
        </Row>
      )}
    </PageLayout>
  );
};

export default AdminUsersPages;
