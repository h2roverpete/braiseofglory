import {createContext, useContext, useState} from "react";
import './Editor.css';

export const FormEditContext = createContext(null);

export default function FormEditor({children}) {

  const [originalData, setOriginalData] = useState(null);
  const [edits, setEdits] = useState({});
  const [touched, setTouched] = useState([]);

  function onDataChanged({name, value, changes}) {
    if (changes && Array.isArray(changes)) {
      for (const change of changes) {
        onDataChanged(change);
      }
    } else if (name && edits[name] !== value) {
      console.debug(`Form data changed: {name:${name} value: ${value}}.`);
      if ((value === undefined || value === null) && edits[name]) {
        const copy = {...edits};
        delete copy[name];
        setEdits(copy);
      } else {
        setEdits({
          ...edits,
          [name]: value
        });
      }
      setTouched([
        ...touched,
        name
      ]);
      console.debug(`Form edits: ${JSON.stringify(edits)}`);
    }
  }

  /**
   * Update the original data and clear edits, i.e. after a DynamoDB update.
   * @param data {Object} data being edited.
   */
  function update(data) {
    setEdits(data);
    setOriginalData(data);
    setTouched([]);
  }

  function isTouched(name) {
    if (name) {
      return touched.includes(name);
    }
  }

  function isDataChanged() {
    return JSON.stringify(edits) !== JSON.stringify(originalData);
  }

  function revert() {
    setEdits({...originalData});
    setTouched([]);
  }

  return (
    <FormEditContext.Provider value={{
      edits: edits,
      FormData: {
        isTouched: isTouched,
        isDataChanged: isDataChanged,
        revert: revert,
        update: update,
        onDataChanged: onDataChanged
      }
    }}>
      {children}
    </FormEditContext.Provider>
  )
}

export function useFormEditor() {
  return useContext(FormEditContext);
}