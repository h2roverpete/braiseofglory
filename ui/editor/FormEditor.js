import {createContext, useCallback, useContext, useState} from "react";
import './Editor.css';

const FormEditContext = createContext(null);

/**
 * @template T
 * @typedef FormDataAPI
 *
 * @property {function(T)} setData
 * @property {function(string)} isTouched
 * @property {function()} isDataChanged
 * @property {function()} revert
 * @property {function(T)} update
 * @property {DataCallback} onDataChanged
 * @property {T} edits
 */

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
   * Set initial form data.
   * @param data {Object} data being edited.
   */
  function setData(data) {
    if (data && !originalData) {
      // protect from null data & multiple initialization
      update(data);
    }
  }

  /**
   * Update the original form data and clear edits, i.e. after a DynamoDB update.
   * @param data {Object} data being edited.
   */
  const update = useCallback((data) => {
    setEdits(data);
    setOriginalData(data);
    setTouched([]);
  }, [setEdits, setOriginalData, setTouched]);

  const isTouched = useCallback((name) => {
    if (name) {
      return touched.includes(name);
    }
  }, [touched]);

  const isDataChanged = useCallback(() => {
    return JSON.stringify(edits) !== JSON.stringify(originalData);
  }, [edits, originalData]);

  const revert = useCallback(() => {
    setEdits({...originalData});
    setTouched([]);
  }, [setEdits, setTouched, originalData]);

  const context = {
    edits: edits,
    FormData: {
      setData: setData,
      isTouched: isTouched,
      isDataChanged: isDataChanged,
      revert: revert,
      update: update,
      onDataChanged: onDataChanged,
      edits: edits,
    }
  }

  return (
    <FormEditContext.Provider value={context}>
      {children}
    </FormEditContext.Provider>
  )
}

export function useFormEditor() {
  return useContext(FormEditContext);
}

/**
 * @template T
 * @returns {FormDataAPI<T>}
 */
export function useFormData() {
  return useContext(FormEditContext).FormData
}