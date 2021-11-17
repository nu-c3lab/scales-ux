import React, { FunctionComponent, ReactNode, useState } from "react";

import { Dropdown } from "react-bootstrap";
import type { FilterInput } from "../NotebookContext";
import { useEffect } from "react";
import { useNotebookContext } from "../NotebookContext";

type FilterColumn = {
  key: string;
  nicename: string;
};

type Props = {
  filterInput: FilterInput;
};

const FilterTypeDropDown: FunctionComponent<Props> = (props) => {
  const { filterInput } = props;
  const { id, type } = filterInput;
  const { filterInputs, setFilterInputs, getFiltersNormalized } =
    useNotebookContext();
  console.log(getFiltersNormalized);
  const [filter, setFilter] = useState<FilterColumn>({
    key: type,
    nicename: type,
  });

  useEffect(() => {
    try {
      if (filter) {
        setFilterInputs((prevFilterInputs: Array<FilterInput>) => {
          return [
            ...prevFilterInputs.filter(
              (filterInput: FilterInput) => filterInput.id !== id
            ),
            { ...filterInput, type: filter.key },
          ];
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, [filter]);

  const filtersToRender = getFiltersNormalized()?.map((filter) => {
    const { allowMultiple, key } = filter;
    if (
      allowMultiple === false &&
      filterInputs.some((filterInput: FilterInput) => filterInput.type === key)
    ) {
      return { ...filter, disabled: true };
    }

    return filter;
  });

  return (
    <Dropdown className="filter-type-dropdown">
      <Dropdown.Toggle
        size="sm"
        variant="link"
        className="shadow-none text-decoration-none small"
      >
        {filter?.nicename || ""}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.ItemText className="text-muted fs-6 ms-3">
          <small>Select a filter type...</small>
        </Dropdown.ItemText>
        {filtersToRender?.map(({ key, nicename, desc, disabled }) => (
          <React.Fragment key={key}>
            <Dropdown.Divider />
            <Dropdown.Item
              onClick={() => setFilter({ key, nicename })}
              disabled={disabled}
            >
              <Dropdown.ItemText className={disabled ? "text-muted" : ""}>
                {nicename}
              </Dropdown.ItemText>
              {desc && (
                <Dropdown.ItemText className="text-muted fs-6">
                  <small>{desc}</small>
                </Dropdown.ItemText>
              )}
            </Dropdown.Item>
          </React.Fragment>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default FilterTypeDropDown;
