import React, { FunctionComponent, useState, useEffect, useContext } from "react";
import {
  Accordion,
  Container,
  Row,
  Col,
  Button,
  useAccordionButton,
  Form,
  AccordionContext,
  Card
} from "react-bootstrap";
import { DataGrid } from "@material-ui/data-grid";
import Filters from "../Filters";
import Loader from "../Loader";

import Dataset from "../Dataset";
import ContentLoader from 'react-content-loader'
import type { IPanel } from "../../store/panels";
import { usePanel } from "../../store/panels";
import { useRing } from "../../store/rings";
import Analysis from "../Analysis";
import "./Panel.scss"

type ResultsTogglerProps = {
  children: React.ReactNode;
  eventKey: string;
  callback?: (eventKey: string) => void;
}

const ResultsToggler: FunctionComponent<ResultsTogglerProps> = ({ children, eventKey, callback }) => {
  const decoratedOnClick = useAccordionButton(eventKey, () => callback && callback(eventKey));

  return (
    <Button variant="link" size="sm" onClick={decoratedOnClick}>
      {children}
    </Button>
  );
};

type PanelProps = {
  panelId: string;
}

type AccordionToggleButtonProps = {
  eventKey: string;
  callback?: (eventKey: string) => void;
}

const AccordionToggleButton = ({ eventKey, callback }: AccordionToggleButtonProps) => {
  const { activeEventKey } = useContext(AccordionContext);
  const decoratedOnClick = useAccordionButton(
    eventKey,
    () => callback && callback(eventKey),
  );
  const isCurrentEventKey = activeEventKey === eventKey;

  return (
    <Button
      variant="outline-primary"
      size="sm"
      onClick={decoratedOnClick}
    >
      {
        isCurrentEventKey ? "Close" : "Open"
      }
    </Button>
  );
}


const Panel: FunctionComponent<PanelProps> = ({ panelId }) => {
  const { filters, panel, deletePanel, updatePanel, results, loadingPanelResults, getPanelResults, collapsed, setPanelResultsCollapsed, resultsCollapsed, setPanelCollapsed } = usePanel(panelId);
  const [panelDescription, setPanelDescription] = useState(panel?.description || null);
  const { ring, info, getRingInfo, loadingRingInfo } = useRing(panel?.ringId);
  const [statements, setStatements] = useState([]);

  useEffect(() => {
    if (!ring || ring.info) return;
    getRingInfo(ring.version);
  }, [ring]);

  useEffect(() => {
    if (!info || collapsed) return;
    getPanelResults();
  }, [collapsed]);

  if (!panel?.ringId) return <Dataset panelId={panel.id} />;

  const rows = results?.results?.map((result, id) => ({
    ...result,
    id: `${results.page}-${id}`,
  })) || [];

  const columns = info?.columns?.map((column) => ({
    field: column.key,
    headerName: column.nicename,
    width: 200, //column?.width,
    sortable: column.sortable,
  })) || [];

  return (
    <Accordion defaultActiveKey={collapsed === true ? null : panel.id} className="mb-4">
      <Card>
        <Card.Header className="d-flex align-items-center py-3">
          <div className="notebook-ring-name" style={{
            fontSize: "1.1rem",
          }}>
            {ring?.name}
          </div>
          <div className="ms-auto">
            <Button variant="outline-danger" size="sm" onClick={() => deletePanel()} className="me-1">Delete</Button>
            <Button variant="outline-success" size="sm" className="me-1" onClick={() => updatePanel({ description: panelDescription, ringId: ring.id, results, filters })}>Save</Button>
            <AccordionToggleButton eventKey={panel.id} callback={() => setPanelCollapsed(!collapsed)} />
          </div>
        </Card.Header>
        <Accordion.Collapse eventKey={panel.id}>
          <>
            <Card.Body className="p-0 mx-0">
              <Form.Control
                type="textarea"
                onClick={(event) => {
                  event.stopPropagation();
                }}
                placeholder="Your Panel Description Here"
                onChange={(event) => {
                  setPanelDescription(event.target.value);
                }}
                value={panelDescription}
                style={{
                  fontSize: "0.9rem",
                }}
                className="border-0 bg-light border-bottom p-3 panel-description font-italic text-muted"
              />

              <Filters
                panelId={panel.id}
              />
              <div className="p-0 bg-light border-bottom border-top">
                <Loader animation="border" contentHeight={resultsCollapsed ? "60px" : "400px"} isVisible={loadingPanelResults}>
                  <>
                    {results && (

                      <Accordion defaultActiveKey={resultsCollapsed === true ? "results-summary" : "results"}>
                        <Accordion.Collapse eventKey="results">
                          <>
                            <div style={{ height: 400, width: "100%", overflowX: "hidden" }}>
                              <DataGrid
                                onPageChange={(page) => {
                                  getPanelResults(
                                    [],
                                    // @ts-ignore
                                    page
                                  )
                                }
                                }
                                rows={rows}
                                columns={columns}
                                page={results?.page}
                                pageSize={results?.batchSize}
                                rowCount={results?.totalCount}
                                checkboxSelection={false}
                                className="bg-white border-0 rounded-0"
                              />
                            </div>
                            <div className="p-3">
                              Displaying 1-10 of {results?.totalCount} Dockets
                              <ResultsToggler eventKey="results-summary" callback={() => setPanelResultsCollapsed(!resultsCollapsed)}>
                                (collapse)
                              </ResultsToggler>
                            </div>
                          </>
                        </Accordion.Collapse>
                        <Accordion.Collapse eventKey="results-summary">
                          <div className="p-3">
                            Available data based on filters: {results?.totalCount} Dockets
                            <ResultsToggler eventKey="results" callback={() => setPanelResultsCollapsed(!resultsCollapsed)}>
                              (expand to browse data)
                            </ResultsToggler>
                          </div>
                        </Accordion.Collapse>
                      </Accordion>

                    )}
                  </>
                </Loader>
              </div>
              <div className="bg-white p-3">

              </div>
              <div className="bg-white p-3">
                <Col>
                  <Analysis panel={panel} ring={ring} info={info} />
                </Col>
              </div>

            </Card.Body>
            <Card.Footer className="d-flex align-items-center py-3">
              Analysis
            </Card.Footer>
          </>
        </Accordion.Collapse>

      </Card>
    </Accordion>
  );
};

export default Panel;
