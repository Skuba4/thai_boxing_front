import { useState } from "react";
import type { GridModalProps } from "../../homePanelTypes";
import { GRID_NAME_GROUPS } from "../../gridNames";
import { FormModal, ModalActions, SubmitButton } from "./Modal";

function normalizeGridNameSearch(value: string) {
  return value
    .toLocaleLowerCase("ru")
    .replace(/[(),+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function GridModal({
  gridForm,
  grids,
  selectedBoxers,
  submitState,
  submitLabel = "Отправить",
  onClose,
  onFieldChange,
  onSubmit,
}: GridModalProps) {
  const [gridNameSearch, setGridNameSearch] = useState("");
  const existingGridNames = new Set(grids.map((grid) => grid.name));
  const normalizedSearch = normalizeGridNameSearch(gridNameSearch);
  const searchTokens = normalizedSearch.split(" ").filter(Boolean);
  const filteredGridNameGroups = normalizedSearch
    ? GRID_NAME_GROUPS.map((group) => ({
      ...group,
      names: group.names.filter((name) => {
        const normalizedName = normalizeGridNameSearch(name);
        return searchTokens.every((token) => normalizedName.includes(token));
      }),
    })).filter((group) => group.names.length > 0)
    : GRID_NAME_GROUPS;
  
  return (
    <FormModal
      className="modal-window-grid"
      closeDisabled={submitState === "loading"}
      onClose={onClose}
      onSubmit={onSubmit}
      formClassName="modal-form modal-form-compact"
    >
            <input
              className="boxers-search grid-name-search"
              type="search"
              placeholder="Поиск"
              value={gridNameSearch}
              onChange={(event) => setGridNameSearch(event.target.value)}
            />
            <div className="grid-name-groups">
              {filteredGridNameGroups.map((group) => (
                <section className="grid-name-group" key={group.title}>
                  <h4>{group.title}</h4>
                  <div className="grid-name-options">
                    {group.names.map((name) => {
                      const exists = existingGridNames.has(name);
                      const isSelected = gridForm.name === name;

                      return (
                        <button
                          className={[
                            "grid-name-option",
                            exists ? "grid-name-option-existing" : "",
                            isSelected ? "grid-name-option-selected" : "",
                          ].filter(Boolean).join(" ")}
                          key={name}
                          type="button"
                          onClick={() => onFieldChange("name", name)}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <ModalActions centered>
              <SubmitButton loading={submitState === "loading"} disabled={selectedBoxers.length === 0 || !gridForm.name.trim()}>
                {submitLabel}
              </SubmitButton>
            {selectedBoxers.length ? (
              <span className="grid-preview-badge">{selectedBoxers.length}</span>
            ) : null}
          </ModalActions>
    </FormModal>
  );
}
