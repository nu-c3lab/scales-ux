import React, { FunctionComponent, useState } from "react";
import { FormControl, InputGroup } from "react-bootstrap";
import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";
import FilterTypeDropDown from "./FitlerTypeDropDown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import uniqid from "uniqid";
import { usePanel } from "../../store/panels";
import { useRing } from "../../store/rings";
import { DATE_FORMAT } from "../../constants";
import { useNotify } from "../../components/Notifications";
import config from "config";

export type Filter = {
  id: string;
  value: string | number;
  type: string;
};

type Props = {
  filter: Filter;
  panelId: string;
};

const Filter: FunctionComponent<Props> = ({ panelId, filter }) => {
  const { panel, filters, setPanelFilters, getPanelResults } = usePanel(panelId);
  const { ring, info } = useRing(panel.ringId);
  const { type, id, value } = filter;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<string[]>([]);
  const [dateValue, setDateValue] = useState<string>("");
  const { notify } = useNotify();

  const setFilter = (filter: Filter) => {
    try {
      const newFilters = [
        ...filters.filter(
          (prevFilterInput: Filter) =>
            prevFilterInput.id !== filter.id
        ),
        { ...filter },
      ];
      setPanelFilters(newFilters);
    } catch (error) {
      console.log(error);
    }
  };

  const getFilterInputById = (id: string) => {
    try {
      return filters?.find(
        (filter: Filter) => filter.id === id
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getFilterColumnByKey = (key: string) => {
    try {
      return info?.columns?.find((column) => column.key == key);
    } catch (error) {
      console.log(error);
    }
  };

  const getFilterOptionsByKey = (key) => {
    try {
      return info?.filters?.find((filter) => filter.includes(key))[1];
    } catch (error) {
      console.log(error);
    }
  };

  const getFiltersNormalized = () => {
    try {
      return info?.filters
        .map((filter) => ({ key: filter[0], ...filter[1] }))
        .sort((a, b) => a.key.localeCompare(b.key));
    } catch (error) {
      console.log(error);
    }
  };

  const filterColumn = getFilterColumnByKey(type);
  const filterOptions = getFilterOptionsByKey(type);

  const fetchAutocompleteSuggestions = async (type, query) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${config.SERVER_PROXY_URL}/autocomplete/${ring.rid}/1/${info?.defaultEntity}/${type}?query=${query}`
      );
      if (response.status === 200) {
        const data = await response.json();
        setAutoCompleteSuggestions(data);
        setIsLoading(false);
      } else {
        notify("Could not fetch autocomplete suggestions", "error");
      }
    } catch (error) {
      console.log(error);
      notify("Could not fetch autocomplete suggestions", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const filterTypeRange = (
    <>
      <FormControl
        placeholder="min"
        min="0"
        type="number"
        className="filter-range-input"
      />
      <InputGroup.Text>-</InputGroup.Text>
      <FormControl
        placeholder="max"
        type="number"
        max="99999"
        className="filter-range-input"
      />
    </>
  );

  const filterTypeRender = (filterType: string, value: string | number) => {
    switch (filterType) {
      case "range":
        return filterTypeRange;

      case "date":
        return (
          <DateTimeRangePicker
            format={DATE_FORMAT}
            onChange={(value) => {
              setDateValue(value);
              setFilter({ ...filter, value: value });
            }}
            value={dateValue}
          />
        );

      default:
        return (
          <>
            {filterOptions?.autocomplete ? (
              <AsyncTypeahead
                id={uniqid()}
                filterBy={() => true}
                isLoading={isLoading}
                labelKey={null}
                minLength={3}
                onSearch={(query) =>
                  fetchAutocompleteSuggestions(filter.type, query)
                }
                options={autoCompleteSuggestions.map(String)}
                placeholder="Search..."
                defaultInputValue={value}
                onBlur={(event) =>
                  setFilter({ ...filter, value: event.target.value })
                }
              />
            ) : filter.type === "causeOfAction" ? (
              filterTypeRange
            ) : (
              <FormControl
                className="border-end-0"
                size="sm"
                onChange={(event) => {
                  if (!filter) {
                    return false;
                  }
                  setFilter({ ...filter, value: event.target.value });
                }}
                value={value}
              />
            )}
          </>
        );
    }
  };

  return (
    <div className="d-inline-block me-3">
      <InputGroup className="mb-3">
        <InputGroup.Text className="bg-white">
          <FilterTypeDropDown
            filter={filter}
            getFilterOptionsByKey={getFilterOptionsByKey}
            filters={filters}
            getFiltersNormalized={getFiltersNormalized}
            setFilter={setFilter} />
        </InputGroup.Text>
        {filterTypeRender(filterOptions?.type, value)}
        <InputGroup.Text
          className="cursor-pointer bg-transparent"
          onClick={async () => {
            const newFilters = [
              ...filters.filter(
                (filter: Filter) => filter.id !== id
              ),
            ];
            setPanelFilters(newFilters);
            getPanelResults(newFilters);
          }}
        >
          <FontAwesomeIcon icon={faTimesCircle} className="text-muted" />
        </InputGroup.Text>
      </InputGroup>
    </div>
  );
};

export default Filter;
