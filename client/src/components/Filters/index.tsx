import React, { FunctionComponent } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Filter from "./Filter";
import uniqid from "uniqid";
import { usePanel } from "../../store/panels";
import "./Filters.scss";

type FiltersProps = {
  panelId: string;
}

const Filters: FunctionComponent<FiltersProps> = ({ panelId }) => {
  const { filters = [], setPanelFilters, getPanelResults } = usePanel(panelId);

  return (
    <div className="notebook-filters bg-white p-3 pt-4 mx-0">
      {filters?.map((filter, key) => (
        <Filter key={key} panelId={panelId} filter={filter} />
      ))}
      <div className="d-inline-block">
        <Button
          variant="outline-dark"
          className="me-2"
          onClick={() => {
            setPanelFilters([...(filters || []), { id: uniqid(), value: "" }]);
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
        </Button>
        {filters?.length > 0 ? (
          <Button
            variant="primary"
            className="text-white"
            onClick={() => getPanelResults(filters)}
          >
            Update Results
          </Button>
        ) : (
          <>Add a filter</>
        )}
      </div>
    </div >
  );
};

export default Filters;
