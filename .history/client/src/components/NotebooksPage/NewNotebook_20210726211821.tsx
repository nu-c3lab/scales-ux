import { Col, Container, Row } from "react-bootstrap";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridValueGetterParams,
} from "@material-ui/data-grid";
//@ts-nocheck
import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";

import Filters from "./Filters";
import { useNotebookContext } from "./NotebookContext";

const NewNotebook: FunctionComponent = () => {
  const { filterInputs, setFilterInputs, filters, columns } =
    useNotebookContext();
  const [results, setResults] = useState([]);
  const fetchResults = async () => {
    // setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/results/?page=0&batchSize=10&sortBy=dateFiled&sortDirection=desc&`
      );
      const data = await response.json();

      console.log(data);
    } catch (error) {
      // TODO: Impelment Error handling
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  console.log(
    columns.map((column) => ({
      field: column?.key,
      headerName: column?.nicename,
      width: column?.width,
      sortable: column?.sortable,
    }))
  );

  return (
    <Container className="bg-light">
      <Filters />
      <Row className="p-3">
        <Col>
          Results
          <DataGrid
            rows={results}
            // @ts-ignore
            columns={[
              {
                field: "caseName",
                headerName: "Case Name",
                width: "34%",
                sortable: true,
              },
              {
                field: "judgeName",
                headerName: "Judge Name",
                width: "18%",
                sortable: true,
              },
              {
                field: "dateFiled",
                headerName: "Date Filed",
                width: "12%",
                sortable: true,
              },
              {
                field: "natureOfSuit",
                headerName: "Nature of Suit",
                width: "16%",
                sortable: true,
              },
              {
                field: "district",
                headerName: "District",
                width: "10%",
                sortable: true,
              },
              {
                field: "circuit",
                headerName: "Circuit",
                width: "10%",
                sortable: true,
              },
            ]}
            pageSize={5}
            checkboxSelection={false}
            className="bg-white"
          />
        </Col>
      </Row>
      <Row className="bg-white p-3">
        <Col>Analysis</Col>
      </Row>
    </Container>
  );
};

export default NewNotebook;